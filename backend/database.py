"""
Database configuration and connection
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    def get_client(cls) -> AsyncIOMotorClient:
        if cls.client is None:
            # Try multiple environment variable names for Emergent compatibility
            mongo_url = (
                os.getenv("MONGO_URL") or 
                os.getenv("MongoURLEnv") or 
                os.getenv("MONGODB_URL") or
                "mongodb://localhost:27017"
            )
            print(f"🔗 Connecting to MongoDB: {mongo_url}")
            cls.client = AsyncIOMotorClient(mongo_url)
        return cls.client
    
    @classmethod
    def get_database(cls):
        client = cls.get_client()
        return client.edge_chronicle
    
    @classmethod
    async def close_connection(cls):
        if cls.client:
            cls.client.close()
            cls.client = None

# Database collections
def get_users_collection():
    db = Database.get_database()
    return db.users

def get_articles_collection():
    db = Database.get_database()
    return db.articles

def get_categories_collection():
    db = Database.get_database()
    return db.categories

def get_analytics_collection():
    db = Database.get_database()
    return db.analytics

# Database initialization
async def init_db():
    """Initialize database with default data (without creating indexes for Emergent compatibility)"""
    db = Database.get_database()
    
    print("🔗 Initializing database...")
    
    # Skip index creation for Emergent deployment
    # Indexes will be created automatically by MongoDB when needed
    
    # Create default categories if they don't exist
    categories_collection = get_categories_collection()
    default_categories = [
        {"name": "Technology", "slug": "technology", "description": "Latest technology news"},
        {"name": "Medicine", "slug": "medicine", "description": "Medical breakthroughs"},
        {"name": "Space & Physics", "slug": "space-physics", "description": "Space exploration and physics"},
        {"name": "Environment", "slug": "environment", "description": "Environmental science"},
        {"name": "AI & Computing", "slug": "ai-computing", "description": "Artificial Intelligence news"},
        {"name": "Biology", "slug": "biology", "description": "Biological sciences"},
    ]
    
    for cat in default_categories:
        existing = await categories_collection.find_one({"slug": cat["slug"]})
        if not existing:
            await categories_collection.insert_one(cat)
            print(f"✅ Created category: {cat['name']}")
    
    print("✅ Database initialized successfully")