from __future__ import annotations
import datetime as _dt
import uuid
from typing import Any, Dict

from .base import PaymentProvider
from app.models import TransferRequest


class MockPaymentProvider(PaymentProvider):
    def send_transfer(self, transfer: TransferRequest) -> Dict[str, Any]:
        return {
            "status": "success",
            "provider": "mock",
            "transaction_id": str(uuid.uuid4()),
            "processed_at": _dt.datetime.utcnow().isoformat() + "Z",
            "amount": transfer.amount,
            "currency": transfer.currency,
        }