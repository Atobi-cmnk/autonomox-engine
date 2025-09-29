from flask import Flask
from .config import load_config


def create_app() -> Flask:
    app = Flask(__name__)
    load_config(app)

    from .routes import bp as main_bp
    app.register_blueprint(main_bp)

    return app