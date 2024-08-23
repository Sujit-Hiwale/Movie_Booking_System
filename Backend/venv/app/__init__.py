from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:/Users/ABO SEIF/stack/Frontend/Database/database.sqlite'
    CORS(app, origins='*')
    
    # Initialize extensions
    db.init_app(app)
    
    # Import and register routes
    from app import routes
    app.register_blueprint(routes.bp)
    
    return app