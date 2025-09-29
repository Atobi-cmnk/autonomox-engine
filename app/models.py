from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


class BankDetails(BaseModel):
    country: Literal["AU", "US", "GB", "EU", "NZ", "CA", "SG", "IN", "OTHER"] = "AU"
    bsb: Optional[str] = None
    swift_code: Optional[str] = None
    iban: Optional[str] = None
    account_number: Optional[str] = None

    @field_validator("bsb")
    @classmethod
    def validate_bsb(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        digits_only = "".join(ch for ch in value if ch.isdigit())
        if len(digits_only) != 6:
            raise ValueError("BSB must contain exactly 6 digits")
        return digits_only

    @field_validator("swift_code")
    @classmethod
    def validate_swift(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip().upper()
        if not (8 <= len(normalized) <= 11):
            raise ValueError("SWIFT/BIC length must be 8 to 11 characters")
        return normalized

    @field_validator("iban")
    @classmethod
    def validate_iban(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.replace(" ", "").upper()
        if len(normalized) < 15 or len(normalized) > 34:
            raise ValueError("IBAN length must be between 15 and 34 characters")
        return normalized

    @field_validator("account_number")
    @classmethod
    def validate_account_number(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if len(value) < 4 or len(value) > 34:
            raise ValueError("Account number length must be between 4 and 34 characters")
        return value

    def validate_required(self) -> None:
        if self.country == "AU":
            if not self.bsb or not self.account_number:
                raise ValueError("For AU, BSB and account number are required")
        else:
            if not (self.swift_code or self.iban):
                raise ValueError("For non-AU, either SWIFT or IBAN is required")
            if not (self.account_number or self.iban):
                raise ValueError("For non-AU, account number or IBAN is required")


class Party(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    bank: BankDetails


class TransferRequest(BaseModel):
    sender: Party
    receiver: Party
    amount: float = Field(gt=0)
    currency: Literal["AUD", "USD", "EUR", "GBP", "NZD", "CAD", "SGD", "INR"] = "AUD"
    reference: Optional[str] = Field(default=None, max_length=140)

    @field_validator("sender", "receiver")
    @classmethod
    def validate_banks(cls, value: Party) -> Party:
        value.bank.validate_required()
        return value