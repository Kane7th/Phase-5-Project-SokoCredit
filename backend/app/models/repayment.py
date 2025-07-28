from app.extensions import db
from datetime import datetime
from sqlalchemy_serializer import SerializerMixin

class Repayment(db.Model, SerializerMixin):
    __tablename__ = 'repayments'
    
    serialize_rules = ('-loan.repayments', '-schedule.repayments', '-customer.repayments')
    
    id = db.Column(db.Integer, primary_key=True)
    
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('repayment_schedules.id'), nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    mpesa_code = db.Column(db.String(50), unique=True, nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)

    loan = db.relationship("Loan", back_populates="repayments")
    schedule = db.relationship("RepaymentSchedule", back_populates="repayments")
    customer = db.relationship("User", back_populates="repayments")

    def __repr__(self):
        return f"<Repayment id={self.id} customer_id={self.customer_id} loan_id={self.loan_id} amount_paid={self.amount_paid}>"
