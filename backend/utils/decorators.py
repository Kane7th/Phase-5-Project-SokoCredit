from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify

def role_required(allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            identity = get_jwt_identity()
            try:
                _, role = identity.split(":")
            except Exception:
                return jsonify({"msg": "Malformed token identity"}), 400

            if role not in allowed_roles:
                return jsonify({"msg": f"Unauthorized: role '{role}' not in allowed roles {allowed_roles}"}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper

