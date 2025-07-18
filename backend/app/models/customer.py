from app.extensions import db
from datetime import datetime, timezone
from sqlalchemy_serializer import SerializerMixin

class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'
    
    serialize_rules = ('-user.customer',)
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    business_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    documents = db.Column(db.JSON, default={})  # e.g. {"id_card": "url", "permit": "url"}
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # agent/admin ID

    user = db.relationship('User', back_populates='customer')
    
    def __repr__(self):
        return f"<Customer id={self.id} full_name='{self.full_name}' phone='{self.phone}'>"