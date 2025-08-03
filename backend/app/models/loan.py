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

    # loan applicant - customer role
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    customer = db.relationship('User', back_populates='loans', foreign_keys=[customer_id])
    
    # loan issuer via loan_product.lender_id
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lender = db.relationship("User", back_populates="issued_loans", foreign_keys=[lender_id])
    
    # Loan product to be selected by customer
    loan_product_id = db.Column(db.Integer, db.ForeignKey('loan_products.id'))
    loan_product = db.relationship('LoanProduct', back_populates='loans')
   
    repayments = db.relationship("Repayment", back_populates="loan", cascade="all, delete-orphan")
    repayment_schedules = db.relationship('RepaymentSchedule', back_populates='loan', cascade='all, delete-orphan')

    @property
    def total_repaid(self):
        return sum(r.amount_paid for r in self.repayments)

    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "interest_rate": self.interest_rate,
            "duration_months": self.duration_months,
            "status": self.status.value if self.status else None,
            "issued_date": self.issued_date.isoformat() if self.issued_date else None,
            "approved_date": self.approved_date.isoformat() if self.approved_date else None,
            "disbursed_date": self.disbursed_date.isoformat() if self.disbursed_date else None,
            "rejected_reason": self.rejected_reason,
            "customer_id": self.customer_id,
            "lender_id": self.lender_id,
            "loan_product_id": self.loan_product_id,
            
        }
    def __repr__(self):
        return (
            f'<Loan id={self.id} amount={self.amount} '
            f'status={self.status} customer_id={self.customer_id} lender_id={self.lender_id}>'
        )
    
