"""
Vercel Serverless Entry Point
Wraps Flask app for Vercel Python runtime
"""

from backend.app import app

# Vercel expects an 'app' or 'handler' at module level
# The Flask app is already exported and compatible with WSGI
