from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from sqlalchemy import Enum
from enum import Enum as pyEnum

class LoanStatus(pyEnum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'
    disbursed = 'disbursed'
    completed = 'completed'
    overdue = 'overdue'

class Loan(db.Model, SerializerMixin):
    __tablename__ = 'loans'

    serialize_rules = (
        '-customer', 
        '-lender', 
        '-repayments', 
        '-loan_product'
    )

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Float, nullable=False)
    status = db.Column(Enum(LoanStatus), default=LoanStatus.pending, nullable=False)

    issued_date = db.Column(db.DateTime)
    approved_date = db.Column(db.DateTime)
    disbursed_date = db.Column(db.DateTime)
    rejected_reason = db.Column(db.String)

    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    loan_product_id = db.Column(db.Integer, db.ForeignKey('loan_products.id'))

    loan_product = db.relationship('LoanProduct', back_populates='loans')
    customer = db.relationship('User', back_populates='loans', foreign_keys=[customer_id])
    lender = db.relationship("User", back_populates="issued_loans", foreign_keys=[lender_id])
    repayments = db.relationship("Repayment", back_populates="loan", cascade="all, delete-orphan")
    repayment_schedules = db.relationship('RepaymentSchedule', back_populates='loan', cascade='all, delete-orphan')

    @property
    def total_repaid(self):
        return sum(r.amount_paid for r in self.repayments)

    def __repr__(self):
        return (
            f'<Loan id={self.id} amount={self.amount} '
            f'status={self.status} customer_id={self.customer_id} lender_id={self.lender_id}>'
        )
