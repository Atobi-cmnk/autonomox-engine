from typing import Any, Dict
from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for

from .models import BankDetails, Party, TransferRequest
from .payment_providers.mock import MockPaymentProvider


bp = Blueprint("main", __name__)


def get_provider():
    provider_name = current_app.config.get("PAYMENT_PROVIDER", "mock")
    if provider_name == "mock":
        return MockPaymentProvider()
    # Default to mock for now; can extend to Wise when configured
    return MockPaymentProvider()


@bp.get("/")
def index():
    return redirect(url_for("main.transfer_form"))


@bp.route("/transfer", methods=["GET", "POST"])
def transfer_form():
    if request.method == "POST":
        form = request.form
        try:
            sender_bank = BankDetails(
                country=form.get("sender_country") or "AU",
                bsb=form.get("sender_bsb") or None,
                swift_code=form.get("sender_swift") or None,
                iban=form.get("sender_iban") or None,
                account_number=form.get("sender_account") or None,
            )
            receiver_bank = BankDetails(
                country=form.get("receiver_country") or "AU",
                bsb=form.get("receiver_bsb") or None,
                swift_code=form.get("receiver_swift") or None,
                iban=form.get("receiver_iban") or None,
                account_number=form.get("receiver_account") or None,
            )

            sender = Party(name=(form.get("sender_name") or "").strip(), bank=sender_bank)
            receiver = Party(name=(form.get("receiver_name") or "").strip(), bank=receiver_bank)

            amount_value = float(form.get("amount"))

            tr = TransferRequest(
                sender=sender,
                receiver=receiver,
                amount=amount_value,
                currency=form.get("currency") or "AUD",
                reference=(form.get("reference") or "").strip() or None,
            )

            provider = get_provider()
            result: Dict[str, Any] = provider.send_transfer(tr)
            return render_template("transfer_result.html", result=result, tr=tr)
        except Exception as exc:
            flash(str(exc), "error")

    return render_template("transfer_form.html")