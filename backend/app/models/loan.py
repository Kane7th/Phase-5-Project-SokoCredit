from app.extensions import db
from sqlalchemy_serializer import SerializerMixin

class Loan(db.Model, SerializerMixin):
    __tablename__ = 'loans'
    
    serialize_rules = ('-borrower.loans', '-lender.issued_loans', '-repayments.loan')
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    issued_date = db.Column(db.DateTime)
    
    borrower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    borrower = db.relationship('User', back_populates='loans', foreign_keys=[borrower_id])
    lender = db.relationship("User", back_populates="issued_loans", foreign_keys=[lender_id])
    repayments = db.relationship("Repayment", back_populates="loan", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Loan id={self.id} amount={self.amount} status={self.status} borrower_id={self.borrower_id} lender_id={self.lender_id}>'
    
