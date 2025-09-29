## TobiasPay Demo (Compliant Sandbox)

This demo simulates payments (no real funds moved) and generates cryptographically signed receipts plus a tamper-evident append-only audit log. It also exposes endpoints to verify receipt signatures and audit log integrity.

### Features
- Simulator payment endpoint: `POST /api/payments/simulate`
- Ed25519-signed receipts
- Append-only SHA-256 chained audit log in `data/audit.log`
- Verify signature: `POST /api/verify/signature`
- Verify log integrity: `GET /api/verify/log`
- Static UI at `/`

### Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Run in development
   ```bash
   npm run dev
   ```
   Or start normally:
   ```bash
   npm start
   ```
3. Open the UI at `http://localhost:3000`.

### Security Notes
- Keys are generated locally into `data/keys/` on first run for demo only. Do not use this setup in production.
- Receipts are signed over a canonical JSON encoding of the receipt payload.
- Audit log is tamper-evident via chained hashes.

### Environment
- Copy `.env.example` to `.env` to set overrides like `PORT`.

### License
MIT (for demo purposes only)

