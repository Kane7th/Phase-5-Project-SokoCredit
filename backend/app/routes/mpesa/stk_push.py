import base64
import requests
from datetime import datetime
from flask import current_app
from .client import get_access_token

def send_stk_push(phone_number: str, amount: int, account_ref='TestSoko', description='Loan payments'):
    """
    Helper func. handling STK Push request logic, later will be 
    imported into views.py.
    """
    
    access_token = get_access_token()
    
    business_shortcode = current_app.config.get('MPESA_SHORTCODE')
    passkey = current_app.config.get("MPESA_PASSKEY")
    callback_url = current_app.config.get("MPESA_CALLBACK_URL")

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    # combine for password
    data_to_encode = business_shortcode + passkey + timestamp
    encoded_password = base64.b64encode(data_to_encode.encode()).decode()
    
    print(f"Password: {encoded_password}")
    print(f"Timestamp: {timestamp}")
    # build request body
    payload = {
        'BusinessShortCode': business_shortcode,
        'Password': encoded_password,
        'Timestamp': timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": business_shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_ref,
        "TransactionDesc": description
    }
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers=headers
    )
    return response.json()


