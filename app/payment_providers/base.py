from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Any, Dict

from app.models import TransferRequest


class PaymentProvider(ABC):
    @abstractmethod
    def send_transfer(self, transfer: TransferRequest) -> Dict[str, Any]:
        raise NotImplementedError