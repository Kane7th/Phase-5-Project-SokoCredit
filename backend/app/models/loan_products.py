from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from sqlalchemy import Enum
from enum import Enum as pyEnum

class RepaymentFrequencies(pyEnum):
    daily = 'daily'
    weekly = 'weekly'
    monthly = 'monthly'

class LoanProduct(db.Model, SerializerMixin):
    __tablename__ = 'loan_products'

    serialize_rules = ('-loans', '-lender.loan_products')

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    interest_rate = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Float, nullable=False)
    max_amount = db.Column(db.Float, nullable=True)
    frequency = db.Column(Enum(RepaymentFrequencies), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Link to lender

    # Lender relationship 
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lender = db.relationship("User", backref="loan_products")

    # loan product <--> loans
    loans = db.relationship(
        'Loan',
        back_populates='loan_product',
        cascade='all, delete-orphan'
    )

    lender = db.relationship('User', back_populates='loan_products')

    def __repr__(self):
        return (
            f"<LoanProduct id={self.id}, "
            f"name='{self.name}', "
            f"interest_rate={self.interest_rate}%, "
            f"duration={self.duration_months} months>"
        )
