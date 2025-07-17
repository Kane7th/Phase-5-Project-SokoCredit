from app.extensions import db
from datetime import datetime, timezone

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    business_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    documents = db.Column(db.JSON, default={})  # e.g. {"id_card": "url", "permit": "url"}
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # agent/admin ID

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "phone": self.phone,
            "business_name": self.business_name,
            "location": self.location,
            "documents": self.documents,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat()
        }
