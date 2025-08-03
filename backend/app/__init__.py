import os
import logging
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from .extensions import db, migrate, jwt, socketio
from app.models import User, Customer, Loan, LoanProduct, Repayment, RepaymentSchedule

def create_app(config="config.default_config.DefaultConfig"):

    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config)

    @app.before_request
    def log_request_info():
        print(f"Incoming request: {request.method} {request.path}")
        print(f"Headers: {dict(request.headers)}")
        if request.method in ['POST', 'PUT', 'PATCH']:
            print(f"Body: {request.get_data()}")

    # Remove previous CORS configurations and use a single comprehensive configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": "http://localhost:5173",
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "content-type", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
            "supports_credentials": True,
            "expose_headers": ["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
            "max_age": 86400
        }
    })

    # Global OPTIONS handler to ensure CORS headers on preflight requests
    @app.before_request
    def handle_options_requests():
        if request.method == 'OPTIONS':
            response = jsonify({})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
            response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            response.headers.add("Access-Control-Max-Age", "86400")
            return response

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Enable CORS for /api/* with correct origin and headers
    def cors_after_request(response):
        # Remove duplicate Access-Control-Allow-Credentials headers if any
        if 'Access-Control-Allow-Credentials' in response.headers:
            response.headers.pop('Access-Control-Allow-Credentials')
        # Remove duplicate Access-Control-Allow-Origin headers if any
        if 'Access-Control-Allow-Origin' in response.headers:
            response.headers.pop('Access-Control-Allow-Origin')
        # Remove duplicate Access-Control-Allow-Headers headers if any
        if 'Access-Control-Allow-Headers' in response.headers:
            response.headers.pop('Access-Control-Allow-Headers')
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
        return response

    app.after_request(cors_after_request)

    # Initialize socketio
    socketio.init_app(app, cors_allowed_origins="http://localhost:5173")

    # Register Blueprints with /api prefix where applicable
    from app.routes.customers import customers_bp
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.loan_routes import loan_bp, loan_product_bp
    # from app.routes.loan_comment_routes import loan_comment_bp
    from app.routes.repayment_routes import repayment_bp
    from app.routes.mpesa.test_mpesa_route import test_bp
    from app.routes.mpesa.views import mpesa_bp
    from app.routes.mpesa.callbacks import callback_bp
    from app.routes.notifications import notifications_bp
    from app.routes.analytics import analytics_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(loan_bp, url_prefix='/api/loans')
    app.register_blueprint(loan_product_bp, url_prefix='/api/loan-products')
    # app.register_blueprint(loan_comment_bp, url_prefix='/api/loan-comments')
    app.register_blueprint(repayment_bp, url_prefix='/api/repayments')
    app.register_blueprint(test_bp)
    app.register_blueprint(mpesa_bp)
    app.register_blueprint(callback_bp)
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Import NotificationNamespace after socketio is ready
    from app.sockets.notifications_socket import NotificationNamespace
    socketio.on_namespace(NotificationNamespace('/notifications'))

    # Error handlers
    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({"msg": "File too large (max 10MB)"}), 413

    logging.basicConfig(level=logging.INFO)
    return app