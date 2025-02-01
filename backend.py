from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)

# Initialize the database (this should ideally be in a separate file or function)
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action_name TEXT,
        points INTEGER,
        date DATE
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS streaks (
        user_id INTEGER PRIMARY KEY,
        current_streak INTEGER,
        last_submission DATE
    )''')
    conn.commit()
    conn.close()

# Uncomment this line to initialize the database once
# init_db()

@app.route('/submit_actions', methods=['POST'])
def submit_actions():
    try:
        # Get the data from the frontend (the selected actions and points)
        data = request.json
        user_id = data['user_id']
        actions = data['actions']  # List of actions (each action has a 'name' and 'points')

        # Connect to the database
        conn = sqlite3.connect('database.db')
        c = conn.cursor()

        # Store the actions in the database for the current day
        for action in actions:
            c.execute('INSERT INTO actions (user_id, action_name, points, date) VALUES (?, ?, ?, ?)', 
                      (user_id, action['name'], action['points'], str(datetime.today().date())))

        # Update the streak for the user
        current_streak = get_streak(user_id, c)
        c.execute('''INSERT OR REPLACE INTO streaks (user_id, current_streak, last_submission) 
                     VALUES (?, ?, ?)''', (user_id, current_streak + 1, str(datetime.today().date())))

        conn.commit()
        conn.close()

        return jsonify({'message': 'Actions submitted successfully', 'points': sum([action['points'] for action in actions])})

    except Exception as e:
        print(f"Error: {e}")  # Log the error for debugging
        return jsonify({'error': str(e)}), 500  # Return an error response

def get_streak(user_id, cursor):
    cursor.execute('SELECT current_streak, last_submission FROM streaks WHERE user_id = ?', (user_id,))
    result = cursor.fetchone()
    
    if result:
        current_streak, last_submission = result
        # Check if the streak is broken (by checking if the last submission was the previous day)
        if datetime.strptime(last_submission, '%Y-%m-%d') < datetime.today() - timedelta(days=1):
            return 1  # Reset streak if a day is missed
        return current_streak
    else:
        return 0

@app.route('/get_streak/<int:user_id>', methods=['GET'])
def get_user_streak(user_id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    streak = get_streak(user_id, c)
    conn.close()
    return jsonify({'user_id': user_id, 'streak': streak})

@app.route('/reset_daily_points', methods=['GET'])
def reset_daily_points():
    # This route can be triggered once per day (e.g., by a cron job or manually)
    today = str(datetime.today().date())
    
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('DELETE FROM actions WHERE date != ?', (today,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Daily points reset successfully'})

@app.route('/reset_weekly_points', methods=['GET'])
def reset_weekly_points():
    # This route can be triggered once a week (e.g., by a cron job or manually)
    today = str(datetime.today().date())
    
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('UPDATE actions SET points = 0 WHERE date <= ?', (today,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Weekly points reset successfully'})

if __name__ == '__main__':
    app.run(debug=True)