from flask import Flask, render_template, jsonify, request, session, send_from_directory
import os
import json
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, 
            static_url_path='',  # Serve static files from root
            static_folder='.')   # Current directory

app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))

# Config
PORT = 5001

# File paths for user data
USERS_FILE = 'users.json'
PROGRESS_FILE = 'progress.json'

# Initialize users file if it doesn't exist
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w') as f:
        json.dump({}, f)

# Initialize progress file if it doesn't exist
if not os.path.exists(PROGRESS_FILE):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({}, f)

def get_user_progress(username):
    with open(PROGRESS_FILE, 'r') as f:
        all_progress = json.load(f)
        return all_progress.get(username, create_initial_progress())

def save_user_progress(username, progress):
    with open(PROGRESS_FILE, 'r') as f:
        all_progress = json.load(f)
    
    all_progress[username] = progress
    
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(all_progress, f)

def create_initial_progress():
    return {
        "lesson1": {
            "completed": False,
            "quizCorrect": 0,
            "bestScore": 0,
            "quizTotal": 5
        },
        "lesson2": {
            "completed": False,
            "quizCorrect": 0,
            "bestScore": 0,
            "quizTotal": 5
        },
        "lesson3": {
            "completed": False,
            "quizCorrect": 0,
            "bestScore": 0,
            "quizTotal": 5
        },
        "totalProgress": 0,
        "progressHistory": [{"date": datetime.datetime.now().isoformat(), "value": 0}]
    }

# Routes for serving HTML files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    if os.path.isfile(filename):
        return send_from_directory('.', filename)
    return "File not found", 404

# API endpoints
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    with open(USERS_FILE, 'r') as f:
        users = json.load(f)
    
    if username in users:
        return jsonify({"success": False, "message": "Username already exists"})
    
    # Hash the password for security
    hashed_password = generate_password_hash(password)
    users[username] = {"password": hashed_password}
    
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)
    
    # Create initial progress for new user
    save_user_progress(username, create_initial_progress())
    
    session['username'] = username
    return jsonify({"success": True, "message": "Registration successful"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    with open(USERS_FILE, 'r') as f:
        users = json.load(f)
    
    if username not in users or not check_password_hash(users[username]["password"], password):
        return jsonify({"success": False, "message": "Invalid username or password"})
    
    session['username'] = username
    return jsonify({"success": True, "message": "Login successful"})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"success": True, "message": "Logout successful"})

@app.route('/api/progress', methods=['GET'])
def get_progress():
    if 'username' not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    progress = get_user_progress(session['username'])
    return jsonify({"success": True, "progress": progress})

@app.route('/api/completeLesson', methods=['POST'])
def complete_lesson():
    if 'username' not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.get_json()
    lesson_number = data.get('lessonNumber')
    
    progress = get_user_progress(session['username'])
    lesson_key = f"lesson{lesson_number}"
    
    # Only mark as completed if it wasn't already
    if not progress[lesson_key]["completed"]:
        progress[lesson_key]["completed"] = True
        
        # Add 20/3 % to total progress for completing a lesson
        progress["totalProgress"] += 20/3
        
        # Add to progress history
        progress["progressHistory"].append({
            "date": datetime.datetime.now().isoformat(),
            "value": progress["totalProgress"],
            "event": f"Completed Lesson {lesson_number}"
        })
        
        save_user_progress(session['username'], progress)
    
    return jsonify({"success": True, "progress": progress})

@app.route('/api/storeQuizScore', methods=['POST'])
def store_quiz_score():
    if 'username' not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    data = request.get_json()
    lesson_number = data.get('lessonNumber')
    correct_answers = data.get('correctAnswers')
    
    progress = get_user_progress(session['username'])
    lesson_key = f"lesson{lesson_number}"
    
    # Track the current quiz session score
    progress[lesson_key]["quizCorrect"] = correct_answers
    
    # If this is a better score than before, update the best score and total progress
    if correct_answers > progress[lesson_key]["bestScore"]:
        # Calculate progress difference
        previous_contribution = get_quiz_contribution(progress[lesson_key]["bestScore"])
        new_contribution = get_quiz_contribution(correct_answers)
        progress_difference = new_contribution - previous_contribution
        
        # Update best score
        progress[lesson_key]["bestScore"] = correct_answers
        
        # Add the progress difference to total progress
        if progress_difference > 0:
            progress["totalProgress"] += progress_difference
            
            # Add to progress history
            progress["progressHistory"].append({
                "date": datetime.datetime.now().isoformat(),
                "value": progress["totalProgress"],
                "event": f"New Best Score in Lesson {lesson_number} Quiz: {correct_answers}/5"
            })
    
    save_user_progress(session['username'], progress)
    return jsonify({"success": True, "progress": progress})

def get_quiz_contribution(correct):
    # Each question is worth 100/15 %
    return (correct * 100/15)

@app.route('/api/resetProgress', methods=['POST'])
def reset_progress():
    if 'username' not in session:
        return jsonify({"success": False, "message": "Not logged in"})
    
    # Reset progress for the current user
    save_user_progress(session['username'], create_initial_progress())
    
    return jsonify({"success": True, "message": "Progress reset successfully"})

if __name__ == '__main__':
    print(f"Flask server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    app.run(host='0.0.0.0', port=PORT, debug=True) 