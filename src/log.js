'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(process.cwd(), 'data');
const LOG_PATH = path.join(DATA_DIR, 'audit.log');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => JSON.parse(canonicalize(v)));
    return JSON.stringify(items);
  }
  const sortedKeys = Object.keys(value).sort();
  const obj = {};
  for (const k of sortedKeys) {
    if (typeof value[k] === 'undefined') continue;
    obj[k] = JSON.parse(canonicalize(value[k]));
  }
  return JSON.stringify(obj);
}

function computeHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function appendEntry(core) {
  ensureDataDir();
  let prevHash = 'GENESIS';
  let index = 0;
  if (fs.existsSync(LOG_PATH)) {
    const lines = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(Boolean);
    if (lines.length > 0) {
      const last = JSON.parse(lines[lines.length - 1]);
      prevHash = last.entryHash;
      index = last.index + 1;
    }
  }
  const timestamp = new Date().toISOString();
  const entryCore = { index, timestamp, ...core };
  const toHash = prevHash + canonicalize(entryCore);
  const entryHash = computeHash(toHash);
  const entry = { ...entryCore, prevHash, entryHash };
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  return entry;
}

function verifyLog() {
  ensureDataDir();
  if (!fs.existsSync(LOG_PATH)) {
    return { ok: true, entries: 0, reason: 'empty' };
  }
  const lines = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(Boolean);
  let prevHash = 'GENESIS';
  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);
    const { prevHash: recordedPrev, entryHash, index, ...rest } = entry;
    if (recordedPrev !== prevHash) {
      return { ok: false, entries: i, reason: 'prevHash mismatch at index ' + i };
    }
    const recomputed = computeHash(prevHash + canonicalize({ index, ...rest }));
    if (recomputed !== entryHash) {
      return { ok: false, entries: i + 1, reason: 'hash mismatch at index ' + i };
    }
    prevHash = entryHash;
  }
  return { ok: true, entries: lines.length, lastHash: prevHash };
}

module.exports = {
  appendEntry,
  verifyLog,
  LOG_PATH
};

