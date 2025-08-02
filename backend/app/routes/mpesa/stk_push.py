import base64
import requests
from datetime import datetime
from flask import current_app
from .client import get_access_token

def send_stk_push(phone_number: str, amount: int, account_ref='MySoko', description='Loans'):
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
    print(f'Raw: {data_to_encode}')
    encoded_password = base64.b64encode(data_to_encode.encode()).decode()
    print(f'Encoded: {encoded_password}')
    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
     
    print("Token acquired at:", datetime.now().isoformat())    
    print(f'access_token: {access_token}')
    print(f'shortcode: {business_shortcode}')
    print(f'passkey: {passkey}')
    print(f"Password: {encoded_password}")
    print(f"Timestamp: {timestamp}")
 
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
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
    
    # print("Payload being sent:", payload)
    # print("Headers being sent:", headers)
    
    try:
        response = requests.post(
            url, json=payload, headers=headers
        )
        print(response.json())
        return response.json()
    except Exception as e:
        print("Error on STK-PUSH:", str(e))


