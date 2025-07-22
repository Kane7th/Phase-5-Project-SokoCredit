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
    
    serialize_rules = ('-loans')
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    interest_rate = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Float, nullable=False)
    max_amount = db.Column(db.Float, nullable=False)
    frequency = db.Column(Enum(RepaymentFrequencies), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    loans = db.relationship('Loan', back_populates='loan_product', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<LoanProduct id={self.id} name={self.name} interest={self.interest_rate}% duration={self.duration_months}mnths>"