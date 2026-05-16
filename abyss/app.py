import sqlite3
import os
import json
import uuid
import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
from flask import Flask, render_template, request, jsonify, g

app = Flask(__name__)
app.secret_key = os.urandom(24)

DB_PATH     = os.path.join(os.path.dirname(__file__), 'data', 'abyss.db')
MODELS_PATH = os.path.join(os.path.dirname(__file__), 'models')

# ── Database ──────────────────────────────────────────────────────────────────

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA journal_mode=WAL')
        g.db.execute('PRAGMA foreign_keys=ON')
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.executescript('''
        CREATE TABLE IF NOT EXISTS progress (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id   TEXT    NOT NULL,
            topic_id     TEXT    NOT NULL,
            completed    INTEGER NOT NULL DEFAULT 0,
            quiz_score   INTEGER NOT NULL DEFAULT 0,
            quiz_total   INTEGER NOT NULL DEFAULT 5,
            time_spent   INTEGER NOT NULL DEFAULT 0,
            attempts     INTEGER NOT NULL DEFAULT 0,
            updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
            UNIQUE(session_id, topic_id)
        );

        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id   TEXT    NOT NULL,
            topic_id     TEXT    NOT NULL,
            question_idx INTEGER NOT NULL,
            correct      INTEGER NOT NULL,
            time_taken   INTEGER NOT NULL,
            created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_progress_session ON progress(session_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_session     ON quiz_attempts(session_id, topic_id);
    ''')
    db.commit()
    db.close()

# ── Pre-trained models (fit once at startup, loaded from disk if exists) ──────

def build_demo_models():
    os.makedirs(MODELS_PATH, exist_ok=True)
    path = os.path.join(MODELS_PATH, 'linear_regression_demo.pkl')

    if not os.path.exists(path):
        X = np.array([1,2,3,4,5,6,7,8,9,10]).reshape(-1,1)
        y = np.array([35,45,50,60,65,70,78,82,88,95], dtype=float)
        model = LinearRegression()
        model.fit(X, y)
        joblib.dump(model, path)

    return joblib.load(path)

LR_MODEL = None

def get_lr_model():
    global LR_MODEL
    if LR_MODEL is None:
        LR_MODEL = build_demo_models()
    return LR_MODEL

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_session_id():
    return request.headers.get('X-Session-ID') or str(uuid.uuid4())

def validate_number(value, lo, hi, name):
    try:
        n = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{name}' must be a number.")
    if not (lo <= n <= hi):
        raise ValueError(f"'{name}' must be between {lo} and {hi}.")
    return n

# ── Routes — pages ────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ml')
def ml_home():
    return render_template('ml/index.html')

@app.route('/ml/topic/<int:num>')
def ml_topic(num):
    templates = {1: 'ml/topic1.html', 2: 'ml/topic2.html', 3: 'ml/topic3.html'}
    tpl = templates.get(num)
    if not tpl:
        return render_template('404.html'), 404

    quiz_file = os.path.join(os.path.dirname(__file__), 'data', f'quiz_ml_{num}.json')
    quiz = []
    if os.path.exists(quiz_file):
        with open(quiz_file) as f:
            quiz = json.load(f)

    return render_template(tpl, topic_num=num, quiz=quiz)

# ── Routes — demo API ─────────────────────────────────────────────────────────

@app.route('/demo/linear-regression', methods=['POST'])
def demo_linear_regression():
    body = request.get_json(silent=True) or {}
    try:
        hours = validate_number(body.get('hours'), 0.5, 15, 'hours')
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    model      = get_lr_model()
    prediction = float(model.predict([[hours]])[0])
    slope      = float(model.coef_[0])
    intercept  = float(model.intercept_)

    train_x = [1,2,3,4,5,6,7,8,9,10]
    train_y = [35,45,50,60,65,70,78,82,88,95]

    line_x = [0.5, 15]
    line_y = [round(slope * x + intercept, 2) for x in line_x]

    return jsonify({
        'prediction': round(prediction, 1),
        'slope':      round(slope, 2),
        'intercept':  round(intercept, 2),
        'hours':      hours,
        'train_x':    train_x,
        'train_y':    train_y,
        'line_x':     line_x,
        'line_y':     line_y
    })

# ── Routes — progress ─────────────────────────────────────────────────────────

@app.route('/progress/save', methods=['POST'])
def save_progress():
    body       = request.get_json(silent=True) or {}
    session_id = get_session_id()
    topic_id   = body.get('topic_id', '')

    if not topic_id:
        return jsonify({'error': 'topic_id required'}), 400

    try:
        quiz_score = int(body.get('quiz_score', 0))
        quiz_total = int(body.get('quiz_total', 5))
        time_spent = int(body.get('time_spent', 0))
        completed  = 1 if body.get('completed') else 0
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid data types'}), 400

    db = get_db()
    db.execute('''
        INSERT INTO progress (session_id, topic_id, completed, quiz_score, quiz_total, time_spent, attempts, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
        ON CONFLICT(session_id, topic_id) DO UPDATE SET
            completed  = MAX(completed, excluded.completed),
            quiz_score = MAX(quiz_score, excluded.quiz_score),
            time_spent = time_spent + excluded.time_spent,
            attempts   = attempts + 1,
            updated_at = datetime('now')
    ''', (session_id, topic_id, completed, quiz_score, quiz_total, time_spent))
    db.commit()

    return jsonify({'status': 'saved'})

@app.route('/progress/<topic_id>')
def get_progress(topic_id):
    session_id = get_session_id()
    db  = get_db()
    row = db.execute(
        'SELECT * FROM progress WHERE session_id = ? AND topic_id = ?',
        (session_id, topic_id)
    ).fetchone()

    if not row:
        return jsonify({'found': False})

    return jsonify({
        'found':      True,
        'completed':  bool(row['completed']),
        'quiz_score': row['quiz_score'],
        'quiz_total': row['quiz_total'],
        'time_spent': row['time_spent'],
        'attempts':   row['attempts']
    })

@app.route('/progress/summary')
def progress_summary():
    session_id = get_session_id()
    db = get_db()
    rows = db.execute(
        'SELECT topic_id, completed, quiz_score, quiz_total FROM progress WHERE session_id = ?',
        (session_id,)
    ).fetchall()

    topics_done = sum(1 for r in rows if r['completed'])
    avg_score   = 0
    if rows:
        avg_score = round(sum(r['quiz_score'] / max(r['quiz_total'], 1) for r in rows) / len(rows) * 100)

    readiness = min(100, int(topics_done * 4.5 + avg_score * 0.55))

    return jsonify({
        'topics_completed': topics_done,
        'avg_quiz_score':   avg_score,
        'readiness':        readiness,
        'topic_list':       [dict(r) for r in rows]
    })

# ── Routes — quiz attempt logging ─────────────────────────────────────────────

@app.route('/quiz/attempt', methods=['POST'])
def log_quiz_attempt():
    body       = request.get_json(silent=True) or {}
    session_id = get_session_id()

    topic_id     = body.get('topic_id', '')
    question_idx = body.get('question_idx', 0)
    correct      = 1 if body.get('correct') else 0
    time_taken   = int(body.get('time_taken', 0))

    if not topic_id:
        return jsonify({'error': 'topic_id required'}), 400

    db = get_db()
    db.execute(
        'INSERT INTO quiz_attempts (session_id, topic_id, question_idx, correct, time_taken) VALUES (?,?,?,?,?)',
        (session_id, topic_id, question_idx, correct, time_taken)
    )
    db.commit()
    return jsonify({'status': 'logged'})

# ── Routes — AI chat ──────────────────────────────────────────────────────────

@app.route('/chat', methods=['POST'])
def chat():
    body    = request.get_json(silent=True) or {}
    message = (body.get('message') or '').strip()
    topic   = body.get('topic', 'general')

    if not message:
        return jsonify({'error': 'Empty message'}), 400

    if len(message) > 500:
        return jsonify({'error': 'Message too long'}), 400

    reply = _get_ai_reply(message, topic)
    return jsonify({'reply': reply})

def _get_ai_reply(message, topic):
    try:
        import google.generativeai as genai

        genai.configure(api_key=os.environ.get('GEMINI_API_KEY', ''))
        model = genai.GenerativeModel('gemini-1.5-flash')

        system = (
            "You are the Abyss AI tutor — a strict, precise, placement-focused ML tutor. "
            "You only answer questions about machine learning, AI, data science, and placement preparation. "
            "If asked anything else, say: 'I only help with ML, AI, and placement prep.' "
            f"The student is currently studying: {topic}. "
            "Keep answers under 150 words. Be direct. No fluff. Give code examples when relevant."
        )

        response = model.generate_content(f"{system}\n\nStudent: {message}")
        return response.text

    except Exception:
        return (
            "The AI tutor is unavailable right now. "
            "Add your GEMINI_API_KEY to the environment to enable it."
        )

# ── Boot ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    get_lr_model()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
