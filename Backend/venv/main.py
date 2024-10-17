from flask import Flask, request, jsonify,session
from flask_cors import CORS
import sqlite3
from flask import make_response
from flask_session import Session
import logging
import json
import bcrypt
import traceback

from datetime import datetime

def generate_order_id():
    import uuid
    return str(uuid.uuid4())

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173", "supports_credentials": True}})

app.config['SECRET_KEY'] = 'dahfaksjhksah'
app.config['SESSION_TYPE'] = 'filesystem'  # Use filesystem to store sessions
app.config['SESSION_COOKIE_NAME'] = 'Movie Booking System'
Session(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Path to your existing database
DATABASE_PATH = 'C:/Users/ABO SEIF/stack/Frontend/Database/database.sqlite'

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)  # Correct usage of DATABASE_PATH
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/users', methods=["GET", "POST"])
def manage_users():
    if request.method == "GET":
        return get_users()
    elif request.method == "POST":
        return create_user()

@app.route('/api/users/<int:id>', methods=['PUT','DELETE'])
def update_user(id):
    if request.method == "PUT":
        try:
            data = request.json
            print(f"Received data: {data}")

            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone')
            role = data.get('role')

            if role is None:
                return jsonify({'error': 'Role must be provided'}), 400

            conn = get_db_connection()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            query = 'UPDATE user SET name=?, email=?, password=?, phone=?, role=? WHERE id=?'
            conn.execute(query, (name, email, hashed_password, phone, role, id))
            conn.commit()
            conn.close()

            return jsonify({'message': 'User updated successfully'}), 200
        except sqlite3.IntegrityError as e:
            logging.error(f"Error during user update: {str(e)}")
            return jsonify({'error': 'Database integrity error'}), 400
        except Exception as e:
            logging.error(f"Error during user update: {str(e)}")
            return jsonify({'error': str(e)}), 500

    elif request.method == "DELETE":
        try:
            conn = get_db_connection()
            conn.execute('DELETE FROM user WHERE id=?', (id,))
            conn.commit()
            conn.close()

            return jsonify({'message': 'User deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT name FROM sqlite_master WHERE type="table";')
        tables = cursor.fetchall()
        print("Tables in database:", tables)  # Debug: Print tables

        users = conn.execute('SELECT * FROM user').fetchall()
        conn.close()

        user_list = [{"id": user["id"], "name": user["name"], "email": user["email"], "phone": user["phone"]} for user in users]
        return jsonify({"users": user_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_user():
    try:
        data = request.json
        print(f"Received data: {data}")
        username = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone', '')

        if not username or not email or not password:
            return jsonify({"error": "Required fields missing"}), 400
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        conn = get_db_connection()
        conn.execute('INSERT INTO user (name, email, password, phone) VALUES (?, ?, ?, ?)',
                     (username, email, hashed_password, phone))
        conn.commit()
        conn.close()

        return jsonify({"message": "User created successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username_or_email = data.get('username_or_email')
    password = data.get('password')

    if not username_or_email or not password:
        return jsonify({'error': 'Missing username_or_email or password'}), 400

    try:
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM user WHERE name = ? OR email = ?', 
            (username_or_email, username_or_email)
        ).fetchone()
        conn.close()

        if user:
            stored_hashed_password = user['password']
            if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
                session['user_id'] = user['id']
                session['user_name'] = user['name']
                session['user_email'] = user['email']
                session['user_phone'] = user['phone']
                session['user_role'] = user['role']
                print("Session data after login:", dict(session))
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'name': user['name'],
                        'email': user['email']
                    }
                })
                response.set_cookie('your_session_cookie_name', 'value')  # Set your session cookie
                return response, 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
        else:
            return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        logging.error(f"Error during login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/check_auth', methods=['GET'])
def check_auth():
    print("Session data:", dict(session))  # Print session data for debugging
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'name': session['user_name'],
                'email': session['user_email'],
                'phone': session['user_phone'],
                'role' : session['user_role'],
            }
        }), 200
    else:
        return jsonify({'authenticated': False}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        session.clear()  # Clear the session
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        print(f"Error during logout: {e}")  # Log the exception for debugging
        return jsonify({'error': 'Failed to log out'}), 500

@app.route('/api/movies', methods=['GET','POST'])
def manage_movies():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM movie')
            movies = cursor.fetchall()
            conn.close()

            movies_list = []
            for movie in movies:
                movie_dict = {
                    'id': movie['id'],
                    'title': movie['title'],
                    'image': movie['image'],
                    'language': movie['language'],
                    'genre': movie['genre'],
                    'director': movie['director'],
                    'trailer': movie['trailer'],
                    'description': movie['description'],
                    'duration': movie['duration'],
                    'start_date': movie['start_date'],
                    'end_date': movie['end_date']
                }

                # Remove keys with None values
                filtered_movie_dict = {k: v for k, v in movie_dict.items() if v is not None}
                movies_list.append(filtered_movie_dict)

            return jsonify(movies_list), 200
        except Exception as e:
            print(f"Error fetching movies: {e}")
            return jsonify({'error': 'Failed to fetch movies'}), 500

    elif request.method == 'POST':
        try:
            data = request.json
            title = data.get('title')
            image = data.get('image')
            language = data.get('language')
            genre = data.get('genre')
            director = data.get('director')
            trailer = data.get('trailer')
            description = data.get('description')
            duration = data.get('duration')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''INSERT INTO movie(title,image,language,genre,director,trailer,description,duration,start_date,end_date)
                               VALUES (?,?,?,?,?,?,?,?,?,?)''',
                               (title,image,language,genre,director,trailer,description,duration,start_date,end_date))
            conn.commit()
            conn.close()

            return jsonify({'message':'Movie added successfully!'}),201
        except Exception as e:
            print(f'Error adding movie: {e}')
            return jsonify({'error':'Failed to add movie'}),500

@app.route('/api/movies/<int:movie_id>',methods=['PUT','DELETE'])
def modify_movie(movie_id):
    if request.method == 'PUT':
        try:
            data = request.json
            title = data.get('title')
            image = data.get('image')
            language = data.get('language')
            genre = data.get('genre')
            director = data.get('director')
            trailer = data.get('trailer')
            description = data.get('description')
            duration = data.get('duration')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''UPDATE movie SET title = ?,image = ?, language=?, genre = ?, director = ?, trailer = ?,description = ?, duration = ?, start_date = ?, end_date = ?
                            WHERE  id = ?''',(title,image,language,genre,director,trailer,description,duration,start_date,end_date,movie_id))
            
            conn.commit()
            conn.close()

            return jsonify({'message':'Movie updated Successfully!'}),200
        except Exception as e:
            print(f'Error updating movie: {e}')
            return jsonify({'error':'Failed to update movie'}), 500

    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM movie WHERE id = ?', (movie_id))
            conn.commit()
            conn.close()
            return jsonify({'message':'Movie deleted successfully!'}),200
        except Exception as e:
            print(f"Error deleting movie: {e}")
            return jsonify({'error':'Failed to delete movie'}), 500

@app.route('/api/theatres', methods=['GET'])
def theatres():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM theatre')
            theatres = cursor.fetchall()
            conn.close()

            theatres_list = []
            for theatre in theatres:
                seats = json.loads(theatre['seats']) if theatre['seats'] else None
                theatre_dict = {
                    'id': theatre['id'],
                    'name': theatre['name'],
                    'city': theatre['city'],
                    'ticket_price': theatre['ticket_price'],
                    'seats': seats,
                    'image': theatre['image']
                }

                filtered_theatre_dict = {k: v for k, v in theatre_dict.items() if v is not None}
                theatres_list.append(filtered_theatre_dict)

            return jsonify(theatres_list), 200
        except Exception as e:
            print(f"Error fetching theatres: {e}")
            return jsonify({'error': 'Failed to fetch theatres'}), 500

@app.route('/api/showtime', methods=['GET', 'POST'])
def showtimes():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                SELECT showtime.id, showtime.movie_id, showtime.theatre_id, showtime.ticket_price, 
                       showtime.start_date, showtime.end_date, 
                       movie.title AS movie_title, theatre.name AS theatre_name
                FROM showtime
                JOIN movie ON showtime.movie_id = movie.id
                JOIN theatre ON showtime.theatre_id = theatre.id
            ''')
            showtimes = cursor.fetchall()
            conn.close()
            
            showtimes_list = []
            for showtime in showtimes:
                showtime_dict = {
                    'id': showtime['id'],
                    'movie_id': showtime['movie_id'],
                    'theatre_id': showtime['theatre_id'],
                    'ticket_price': float(showtime['ticket_price']),
                    'start_date': showtime['start_date'],
                    'end_date': showtime['end_date'],
                    'movie_title': showtime['movie_title'],
                    'theatre_name': showtime['theatre_name']
                }
                
                filtered_showtime_dict = {k: v for k, v in showtime_dict.items() if v is not None}
                showtimes_list.append(filtered_showtime_dict)
            
            return jsonify(showtimes_list), 200
        
        except Exception as e:
            print(f"Error fetching showtimes: {e}")
            return jsonify({'error': 'Failed to fetch showtimes'}), 500

    if request.method == 'POST':
        try:
            data = request.json
            showtimes = data.get('showtimes', [])

            if not showtimes:
                return jsonify({'error': 'No showtimes provided'}), 400

            conn = get_db_connection()
            cursor = conn.cursor()

            for showtime in showtimes:
                cursor.execute(
                    'INSERT INTO showtime (movie_id, theatre_id, ticket_price, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                    (showtime['movie_id'], showtime['theatre_id'], showtime['ticket_price'], showtime['start_date'], showtime['end_date'])
                )

            conn.commit()
            conn.close()
            return jsonify({'message': 'Showtimes created successfully'}), 201
        
        except Exception as e:
            print(f"Error creating showtimes: {e}")
            return jsonify({'error': 'Failed to create showtimes'}), 500

@app.route('/api/showtime/<int:id>', methods=['PUT', 'DELETE'])
def showtime_by_id(id):
    if request.method == 'PUT':
        try:
            data = request.json
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE showtime SET movie_id = ?, theatre_id = ?, ticket_price = ?, start_date = ?, end_date = ? WHERE id = ?',
                (data['movie_id'], data['theatre_id'], data['ticket_price'], data['start_date'], data['end_date'], id)
            )
            conn.commit()
            conn.close()
            return jsonify({'message': 'Showtime updated successfully'}), 200
        except Exception as e:
            print(f"Error updating showtime: {e}")
            return jsonify({'error': 'Failed to update showtime'}), 500

    if request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            current_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            if id is None:
                # Delete showtimes where end_date has passed
                cursor.execute('DELETE FROM showtime WHERE end_date < ?', (current_date,))
            else:
                # Delete specific showtime by ID
                cursor.execute('DELETE FROM showtime WHERE id = ?', (id,))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Showtime deleted successfully'}), 200
        except Exception as e:
            print(f"Error deleting showtime: {e}")
            return jsonify({'error': 'Failed to delete showtime'}), 500

@app.route('/api/reservation', methods=['GET', 'POST'])
def reservations():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM reservation')
            reservations = cursor.fetchall()
            conn.close()
            
            reservations_list = []
            for reservation in reservations:
                reservation_dict = {
                    'id': reservation['id'],
                    'order_id': reservation['order_id'],
                    'showtime_id': reservation['showtime_id'],
                    'user_id': reservation['user_id'],
                    'seats': reservation['seats'],
                    'name': reservation['name'],          # Include name
                    'phone': reservation['phone'],        # Include phone
                    'date': reservation['date'],          # Include date
                    'start_at': reservation['start_at']
                }
                
                filtered_reservation_dict = {k: v for k, v in reservation_dict.items() if v is not None}
                reservations_list.append(filtered_reservation_dict)
            
            return jsonify(reservations_list), 200
        
        except Exception as e:
            print(f"Error fetching reservations: {e}")
            return jsonify({'error': 'Failed to fetch reservations'}), 500

    if request.method == 'POST':
        try:
            data = request.json
            print(f"Received data: {data}")
            showtime_id = data.get('showtime_id')
            name = data.get('name')
            phone = data.get('phone')
            seats = data.get('seats')
            date = data.get('date')
            start_at = data.get('start_at')
            user_id = data.get('user_id')
            
            if not all([showtime_id, name, phone, seats, date, start_at, user_id]):
                return jsonify({'error': 'Missing required fields'}), 400
            order_id = generate_order_id()
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Fetch ticket price from the showtime
            cursor.execute('''
                SELECT ticket_price
                FROM showtime
                WHERE id = ?
            ''', (showtime_id,))
            ticket_price_row = cursor.fetchone()
            if not ticket_price_row:
                return jsonify({'error': 'Showtime not found'}), 404
            ticket_price = ticket_price_row[0]
            total = ticket_price * int(seats)
            # Insert reservation into the database
            cursor.execute('''
                INSERT INTO reservation (order_id, showtime_id, name, phone, seats, date, start_at, user_id, ticket_price, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (order_id, showtime_id, name, phone, seats, date, start_at, user_id, ticket_price, total))
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Reservation created successfully'}), 201
        
        except Exception as e:
            print(f"Error creating reservation: {e}")
            return jsonify({'error': 'Failed to create reservation'}), 500


@app.route('/api/reservation/<int:id>', methods=['PUT', 'DELETE'])
def reservation_by_id(id):
    if request.method == 'PUT':
        try:
            data = request.json
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                '''
                UPDATE reservation 
                SET showtime_id = ?, user_id = ?, seats = ?, name = ?, phone = ?, date = ?, start_at = ?
                WHERE id = ?
                ''',
                (data['showtime_id'], data['user_id'], data['seats'], data['name'], data['phone'], data['date'], data['start_at'], id)
            )
            conn.commit()
            conn.close()
            return jsonify({'message': 'Reservation updated successfully'}), 200
        except Exception as e:
            print(f"Error updating reservation: {e}")
            return jsonify({'error': 'Failed to update reservation'}), 500

    if request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM reservation WHERE id = ?', (id,))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Reservation deleted successfully'}), 200
        except Exception as e:
            print(f"Error deleting reservation: {e}")
            return jsonify({'error': 'Failed to delete reservation'}), 500

@app.route('/api/reserve', methods=['POST'])
def reserve_seats():
    data = request.json
    print(f"Received data: {data}")
    
    if not data or 'seats' not in data:
        return jsonify({'error': 'Invalid request'}), 400
    
    seats_to_reserve = data['seats']
    
    if not seats_to_reserve:
        return jsonify({'error': 'No seats provided'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for seat_id in seats_to_reserve:
            cursor.execute('SELECT * FROM seats WHERE id = ?', (seat_id,))
            seat = cursor.fetchone()
            
            if seat:
                if seat['reserved']:
                    return jsonify({'error': f'Seat {seat_id} is already reserved'}), 400
                cursor.execute('UPDATE seats SET reserved = 1 WHERE id = ?', (seat_id,))
            else:
                return jsonify({'error': f'Seat {seat_id} not found'}), 404
        
        conn.commit()
        conn.close()
        return jsonify({'message': 'Seats reserved successfully'}), 200
    
    except Exception as e:
        print(f"Error reserving seats: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080,debug=False)