from app.extensions import db
from datetime import datetime

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("notifications", lazy=True))

    def __repr__(self):
        return f"<Notification {self.id} for User {self.user_id}: {self.message[:20]}...>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "message": self.message,
            "read": self.read,
            "created_at": self.created_at.isoformat()
        }
    def mark_as_read(self):
        self.read = True
        db.session.commit()

    def mark_as_unread(self):
        self.read = False
        db.session.commit()

    @staticmethod
    def get_notifications_for_user(user_id):
        return Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    @staticmethod
    def get_unread_count_for_user(user_id):
        return Notification.query.filter_by(user_id=user_id, read=False).count()
    @staticmethod
    def delete_notification(notification_id):
        notification = Notification.query.get(notification_id)
        if notification:
            db.session.delete(notification)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def delete_all_for_user(user_id):
        notifications = Notification.query.filter_by(user_id=user_id).all()
        for notification in notifications:
            db.session.delete(notification)
        db.session.commit()
        return True
    
    @staticmethod
    def create_notification(user_id, message):
        notification = Notification(user_id=user_id, message=message)
        db.session.add(notification)
        db.session.commit()
        return notification
    
    @staticmethod
    def mark_all_as_read_for_user(user_id):
        notifications = Notification.query.filter_by(user_id=user_id, read=False).all()
        for notification in notifications:
            notification.read = True
        db.session.commit()
        return len(notifications)
    
    @staticmethod
    def mark_all_as_unread_for_user(user_id):
        notifications = Notification.query.filter_by(user_id=user_id, read=True).all()
        for notification in notifications:
            notification.read = False
        db.session.commit()
        return len(notifications)
    
    @staticmethod
    def get_latest_notification_for_user(user_id):
        return Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).first()
    
    @staticmethod
    def get_notifications_by_date(user_id, date):
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= start,
            Notification.created_at <= end
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_date_range(user_id, start_date, end_date):
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= start,
            Notification.created_at <= end
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_keyword(user_id, keyword):
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.message.ilike(f"%{keyword}%")
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_read_status(user_id, read):
        return Notification.query.filter_by(user_id=user_id, read=read).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_user_and_read_status(user_id, read):
        return Notification.query.filter_by(user_id=user_id, read=read).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_user_and_date(user_id, date):
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= start,
            Notification.created_at <= end
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_user_and_date_range(user_id, start_date, end_date):
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= start,
            Notification.created_at <= end
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_user_and_keyword(user_id, keyword):
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.message.ilike(f"%{keyword}%")
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_user_and_read_status_and_date(user_id, read, date):
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.read == read,
            Notification.created_at >= start,
            Notification.created_at <= end
        ).order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_notifications_by_user_and_read_status_and_date_range(user_id, read, start_date, end_date):
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())
        return Notification.query.filter(
            Notification.user_id == user_id,
            Notification.read == read,
            Notification.created_at >= start,
            Notification.created_at <= end
        ).order_by(Notification.created_at.desc()).all()