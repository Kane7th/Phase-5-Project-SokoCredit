import africastalking
import os

# Load credentials from environment or config
USERNAME = os.getenv("AFRICASTALKING_USERNAME", "sandbox")  
API_KEY = os.getenv("AFRICASTALKING_API_KEY", "UutAHtWDL") 

# Initialize SDK
africastalking.initialize(USERNAME, API_KEY)

# Get the SMS service
sms = africastalking.SMS

def send_sms(phone_number: str, message: str) -> dict:
    try:
        response = sms.send(message, [phone_number])
        return {"success": True, "response": response}
    except Exception as e:
        return {"success": False, "Failed to send SMS": str(e)}
