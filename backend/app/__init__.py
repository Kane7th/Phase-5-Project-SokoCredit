import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from .extensions import db, migrate, jwt, socketio
from app.models import User, Customer, Loan, LoanProduct, Repayment, RepaymentSchedule

def create_app(config="config.default_config.DefaultConfig"):
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Enable CORS
    CORS(app, resources={r"/api/auth/*": {"origins": "http://localhost:5173"}, r"/api/customers/*": {"origins": "http://localhost:5173"}})

    # Initialize socketio
    socketio.init_app(app)

    # Register Blueprints
    from app.routes.customers import customers_bp
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.loan_routes import loan_bp, loan_product_bp
    from app.routes.repayment_routes import repayment_bp
    from app.routes.mpesa.test_mpesa_route import test_bp
    from app.routes.mpesa.views import mpesa_bp
    from app.routes.mpesa.callbacks import callback_bp
    from app.routes.notifications import notifications_bp
    from app.routes.analytics import analytics_bp
    from app.models.notification import Notification

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(loan_bp)
    app.register_blueprint(loan_product_bp)
    app.register_blueprint(repayment_bp)
    app.register_blueprint(test_bp)
    app.register_blueprint(mpesa_bp)
    app.register_blueprint(callback_bp)
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')
    app.register_blueprint(analytics_bp)

    # Import NotificationNamespace after socketio is ready
    from app.sockets.notifications_socket import NotificationNamespace
    socketio.on_namespace(NotificationNamespace('/notifications'))


    # Error handlers
    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({"msg": "File too large (max 10MB)"}), 413

    return app
