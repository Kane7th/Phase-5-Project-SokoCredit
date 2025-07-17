import pytest
from app import create_app
from app.extensions import db
from app.models.customer import Customer
from app.models.user import User
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app("config.test_config.TestConfig")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def headers_admin():
    access_token = create_access_token(identity="user_1:admin")
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def headers_lender():
    access_token = create_access_token(identity="user_2:lender")
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def headers_mboga():
    access_token = create_access_token(identity="user_3:mama_mboga")
    return {"Authorization": f"Bearer {access_token}"}
