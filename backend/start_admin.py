"""
Start script for admin server
"""
import uvicorn
from admin_server import app

if __name__ == "__main__":
    print("Starting Edge Chronicle Admin API...")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8001,
        reload=True
    )