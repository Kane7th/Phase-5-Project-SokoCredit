from flask import Blueprint, jsonify
from .client import get_access_token

test_bp = Blueprint('test_bp', __name__, url_prefix='/test')

@test_bp.route('/mpesa-token', methods=['GET'])
def test_mpesa_token():
    try:
        token = get_access_token()
        return jsonify({'access_token': token}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
