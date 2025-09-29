'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYS_DIR = path.join(process.cwd(), 'data', 'keys');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'ed25519_private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'ed25519_public.pem');

function ensureDirectories() {
  fs.mkdirSync(KEYS_DIR, { recursive: true });
}

function ensureKeypair() {
  ensureDirectories();
  let privateKeyPem;
  let publicKeyPem;
  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
    publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
    privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKeyPem, { encoding: 'utf8', mode: 0o600 });
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKeyPem, { encoding: 'utf8' });
  } else {
    privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    publicKeyPem = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
  }

  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const publicKey = crypto.createPublicKey(publicKeyPem);
  return { privateKey, publicKey, privateKeyPem, publicKeyPem };
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

function createReceipt(payment) {
  const receipt = {
    version: '1.0',
    issuer: 'TobiasPay Demo',
    issuedAt: new Date().toISOString(),
    receiptId: crypto.randomUUID(),
    payment: {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      to: payment.to,
      from: payment.from,
      note: payment.note,
      createdAt: payment.createdAt,
      rail: 'simulator'
    }
  };
  return receipt;
}

function signReceipt(receipt, privateKey) {
  const payload = Buffer.from(canonicalize(receipt));
  const signature = crypto.sign(null, payload, privateKey);
  return signature.toString('base64');
}

function verifyReceipt(receipt, signatureB64, publicKey) {
  const payload = Buffer.from(canonicalize(receipt));
  const signature = Buffer.from(signatureB64, 'base64');
  return crypto.verify(null, payload, publicKey, signature);
}

module.exports = {
  ensureKeypair,
  canonicalize,
  createReceipt,
  signReceipt,
  verifyReceipt
};

