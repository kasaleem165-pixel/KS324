"""Run this file to start the Animal Sales app: python run.py"""
from app import app, init_db

if __name__ == "__main__":
    init_db()
    print("\n  Animal Sales Records")
    print("  Open your browser at: http://localhost:5000\n")
    app.run(debug=False, port=5000)
