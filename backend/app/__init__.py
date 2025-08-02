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
    
    # Logging incoming requests for debugging
    @app.before_request
    def log_request_info():
        print(f"Incoming request: {request.method} {request.path}")
        print(f"Headers: {dict(request.headers)}")
        if request.method in ['POST', 'PUT', 'PATCH']:
            print(f"Body: {request.get_data()}")

   # Cross-Origin Resource Sharing (CORS) Setup
    cors_origins = ["http://localhost:5173"]
    cors_headers = [
        "Content-Type", "Authorization", "X-Requested-With", "Accept",
        "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"
    ]

    CORS(
        app,
        resources={
            r"/api/*": {"origins": [
         "http://localhost:5173", "http://127.0.0.1:5173"
            ]}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=cors_headers
    )

    # Global after-request handler for ensuring proper CORS headers
    @app.after_request
    def cors_after_request(response):
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Headers"] = ", ".join(cors_headers)
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        return response
    
    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # # Enable CORS for /api/* with correct origin and headers
    # def cors_after_request(response):
    #     # Remove duplicate Access-Control-Allow-Credentials headers if any
    #     if 'Access-Control-Allow-Credentials' in response.headers:
    #         response.headers.pop('Access-Control-Allow-Credentials')
    #     # Remove duplicate Access-Control-Allow-Origin headers if any
    #     if 'Access-Control-Allow-Origin' in response.headers:
    #         response.headers.pop('Access-Control-Allow-Origin')
    #     # Remove duplicate Access-Control-Allow-Headers headers if any
    #     if 'Access-Control-Allow-Headers' in response.headers:
    #         response.headers.pop('Access-Control-Allow-Headers')
    #     response.headers.add("Access-Control-Allow-Credentials", "true")
    #     response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    #     response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
    #     return response

    # app.after_request(cors_after_request)

    # Initialize socketio
    socketio.init_app(app, cors_allowed_origins="http://localhost:5173")

    # Register Blueprints with /api prefix where applicable
    from app.routes.customers import customers_bp
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.loan_routes import loan_bp, loan_product_bp
    from app.routes.repayment_routes import repayment_bp
    from app.routes.paypal.paypal_route import paypal_bp
    from app.routes.notifications import notifications_bp
    from app.routes.analytics import analytics_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(loan_bp)
    app.register_blueprint(loan_product_bp)
    app.register_blueprint(repayment_bp)
    app.register_blueprint(paypal_bp)
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