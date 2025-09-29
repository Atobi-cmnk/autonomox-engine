# Simple Money Transfer (Demo)

This is a minimal Flask demo that collects sender/receiver bank details (BSB/account/SWIFT/IBAN) and performs a mock transfer. It is for demo purposes only.

## ⚠️ Important
- Do not use this in production. Banking data requires strict security and compliance (PCI DSS, SOC2, KYC/AML).
- In this demo, transfers are mocked. You can integrate a real provider (e.g. Wise) by implementing a provider and setting environment variables.

## Requirements
- Python 3.11+

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python wsgi.py
```

Visit `http://localhost:5000/`.

## Environment
- `SECRET_KEY` – Flask session secret
- `PAYMENT_PROVIDER` – `mock` (default) or `wise` (when implemented)
- `WISE_API_KEY` – API key for Wise Sandbox

## Development
- App entrypoint: `wsgi.py`
- Flask app factory: `app/__init__.py`
- Routes: `app/routes.py`
- Models/validation: `app/models.py`
- Templates: `app/templates/`
- Static: `app/static/`

## Provider abstraction
Implement `PaymentProvider` in `app/payment_providers/base.py`. The mock provider lives in `app/payment_providers/mock.py`.

To add Wise later, create `app/payment_providers/wise.py` and switch `PAYMENT_PROVIDER=wise`.