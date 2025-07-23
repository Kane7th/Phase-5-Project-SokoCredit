from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify

def role_required(*allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            identity = get_jwt_identity()
            _, role = identity.split(":")
            if role not in allowed_roles:
                return jsonify({"msg": "Unauthorized"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
