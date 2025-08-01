import africastalking
import os

USERNAME = os.getenv("AFRICASTALKING_USERNAME", "sandbox")
API_KEY = os.getenv("AFRICASTALKING_API_KEY", "atsk_593d056c35da76509e28dba624d90975c8cc98dd3d90deb7ce031eba99b3f0262caa51f5")

# Initialize the SDK
africastalking.initialize(USERNAME, API_KEY)

# Get SMS service
sms = africastalking.SMS

def send_sms(phone_number: str, message: str) -> dict:
    try:
        response = sms.send(message, [phone_number])
        print(f"✅ SMS sent to {phone_number}: {message}")
        return {"success": True, "response": response}
    except Exception as e:
        print(f"❌ Failed to send SMS to {phone_number}: {e}")
        return {"success": False, "error": str(e)}
