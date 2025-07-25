import os
from .default_config import DefaultConfig

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret"
    JWT_SECRET_KEY = "test-jwt-secret"

    MPESA_CONSUMER_KEY = "test-consumer-key"
    MPESA_CONSUMER_SECRET = "test-consumer-secret"
    MPESA_SHORTCODE = "174379"
    MPESA_PASSKEY = "dummy_passkey"
    MPESA_CALLBACK_URL = "https://test-callback.com"