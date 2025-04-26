from flask import Blueprint, render_template, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import User, LessonProgress, ProgressHistory
from datetime import datetime

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html', title='Personal Finance Fundamentals')

@main.route('/lesson/<int:lesson_number>')
def lesson(lesson_number):
    if lesson_number not in [1, 2, 3]:
        return render_template('404.html'), 404
    return render_template(f'lesson{lesson_number}.html', title=f'Lesson {lesson_number}')

@main.route('/quiz/<int:lesson_number>')
def quiz(lesson_number):
    if lesson_number not in [1, 2, 3]:
        return render_template('404.html'), 404
    return render_template(f'quiz{lesson_number}.html', title=f'Quiz {lesson_number}')

@main.route('/statistics')
@login_required
def statistics():
    return render_template('statistics.html', title='Your Progress')

# API routes for AJAX calls
@main.route('/api/progress', methods=['GET'])
@login_required
def get_progress():
    progress_data = {}
    lesson_progress = LessonProgress.query.filter_by(user_id=current_user.id).all()
    
    for progress in lesson_progress:
        progress_data[f'lesson{progress.lesson_number}'] = {
            'completed': progress.completed,
            'bestScore': progress.best_score,
            'quizCount': progress.quiz_attempts
        }
    
    # Add total progress
    completed_count = sum(1 for p in lesson_progress if p.completed)
    progress_data['totalProgress'] = (completed_count / 3) * 100  # 3 lessons total
    
    # Add progress history
    history = ProgressHistory.query.filter_by(user_id=current_user.id).order_by(ProgressHistory.date).all()
    progress_data['progressHistory'] = [{'date': h.date.isoformat(), 'value': h.value} for h in history]
    
    return jsonify(progress_data)

@main.route('/api/quiz/score', methods=['POST'])
@login_required
def update_quiz_score():
    data = request.json
    lesson_number = data.get('lessonNumber')
    score = data.get('score')
    
    if not lesson_number or score is None:
        return jsonify({'error': 'Missing required data'}), 400
    
    progress = LessonProgress.query.filter_by(
        user_id=current_user.id, 
        lesson_number=lesson_number
    ).first()
    
    if not progress:
        return jsonify({'error': 'Progress record not found'}), 404
    
    # Update completion status
    progress.completed = True
    
    # Update quiz attempts count
    progress.quiz_attempts += 1
    
    # Update best score if current score is higher
    if score > progress.best_score:
        progress.best_score = score
    
    # Update last updated timestamp
    progress.last_updated = datetime.utcnow()
    
    # Add progress history entry
    completed_count = LessonProgress.query.filter_by(
        user_id=current_user.id, 
        completed=True
    ).count()
    
    progress_value = (completed_count / 3) * 100  # 3 lessons total
    
    history_entry = ProgressHistory(
        user_id=current_user.id,
        date=datetime.utcnow(),
        value=progress_value
    )
    
    db.session.add(history_entry)
    db.session.commit()
    
    return jsonify({'success': True})

@main.route('/api/progress/reset', methods=['POST'])
@login_required
def reset_progress():
    # Reset lesson progress
    lesson_progress = LessonProgress.query.filter_by(user_id=current_user.id).all()
    
    for progress in lesson_progress:
        progress.completed = False
        progress.best_score = 0
        progress.quiz_attempts = 0
        progress.last_updated = datetime.utcnow()
    
    # Delete progress history
    ProgressHistory.query.filter_by(user_id=current_user.id).delete()
    
    # Add initial progress history entry
    history_entry = ProgressHistory(
        user_id=current_user.id,
        date=datetime.utcnow(),
        value=0
    )
    
    db.session.add(history_entry)
    db.session.commit()
    
    return jsonify({'success': True}) 