"""
Simple Admin API Server for Edge Chronicle
"""
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, List
import os

# Simple app
app = FastAPI(
    title="Edge Chronicle Admin API",
    description="Admin API for Edge Chronicle News Site",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = None
db = None

@app.on_event("startup")
async def startup_event():
    global client, db
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client.edge_chronicle
    print("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_event():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

# Simple models
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Mock user data
MOCK_USER = {
    "id": "admin",
    "username": "admin",
    "email": "admin@edgechronicle.com",
    "role": "admin",
    "profile": {
        "name": "Administrator",
        "bio": "System Administrator"
    },
    "created_at": datetime.utcnow().isoformat(),
    "is_active": True
}

@app.get("/")
async def root():
    return {"message": "Edge Chronicle Admin API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/auth/login")
async def login(login_request: LoginRequest):
    """Simple login endpoint"""
    # Check if user exists in database
    user = await db.users.find_one({"username": login_request.username})
    if user:
        return {"access_token": "mock_admin_token", "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/auth/me")
async def get_current_user():
    """Get current user info"""
    return MOCK_USER

@app.get("/api/articles/")
async def get_articles():
    """Get all articles"""
    articles = await db.articles.find().to_list(length=100)
    
    # Mock articles if none exist
    if not articles:
        return []
    
    result = []
    for article in articles:
        # Get author and category info
        author = await db.users.find_one({"_id": article.get("author_id")}) or {
            "username": "admin",
            "profile": {"name": "Administrator"}
        }
        
        category = await db.categories.find_one({"_id": article.get("category_id")}) or {
            "name": "General",
            "slug": "general"
        }
        
        result.append({
            "id": str(article["_id"]),
            "title": article.get("title", ""),
            "subtitle": article.get("subtitle"),
            "content": article.get("content", ""),
            "author": {
                "username": author.get("username", "admin"),
                "profile": author.get("profile", {"name": "Administrator"})
            },
            "category": {
                "id": str(category.get("_id", "")),
                "name": category.get("name", "General"),
                "slug": category.get("slug", "general")
            },
            "status": article.get("status", "draft"),
            "views": article.get("views", 0),
            "created_at": article.get("created_at", datetime.utcnow()).isoformat(),
            "updated_at": article.get("updated_at", datetime.utcnow()).isoformat(),
            "tags": article.get("tags", [])
        })
    
    return result

@app.get("/api/users/")
async def get_users():
    """Get all users"""
    users = await db.users.find().to_list(length=100)
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "profile": user.get("profile", {}),
            "created_at": user.get("created_at", datetime.utcnow()).isoformat(),
            "last_login": user.get("last_login"),
            "is_active": user.get("is_active", True)
        })
    return result

@app.get("/api/categories/")
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find().to_list(length=100)
    result = []
    for cat in categories:
        result.append({
            "id": str(cat["_id"]),
            "name": cat["name"],
            "slug": cat.get("slug", ""),
            "description": cat.get("description"),
            "created_at": cat.get("created_at", datetime.utcnow()).isoformat()
        })
    return result

@app.get("/api/analytics/dashboard")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    # Mock analytics data
    return {
        "total_articles": 0,
        "published_articles": 0,
        "draft_articles": 0,
        "total_views": 0,
        "week_views": 0,
        "month_views": 0,
        "top_articles": [],
        "daily_views": [
            {"date": "2025-07-10", "views": 120},
            {"date": "2025-07-11", "views": 98},
            {"date": "2025-07-12", "views": 150},
            {"date": "2025-07-13", "views": 200}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)