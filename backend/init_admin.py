"""
Initialize admin user for Edge Chronicle
"""
import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

async def create_admin_user():
    """Create default admin user"""
    print("Initializing Edge Chronicle Admin...")
    
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client.edge_chronicle
    
    users_collection = db.users
    
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
        "role": "admin",
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
        "role": "editor",
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
        "role": "reporter",
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
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())