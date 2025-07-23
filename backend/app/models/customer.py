from app.extensions import db
from datetime import datetime, timezone
from sqlalchemy_serializer import SerializerMixin

class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'

    serialize_rules = ('-created_by_user.customer', '-mama_mboga_user.customer')

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    business_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    documents = db.Column(db.JSON, default={})
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    mama_mboga_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=True)

    # Relationships
    created_by_user = db.relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_customers"
    )

    mama_mboga_user = db.relationship(
        "User",
        foreign_keys=[mama_mboga_user_id],
        back_populates="mama_mboga_customer"
    )
    
    def __repr__(self):
        return f"<Customer id={self.id} full_name='{self.full_name}' phone='{self.phone}'>"