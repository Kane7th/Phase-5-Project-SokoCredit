import os
from flask import Flask
from dotenv import load_dotenv
from .extensions import db, migrate, jwt
from app.routes.auth import auth_bp
from app.models import user 

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app
