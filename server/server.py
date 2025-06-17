
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'blob.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Blob(db.Model):
    id = db.Column(db.Integer, primary_key=True, default=1)
    content = db.Column(db.Text, nullable=False, default='[]')
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# --- API Endpoints ---

@app.route('/api/blob', methods=['GET', 'POST'])
def handle_blob():
    doc = Blob.query.get(1)
    if not doc:
        doc = Blob(id=1, content='[]')
        db.session.add(doc)
        db.session.commit()

    if request.method == 'GET':
        return doc.content, 200, {'Content-Type': 'application/json'}

    if request.method == 'POST':
        new_content_json = request.get_json()
        
        if new_content_json is None:
            return jsonify({'error': 'Invalid JSON in request body'}), 400

        import json
        doc.content = json.dumps(new_content_json)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Blob saved.'})

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)