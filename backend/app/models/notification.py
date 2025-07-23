from app.extensions import db
from datetime import datetime


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    read = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False)  # Soft delete flag
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
            "is_deleted": self.is_deleted,
            "created_at": self.created_at.isoformat()
        }

    def mark_as_read(self):
        self.read = True
        db.session.commit()

    def mark_as_unread(self):
        self.read = False
        db.session.commit()

    def soft_delete(self):
        self.is_deleted = True
        db.session.commit()

    def restore(self):
        self.is_deleted = False
        db.session.commit()

    def is_active(self):
        return not self.is_deleted

    # --- Creation & Deletion ---
    @staticmethod
    def create_notification(user_id, message):
        notification = Notification(user_id=user_id, message=message)
        db.session.add(notification)
        db.session.commit()
        return notification

    @staticmethod
    def delete_notification(notification_id):
        notification = Notification.query.get(notification_id)
        if notification:
            notification.soft_delete()
            return True
        return False

    @staticmethod
    def delete_all_for_user(user_id):
        Notification.query.filter_by(user_id=user_id, is_deleted=False).update({"is_deleted": True})
        db.session.commit()
        return True

    # --- Basic Fetchers ---
    @staticmethod
    def get_notifications_for_user(user_id, page=None, per_page=None):
        query = Notification.query.filter_by(user_id=user_id, is_deleted=False).order_by(Notification.created_at.desc())
        if page and per_page:
            return query.paginate(page=page, per_page=per_page, error_out=False).items
        return query.all()

    @staticmethod
    def get_unread_count_for_user(user_id):
        return Notification.query.filter_by(user_id=user_id, read=False, is_deleted=False).count()

    @staticmethod
    def get_latest_notification_for_user(user_id):
        return Notification.query.filter_by(user_id=user_id, is_deleted=False).order_by(Notification.created_at.desc()).first()

    # --- Bulk Status Updates ---
    @staticmethod
    def mark_all_as_read_for_user(user_id):
        updated = Notification.query.filter_by(user_id=user_id, read=False, is_deleted=False).update({"read": True})
        db.session.commit()
        return updated

    @staticmethod
    def mark_all_as_unread_for_user(user_id):
        updated = Notification.query.filter_by(user_id=user_id, read=True, is_deleted=False).update({"read": False})
        db.session.commit()
        return updated

    # --- Filtering Methods ---
    @staticmethod
    def get_notifications_by_read_status(user_id, read, page=None, per_page=None):
        query = Notification.query.filter_by(user_id=user_id, read=read, is_deleted=False).order_by(Notification.created_at.desc())
        if page and per_page:
            return query.paginate(page=page, per_page=per_page, error_out=False).items
        return query.all()

    @staticmethod
    def get_notifications_by_keyword(user_id, keyword, page=None, per_page=None):
        query = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.message.ilike(f"%{keyword}%"),
            Notification.is_deleted == False
        ).order_by(Notification.created_at.desc())
        if page and per_page:
            return query.paginate(page=page, per_page=per_page, error_out=False).items
        return query.all()

    @staticmethod
    def get_notifications_by_date(user_id, date, page=None, per_page=None):
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        query = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= start,
            Notification.created_at <= end,
            Notification.is_deleted == False
        ).order_by(Notification.created_at.desc())
        if page and per_page:
            return query.paginate(page=page, per_page=per_page, error_out=False).items
        return query.all()

    @staticmethod
    def get_notifications_by_date_range(user_id, start_date, end_date, page=None, per_page=None):
        start = datetime.combine(start_date, datetime.min.time())
        end = datetime.combine(end_date, datetime.max.time())
        query = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at >= start,
            Notification.created_at <= end,
            Notification.is_deleted == False
        ).order_by(Notification.created_at.desc())
        if page and per_page:
            return query.paginate(page=page, per_page=per_page, error_out=False).items
        return query.all()

    @staticmethod
    def get_notifications_by_user_and_read_status_and_date(user_id, read, date, page=None, per_page=None):
        start = datetime.combine(date, datetime.min.time())
        end = datetime.combine(date, datetime.max.time())
        query = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.read == read,
            Notification.created_at >= start,
            Notification.created_at <= end,
            Notification.is_deleted == False
        ).order_by(Notification.created_at.desc())
        if page and per_page:
            return query.paginate(page=page, per_page=per_page, error_out=False).items
        return query.all()
