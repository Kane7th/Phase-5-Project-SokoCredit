from app.extensions import db
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Enum
from enum import Enum as PyEnum


class RepaymentStatus(PyEnum):
    UNPAID = 'unpaid'
    PARTIAL = 'partial'
    PAID = 'paid'


class RepaymentSchedule(db.Model, SerializerMixin):
    __tablename__ = 'repayment_schedules'

    serialize_rules = ('-loan', '-repayments.schedule')

    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    
    due_date = db.Column(db.DateTime, nullable=False)
    amount_due = db.Column(db.Float, nullable=False)
    status = db.Column(Enum(RepaymentStatus), default=RepaymentStatus.UNPAID, nullable=False)

    loan = db.relationship("Loan", back_populates="repayment_schedules")
    repayments = db.relationship("Repayment", back_populates="schedule", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<RepaymentSchedule id={self.id} loan_id={self.loan_id} due_date={self.due_date} amount_due={self.amount_due} status={self.status.value}>"
