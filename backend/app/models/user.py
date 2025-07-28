from app.extensions import db
from passlib.hash import pbkdf2_sha256
from sqlalchemy_serializer import SerializerMixin

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = ('-customer_profile.user', '-loans', '-issued_loans')

    id = db.Column(db.Integer, primary_key=True)

    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=False)

    username = db.Column(db.String(80), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='customer', nullable=False)

    # Loans where user is the borrower
    loans = db.relationship("Loan", foreign_keys="Loan.customer_id", back_populates="customer")

    # Loans where user is the lender
    issued_loans = db.relationship("Loan", foreign_keys="Loan.lender_id", back_populates="lender")

    # Repayments made by the customer
    repayments = db.relationship("Repayment", back_populates="customer", cascade="all, delete-orphan")

    # Customers created by this user (if role is lender/admin)
    created_customers = db.relationship(
        'Customer',
        back_populates='created_by_user',
        foreign_keys='Customer.created_by'
    )

    # Link to customer's profile
    customer_profile = db.relationship(
        'Customer',
        back_populates='customer_user',
        foreign_keys='Customer.customer_user_id',  #  Updated from mama_mboga_user_id
        uselist=False
    )

    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)

    def __repr__(self):
        return f'<User id={self.id} username={self.username} role={self.role}>'
