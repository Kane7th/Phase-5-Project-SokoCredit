import requests
from flask import current_app
from requests.auth import HTTPBasicAuth

def get_access_token():
    """
    This func. helps generate an OAuth access token from Safaricom 
    M-Pesa API. The token is needed to authorize all other API requests (like STK Push).
    """
    
    # Load keys from config file and set saf's oAuth endpoint
    consumer_key = current_app.config.get("MPESA_CONSUMER_KEY")
    consumer_secret = current_app.config.get("MPESA_CONSUMER_SECRET")
    auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    # use basic Auth to make GET request
    response = requests.get(
        auth_url,
        auth=HTTPBasicAuth(consumer_key, consumer_secret)
    )
    if response.status_code == 200:
        access_token = response.json().get('access_token')
        return access_token
    else:
        raise Exception(f'failed to generate access token: {response.text}')
    