from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_for_testing')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///finance_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.relationship('Progress', backref='user', lazy=True, uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lesson1_complete = db.Column(db.Boolean, default=False)
    lesson1_quiz_score = db.Column(db.Integer, default=0)
    lesson1_best_score = db.Column(db.Integer, default=0)
    lesson2_complete = db.Column(db.Boolean, default=False)
    lesson2_quiz_score = db.Column(db.Integer, default=0)
    lesson2_best_score = db.Column(db.Integer, default=0)
    lesson3_complete = db.Column(db.Boolean, default=False)
    lesson3_quiz_score = db.Column(db.Integer, default=0)
    lesson3_best_score = db.Column(db.Integer, default=0)
    history = db.relationship('ProgressHistory', backref='progress', lazy=True)

class ProgressHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    progress_id = db.Column(db.Integer, db.ForeignKey('progress.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    value = db.Column(db.Integer, default=0) # 0-100 percentage complete

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/lesson/<int:lesson_id>')
def lesson(lesson_id):
    if lesson_id < 1 or lesson_id > 3:
        return redirect(url_for('index'))
    return render_template(f'lesson{lesson_id}.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            session['user_id'] = user.id
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        
        flash('Invalid username or password', 'danger')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        user_exists = User.query.filter_by(username=username).first() is not None
        email_exists = User.query.filter_by(email=email).first() is not None
        
        if user_exists:
            flash('Username already exists', 'danger')
        elif email_exists:
            flash('Email already registered', 'danger')
        else:
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            # Create initial progress entry for user
            new_progress = Progress(user_id=user.id)
            db.session.add(new_progress)
            
            # Create initial progress history entry
            history_entry = ProgressHistory(progress_id=new_progress.id, value=0)
            db.session.add(history_entry)
            db.session.commit()
            
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

# API Endpoints
@app.route('/api/progress', methods=['GET'])
def get_progress():
    user_id = session.get('user_id')
    if not user_id:
        # Demo mode - return sample data
        return jsonify({
            'lesson1': {
                'complete': False,
                'quizScore': 0,
                'bestScore': 0
            },
            'lesson2': {
                'complete': False,
                'quizScore': 0,
                'bestScore': 0
            },
            'lesson3': {
                'complete': False,
                'quizScore': 0,
                'bestScore': 0
            },
            'totalProgress': 0,
            'progressHistory': [
                {'date': datetime.now().isoformat(), 'value': 0}
            ]
        })
    
    user_progress = Progress.query.filter_by(user_id=user_id).first()
    if not user_progress:
        return jsonify({'error': 'No progress data found'}), 404
    
    history = ProgressHistory.query.filter_by(progress_id=user_progress.id).order_by(ProgressHistory.date).all()
    history_data = [{'date': entry.date.isoformat(), 'value': entry.value} for entry in history]
    
    # Calculate total progress
    total_lessons = 3
    completed_lessons = sum([
        user_progress.lesson1_complete,
        user_progress.lesson2_complete,
        user_progress.lesson3_complete
    ])
    total_progress = int((completed_lessons / total_lessons) * 100)
    
    return jsonify({
        'lesson1': {
            'complete': user_progress.lesson1_complete,
            'quizScore': user_progress.lesson1_quiz_score,
            'bestScore': user_progress.lesson1_best_score
        },
        'lesson2': {
            'complete': user_progress.lesson2_complete,
            'quizScore': user_progress.lesson2_quiz_score,
            'bestScore': user_progress.lesson2_best_score
        },
        'lesson3': {
            'complete': user_progress.lesson3_complete,
            'quizScore': user_progress.lesson3_quiz_score,
            'bestScore': user_progress.lesson3_best_score
        },
        'totalProgress': total_progress,
        'progressHistory': history_data
    })

@app.route('/api/progress', methods=['POST'])
def update_progress():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401
    
    data = request.json
    user_progress = Progress.query.filter_by(user_id=user_id).first()
    
    if not user_progress:
        return jsonify({'error': 'No progress data found'}), 404
    
    # Update progress data
    lesson_num = data.get('lessonNumber')
    is_complete = data.get('complete', False)
    quiz_score = data.get('quizScore', 0)
    
    if lesson_num == 1:
        user_progress.lesson1_complete = is_complete
        user_progress.lesson1_quiz_score = quiz_score
        if quiz_score > user_progress.lesson1_best_score:
            user_progress.lesson1_best_score = quiz_score
    elif lesson_num == 2:
        user_progress.lesson2_complete = is_complete
        user_progress.lesson2_quiz_score = quiz_score
        if quiz_score > user_progress.lesson2_best_score:
            user_progress.lesson2_best_score = quiz_score
    elif lesson_num == 3:
        user_progress.lesson3_complete = is_complete
        user_progress.lesson3_quiz_score = quiz_score
        if quiz_score > user_progress.lesson3_best_score:
            user_progress.lesson3_best_score = quiz_score
    
    # Calculate new total progress
    total_lessons = 3
    completed_lessons = sum([
        user_progress.lesson1_complete,
        user_progress.lesson2_complete,
        user_progress.lesson3_complete
    ])
    total_progress = int((completed_lessons / total_lessons) * 100)
    
    # Add new history entry
    new_history = ProgressHistory(progress_id=user_progress.id, value=total_progress)
    db.session.add(new_history)
    db.session.commit()
    
    return jsonify({'success': True, 'totalProgress': total_progress})

@app.route('/api/reset-progress', methods=['POST'])
def reset_progress():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401
    
    user_progress = Progress.query.filter_by(user_id=user_id).first()
    
    if not user_progress:
        return jsonify({'error': 'No progress data found'}), 404
    
    # Reset all progress
    user_progress.lesson1_complete = False
    user_progress.lesson1_quiz_score = 0
    user_progress.lesson1_best_score = 0
    user_progress.lesson2_complete = False
    user_progress.lesson2_quiz_score = 0
    user_progress.lesson2_best_score = 0
    user_progress.lesson3_complete = False
    user_progress.lesson3_quiz_score = 0
    user_progress.lesson3_best_score = 0
    
    # Delete all history entries
    ProgressHistory.query.filter_by(progress_id=user_progress.id).delete()
    
    # Create new initial history entry
    new_history = ProgressHistory(progress_id=user_progress.id, value=0)
    db.session.add(new_history)
    db.session.commit()
    
    return jsonify({'success': True})

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 