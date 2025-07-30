import requests
from flask import current_app
from requests.auth import HTTPBasicAuth
import base64

def get_access_token():
    """
    This func. helps generate an OAuth access token from Safaricom 
    M-Pesa API. The token is needed to authorize all other API requests (like STK Push).
    """
    
    # Load keys from config file and set saf's oAuth endpoint
    consumer_key = current_app.config.get("MPESA_CONSUMER_KEY")
    consumer_secret = current_app.config.get("MPESA_CONSUMER_SECRET")
    auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    print("KEY:", consumer_key)
    print("SECRET:", consumer_secret)
    
    try:
        encoded_credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }
        
        # response = requests.get(auth_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
        response = requests.get(auth_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                print("Access token received:", data['access_token'])
                return data['access_token']
            else:
                raise Exception(f"Unexpected token response: {data}")
        else:
            raise Exception(f"Token request failed with status {response.status_code}: {response.text}")
    except Exception as e:
            raise Exception("Failed to generate access token: " + str(e))    
    
    
    
    # response = requests.get(
    #     auth_url,
    #     headers = {
    #         "Authorization": f"Basic {auth}"
    #     }
    # )
    # print(f'response: {response}')
    # if response.status_code == 200:
    #     access_token = response.json().get('access_token')
    #     return access_token
    # else:
    #     raise Exception(f'failed to generate access token: {response.text}')
    