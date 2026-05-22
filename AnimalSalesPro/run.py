"""Run this file to start the Animal Sales app: python run.py"""
import threading, webbrowser
from app import app, init_db, migrate_db

def open_browser():
    webbrowser.open("http://localhost:5000")

if __name__ == "__main__":
    init_db()
    migrate_db()
    print("\n  Animal Sales Records")
    print("  Opening browser at: http://localhost:5000")
    print("  Press Ctrl+C to stop the app\n")
    threading.Timer(1.5, open_browser).start()
    app.run(debug=False, port=5000)
