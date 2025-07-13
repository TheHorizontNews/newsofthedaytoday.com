"""
Initialize admin user for Edge Chronicle
"""
import asyncio
from datetime import datetime
from database import init_db, get_users_collection, get_categories_collection
from auth import get_password_hash
from models import UserRole

async def create_admin_user():
    """Create default admin user"""
    print("Initializing Edge Chronicle Admin...")
    
    # Initialize database
    await init_db()
    
    users_collection = get_users_collection()
    
    # Check if admin user already exists
    admin_user = await users_collection.find_one({"role": "admin"})
    if admin_user:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_data = {
        "username": "admin",
        "email": "admin@edgechronicle.com",
        "password_hash": get_password_hash("admin123"),
        "role": UserRole.ADMIN,
        "profile": {
            "name": "Administrator",
            "bio": "System Administrator",
            "avatar": None
        },
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(admin_data)
    print(f"Admin user created with ID: {result.inserted_id}")
    
    # Create sample editor user
    editor_data = {
        "username": "editor",
        "email": "editor@edgechronicle.com", 
        "password_hash": get_password_hash("editor123"),
        "role": UserRole.EDITOR,
        "profile": {
            "name": "John Editor",
            "bio": "Chief Editor",
            "avatar": None
        },
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(editor_data)
    print(f"Editor user created with ID: {result.inserted_id}")
    
    # Create sample reporter user
    reporter_data = {
        "username": "reporter",
        "email": "reporter@edgechronicle.com",
        "password_hash": get_password_hash("reporter123"),
        "role": UserRole.REPORTER,
        "profile": {
            "name": "Jane Reporter",
            "bio": "News Reporter",
            "avatar": None
        },
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(reporter_data)
    print(f"Reporter user created with ID: {result.inserted_id}")
    
    print("\nDefault users created:")
    print("Admin: admin / admin123")
    print("Editor: editor / editor123")
    print("Reporter: reporter / reporter123")
    print("\nAdmin panel is ready!")

if __name__ == "__main__":
    asyncio.run(create_admin_user())