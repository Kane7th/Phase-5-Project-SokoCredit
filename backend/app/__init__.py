import os
from flask import Flask
from dotenv import load_dotenv
from .extensions import db, migrate, jwt
from app.routes.auth import auth_bp
from app.models.user import User
from app.models.customer import Customer


def create_app(config="config.default_config.DefaultConfig"):
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.routes.customers import customers_bp

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(customers_bp, url_prefix='/customers')

    return app

