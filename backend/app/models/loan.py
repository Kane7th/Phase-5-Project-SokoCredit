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
    
    serialize_rules = ('-borrower.loans', 
                       '-lender.issued_loans', 
                       '-repayments.loan', 
                       '-repayment_schedules.loan'
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
    
    
    borrower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    borrower = db.relationship('User', back_populates='loans', foreign_keys=[borrower_id])
    lender = db.relationship("User", back_populates="issued_loans", foreign_keys=[lender_id])
    repayments = db.relationship("Repayment", back_populates="loan", cascade="all, delete-orphan")
    repayment_schedules = db.relationship('RepaymentSchedule', back_populates='loan', cascade='all, delete-orphan')

    @property
    def total_repaid(self):
        return sum(r.amount_paid for r in self.repayments)
    
    def __repr__(self):
        return f'<Loan id={self.id} amount={self.amount} status={self.status} borrower_id={self.borrower_id} lender_id={self.lender_id}>'
    
