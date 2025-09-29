'use strict';

const express = require('express');
const { randomUUID } = require('crypto');
const path = require('path');

const { ensureKeypair, createReceipt, signReceipt, verifyReceipt } = require('./crypto');
const { appendEntry, verifyLog } = require('./log');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// In-memory simulator store for demo purposes
const payments = new Map();

// POST /api/payments/simulate
// Body: { amount: number, currency: string, to: string, from: string, note?: string }
app.post('/api/payments/simulate', (req, res) => {
  const { amount, currency, to, from, note } = req.body || {};

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (typeof currency !== 'string' || !currency) {
    return res.status(400).json({ error: 'Invalid currency' });
  }
  if (typeof to !== 'string' || !to) {
    return res.status(400).json({ error: 'Invalid recipient' });
  }
  if (typeof from !== 'string' || !from) {
    return res.status(400).json({ error: 'Invalid sender' });
  }

  // Simulator: create a fake processor id and mark as succeeded immediately
  const id = randomUUID();
  const now = new Date().toISOString();
  const payment = {
    id,
    status: 'succeeded',
    amount,
    currency: currency.toUpperCase(),
    to,
    from,
    note: note || null,
    createdAt: now
  };
  payments.set(id, payment);

  // Generate a signed receipt and append to audit log
  const { privateKey, publicKeyPem } = ensureKeypair();
  const receipt = createReceipt(payment);
  const signature = signReceipt(receipt, privateKey);
  appendEntry({ type: 'payment', paymentId: payment.id, receiptId: receipt.receiptId, signature });

  res.json({
    payment,
    receipt,
    signature,
    publicKeyPem,
    message: 'Simulated payment succeeded (no real funds moved).'
  });
});

// GET /api/payments/:id
app.get('/api/payments/:id', (req, res) => {
  const payment = payments.get(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Not found' });
  res.json({ payment });
});

// Public key endpoint
app.get('/api/keys/public', (req, res) => {
  const { publicKeyPem } = ensureKeypair();
  res.type('text/plain').send(publicKeyPem);
});

// Verify a receipt signature
// Body: { receipt: object, signature: string }
app.post('/api/verify/signature', (req, res) => {
  const { receipt, signature } = req.body || {};
  if (!receipt || typeof signature !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing receipt or signature' });
  }
  const { publicKey } = ensureKeypair();
  const ok = verifyReceipt(receipt, signature, publicKey);
  res.json({ ok });
});

// Verify the append-only audit log integrity
app.get('/api/verify/log', (req, res) => {
  const result = verifyLog();
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`TobiasPay demo listening on http://localhost:${PORT}`);
});

