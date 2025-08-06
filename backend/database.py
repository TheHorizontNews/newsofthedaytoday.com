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
    """Initialize database with indexes and default data"""
    db = Database.get_database()
    
    # Create indexes
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True)
    await db.articles.create_index("slug", unique=True)
    await db.articles.create_index("published_at")
    await db.articles.create_index("category_id")
    await db.articles.create_index("author_id")
    await db.categories.create_index("slug", unique=True)
    await db.analytics.create_index([("article_id", 1), ("date", 1)])
    
    # Create default categories if they don't exist
    categories_collection = get_categories_collection()
    default_categories = [
        {"name": "Світ", "slug": "world", "description": "Міжнародні новини"},
        {"name": "Війна", "slug": "war", "description": "Військові новини"},
        {"name": "Україна", "slug": "ukraine", "description": "Новини України"},
        {"name": "Політика", "slug": "politics", "description": "Політичні новини"},
        {"name": "Наука та IT", "slug": "science-tech", "description": "Наука та технології"},
        {"name": "Леді", "slug": "lifestyle", "description": "Стиль життя"},
    ]
    
    for cat in default_categories:
        existing = await categories_collection.find_one({"slug": cat["slug"]})
        if not existing:
            await categories_collection.insert_one(cat)
    
    print("Database initialized successfully")