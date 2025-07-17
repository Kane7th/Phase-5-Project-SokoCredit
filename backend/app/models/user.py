from app.extensions import db
from passlib.hash import pbkdf2_sha256
from sqlalchemy_serializer import SerializerMixin 

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='Mama Mboga', nullable=False)  # 'admin', 'mama mboga' or 'lender'

    serialize_rules = ('id', 'username', 'role')
    
    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)
    
    
