from flask import Blueprint, jsonify
from utils.sms_service import send_sms

sms_test_bp = Blueprint("sms_test", __name__)

@sms_test_bp.route("/test-sms", methods=["GET"])
def test_sms():
    phone = "+254768907795"  # Replace with your number
    message = "SokoCredit test 🚀"
    result = send_sms(phone, message)
    return jsonify(result)
