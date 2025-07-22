"""
Initialize admin user and default data
"""
import asyncio
import os
import sys
from datetime import datetime
from pymongo import MongoClient
from auth import get_password_hash

def init_admin():
    """Initialize admin user"""
    
    # Database connection
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "edge_chronicle")
    
    client = MongoClient(mongo_url)
    db = client[db_name]
    
    print("🔧 Initializing Edge Chronicle database...")
    
    # Check if admin exists
    users_collection = db.users
    admin_exists = users_collection.find_one({"username": "admin"})
    
    if not admin_exists:
        # Create admin user
        admin_user = {
            "username": "admin",
            "email": "admin@edgechronicle.com",
            "password": get_password_hash("admin123"),
            "role": "admin",
            "is_active": True,
            "profile": {
                "name": "Admin User",
                "bio": "System Administrator",
                "avatar": ""
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        users_collection.insert_one(admin_user)
        print("✅ Admin user created successfully")
        print("   Username: admin")
        print("   Password: admin123")
    else:
        print("ℹ️  Admin user already exists")
    
    # Create sample editor user
    editor_exists = users_collection.find_one({"username": "editor"})
    if not editor_exists:
        editor_user = {
            "username": "editor",
            "email": "editor@edgechronicle.com",
            "password": get_password_hash("editor123"),
            "role": "editor",
            "is_active": True,
            "profile": {
                "name": "Editor User",
                "bio": "Content Editor",
                "avatar": ""
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        users_collection.insert_one(editor_user)
        print("✅ Editor user created (editor/editor123)")
    
    # Create default categories if they don't exist
    categories_collection = db.categories
    categories_count = categories_collection.count_documents({})
    
    if categories_count == 0:
        default_categories = [
            {"name": "Світ", "slug": "world", "description": "Світові новини", "created_at": datetime.utcnow()},
            {"name": "Війна", "slug": "war", "description": "Війна в Україні", "created_at": datetime.utcnow()},
            {"name": "Україна", "slug": "ukraine", "description": "Новини України", "created_at": datetime.utcnow()},
            {"name": "Політика", "slug": "politics", "description": "Політичні новини", "created_at": datetime.utcnow()},
            {"name": "Наука та IT", "slug": "science-tech", "description": "Наука та технології", "created_at": datetime.utcnow()},
            {"name": "Леді", "slug": "lifestyle", "description": "Стиль життя", "created_at": datetime.utcnow()},
        ]
        
        categories_collection.insert_many(default_categories)
        print("✅ Default categories created")
    else:
        print("ℹ️  Categories already exist")
    
    client.close()
    print("🚀 Database initialization complete!")
    print("🌐 Admin panel: https://yourdomain.com/admin/login")
    print("📊 API docs: https://yourdomain.com/docs")

if __name__ == "__main__":
    init_admin()
