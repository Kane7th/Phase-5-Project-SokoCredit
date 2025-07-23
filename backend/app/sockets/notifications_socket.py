from flask_jwt_extended import decode_token
from flask_socketio import Namespace, emit, join_room, disconnect
from app import socketio
from app.extensions import socketio

class NotificationNamespace(Namespace):
    def on_connect(self):
        # Grab JWT from query params (secure for dev, move to auth headers later)
        token = self.socketio.server.environ[self.sid]['QUERY_STRING']
        access_token = token.split("token=")[-1]

        try:
            decoded = decode_token(access_token)
            identity = decoded["sub"]
            
            if isinstance(identity, str) and identity.startswith("user_"):
                user_id = int(identity.split("_")[1].split(":")[0])
            elif isinstance(identity, int):
                user_id = identity
            else:
                print("Invalid identity format")
                return disconnect()

            join_room(f"user_{user_id}")
            print(f"User {user_id} joined room user_{user_id}")

        except Exception as e:
            print("Socket Auth Error:", e)
            return disconnect()

    def on_disconnect(self):
        print("Client disconnected from /notifications")

# Register the namespace
socketio.on_namespace(NotificationNamespace('/notifications'))
