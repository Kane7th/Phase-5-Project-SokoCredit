import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from .extensions import db, migrate, jwt
from app.models import User, Customer, Loan, LoanProduct, Repayment, RepaymentSchedule


def create_app(config="config.default_config.DefaultConfig"):
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Enable CORS for frontend origin
    CORS(app, resources={r"/auth/*": {"origins": "http://localhost:5173"}})

    from app.routes.customers import customers_bp
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.loan_routes import loan_bp, loan_product_bp
    from app.routes.notifications import notifications_bp
    from app.models.notification import Notification

    
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(customers_bp, url_prefix='/customers')
    app.register_blueprint(loan_bp)
    app.register_blueprint(loan_product_bp)
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')

    # Error handlers
    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({"msg": "File too large (max 10MB)"}), 413

    return app

