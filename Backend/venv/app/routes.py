from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app import db

bp = Blueprint('routes', __name__)

@bp.route('/api/users', methods=["GET", "POST"])
def manage_users():
    if request.method == "GET":
        return get_users()
    elif request.method == "POST":
        return create_user()

def get_users():
    try:
        # Query all users from the database
        users = User.query.all()
        
        # Convert query result to a list of dictionaries
        user_list = [{"id": user.id, "name": user.name, "email": user.email, "phone": user.phone} for user in users]
        
        return jsonify({"users": user_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_user():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone', '')

        conn = db.engine.connect()
        conn.execute('INSERT INTO user (name, email, password, phone) VALUES (?, ?, ?, ?)',
                     (username, email, password, phone))
        conn.commit()
        conn.close()

        return jsonify({"message": "User created successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/api/login', methods=['POST'])
def login():
    data = request.json

    username_or_email = data.get('username_or_email')
    password = data.get('password')
    
    user = db.session.query(User).filter(
        (User.username == username_or_email) | 
        (User.email == username_or_email)
    ).first()
    
    if user and check_password_hash(user.password, password):
        return jsonify({
            'message': 'Login successful',
            'user': {
                'username': user.username,
                'email': user.email
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401
