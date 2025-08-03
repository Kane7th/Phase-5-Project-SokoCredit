import requests
from requests.auth import HTTPBasicAuth

PAYPAL_CLIENT_ID = "AXsYAviM17arBrmTEocPYD7ouGB_6yYvjPDbL9Gbqdi53tCNOjSbe1jb9fKPRDtvH5jV_xe2W-fOywLz"
PAYPAL_CLIENT_SECRET = "EFC_C8RtXaD-MdfYXx1PSHjmwNlDwR2Ll1d4nwpSS1g1hBiG7hP7ZXXtrTfnMnyVkiu16xRYZMmKnMw1"
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

def get_paypal_access_token():
    url = f"{PAYPAL_API_BASE}/v1/oauth2/token"
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US"
    }
    data = {
        "grant_type": "client_credentials"
    }
    response = requests.post(url, headers=headers, data=data,
                             auth=HTTPBasicAuth(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET))
    
    response.raise_for_status()
    return response.json()["access_token"]