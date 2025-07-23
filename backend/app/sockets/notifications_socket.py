from flask_jwt_extended import decode_token
from flask_socketio import Namespace, emit, join_room, leave_room, disconnect
from flask import request as flask_request
from urllib.parse import parse_qs
from app.extensions import socketio, db
from app.models import Notification  # Assumes you have a Notification SQLAlchemy model

# In-memory active users tracker
active_users = set()


class NotificationNamespace(Namespace):
    def on_connect(self, auth):
        sid = flask_request.sid
        token = auth.get("token") if auth and "token" in auth else self._extract_token(flask_request.query_string.decode())

        if not token:
            print("[SocketIO] Missing token")
            return disconnect(sid)

        try:
            decoded = decode_token(token)
            identity = decoded.get("sub")

            if isinstance(identity, str) and identity.startswith("user_"):
                user_id = int(identity.split("_")[1].split(":")[0])
                role = identity.split(":")[1] if ":" in identity else "unknown"
            elif isinstance(identity, int):
                user_id = identity
                role = "unknown"
            else:
                print("[SocketIO] Invalid identity format")
                return disconnect(sid)

            join_room(f"user_{user_id}")
            join_room(f"role_{role}")
            active_users.add(user_id)

            print(f"[SocketIO] User {user_id} joined rooms user_{user_id}, role_{role}")

        except Exception as e:
            print("[SocketIO] Auth error:", e)
            return disconnect(sid)

    def on_disconnect(self):
        sid = flask_request.sid
        print(f"[SocketIO] Client {sid} disconnected")
        # We can’t get user_id here directly unless we track it per session
        # Optional: Clean up from active_users if you track sid → user_id mappings

    def _extract_token(self, query_string):
        qs = parse_qs(query_string)
        return qs.get("token", [None])[0]


# Register
socketio.on_namespace(NotificationNamespace("/notifications"))
