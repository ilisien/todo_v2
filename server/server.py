import os
import json
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from datetime import datetime, timedelta
from utilities import patch_task_by_id

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

app.config['SECRET_KEY'] = 'secret_key'
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'backend.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(80),unique = True,nullable=False)
    password_hash = db.Column(db.String(128),nullable=False)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash,password)


class Blob(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True, default=1)
    content = db.Column(db.Text, nullable=False, default='[]')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class TaskBlob(Blob):
    __tablename__ = 'task_blob'

class PreferencesBlob(Blob):
    __tablename__ = 'preferences_blob'

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user created!'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if not user or not user.check_password(data.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({'token': access_token})

@app.route('/api/tasks', methods=['GET', 'POST', 'PATCH'])
@jwt_required()
def handle_tasks_blob():
    current_user_id = int(get_jwt_identity())
    
    doc = TaskBlob.query.filter_by(user_id=current_user_id).first()

    if not doc:
        doc = TaskBlob(user_id=current_user_id, content='[]')
        db.session.add(doc)
        db.session.commit()

    if request.method == 'GET':
        return doc.content, 200, {'Content-Type': 'application/json'}

    if request.method == 'POST':
        new_content_json = request.get_json()
        doc.content = json.dumps(new_content_json)
        db.session.commit()
        return jsonify({'success': True})

    if request.method == 'PATCH':
        patch_data = request.get_json()
        blob = json.loads(doc.content)

        task_id = patch_data.get('id')
        updated = False
        if not patch_task_by_id(blob,task_id,patch_data):
            return jsonify({'error':'Task not found'}), 404
        
        doc.content = json.dumps(blob)
        db.session.commit()
        return jsonify({'success': True})
    
@app.route('/api/preferences', methods=['GET', 'POST'])
@jwt_required()
def handle_preferences_blob():
    current_user_id = int(get_jwt_identity())

    doc = PreferencesBlob.query.filter_by(user_id=current_user_id).first()

    if not doc:
        doc = PreferencesBlob(user_id=current_user_id, content='[]')
        db.session.add(doc)
        db.session.commit()

    if request.method == 'GET':
        return doc.content, 200, {'Content-Type': 'application/json'}

    if request.method == 'POST':
        new_content_json = request.get_json()
        doc.content = json.dumps(new_content_json)
        db.session.commit()
        return jsonify({'success': True})

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)