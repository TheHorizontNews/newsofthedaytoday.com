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
    allow_origins=["http://localhost:3000"],
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

@app.get("/")
async def root():
    return {"message": "Edge Chronicle Admin API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/auth/login")
async def login(login_request: LoginRequest):
    """Simple login endpoint"""
    # For now, just check if user exists
    user = await db.users.find_one({"username": login_request.username})
    if user:
        return {"access_token": "fake_token_for_now", "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/articles/")
async def get_articles():
    """Get all articles"""
    articles = await db.articles.find().to_list(length=100)
    return [{"id": str(article["_id"]), "title": article["title"]} for article in articles]

@app.get("/api/users/")
async def get_users():
    """Get all users"""
    users = await db.users.find().to_list(length=100)
    return [{"id": str(user["_id"]), "username": user["username"], "role": user["role"]} for user in users]

@app.get("/api/categories/")
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find().to_list(length=100)
    return [{"id": str(cat["_id"]), "name": cat["name"]} for cat in categories]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)