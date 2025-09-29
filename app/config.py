import os
from dotenv import load_dotenv
from flask import Flask


def load_config(app: Flask) -> None:
    load_dotenv()

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["PAYMENT_PROVIDER"] = os.getenv("PAYMENT_PROVIDER", "mock")
    app.config["WISE_API_KEY"] = os.getenv("WISE_API_KEY")