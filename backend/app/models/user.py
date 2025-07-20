from app.extensions import db
from passlib.hash import pbkdf2_sha256
from sqlalchemy_serializer import SerializerMixin 

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    serialize_rules = ('-customer.user', '-loans', '-issued_loans')
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='Mama Mboga', nullable=False)  # 'admin', 'mama mboga' or 'lender'

    loans = db.relationship('Loan', back_populates='borrower', foreign_keys="Loan.borrower_id", cascade="all, delete-orphan")
    issued_loans = db.relationship("Loan", back_populates="lender", foreign_keys="Loan.lender_id")
    repayments = db.relationship("Repayment", back_populates="user", cascade="all, delete-orphan")

    # Relationship to customers created by this user (e.g. admins, lenders)
    created_customers = db.relationship(
        'Customer',
        back_populates='created_by_user',
        foreign_keys='Customer.created_by'
    )

    # Relationship to Mama Mboga's associated customer (1-to-1)
    mama_mboga_customer = db.relationship(
        'Customer',
        back_populates='mama_mboga_user',
        foreign_keys='Customer.mama_mboga_user_id',
        uselist=False
    )

    
    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)
    
    def __repr__(self):
        return f'<User id={self.id} username={self.username} role={self.role}>'
    
    
