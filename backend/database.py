"""
Database configuration and connection management
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

# Database connection
def get_database():
    """Get database instance"""
    return Database.database

def get_articles_collection():
    """Get articles collection"""
    return Database.database.articles

def get_users_collection():
    """Get users collection"""
    return Database.database.users

def get_categories_collection():
    """Get categories collection"""
    return Database.database.categories

def get_analytics_collection():
    """Get analytics collection"""
    return Database.database.analytics

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "edge_chronicle")
    
    logger.info(f"Connecting to MongoDB at {mongo_url}")
    
    try:
        Database.client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        # Test connection
        await Database.client.admin.command('ismaster')
        Database.database = Database.client[db_name]
        logger.info(f"Connected to MongoDB database: {db_name}")
        
        # Create indexes
        await create_indexes()
        
    except ServerSelectionTimeoutError as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if Database.client:
        Database.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes"""
    try:
        # Articles indexes
        await Database.database.articles.create_index("slug", unique=True)
        await Database.database.articles.create_index("published_at")
        await Database.database.articles.create_index("status")
        await Database.database.articles.create_index("category_id")
        await Database.database.articles.create_index("author_id")
        await Database.database.articles.create_index("tags")
        
        # Users indexes
        await Database.database.users.create_index("username", unique=True)
        await Database.database.users.create_index("email", unique=True)
        
        # Categories indexes
        await Database.database.categories.create_index("slug", unique=True)
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

async def init_db():
    """Initialize database with default data"""
    await connect_to_mongo()
    
    # Check if categories exist, if not create default ones
    categories_collection = get_categories_collection()
    categories_count = await categories_collection.count_documents({})
    
    if categories_count == 0:
        default_categories = [
            {"name": "Світ", "slug": "world", "description": "Світові новини", "created_at": datetime.utcnow()},
            {"name": "Війна", "slug": "war", "description": "Війна в Україні", "created_at": datetime.utcnow()},
            {"name": "Україна", "slug": "ukraine", "description": "Новини України", "created_at": datetime.utcnow()},
            {"name": "Політика", "slug": "politics", "description": "Політичні новини", "created_at": datetime.utcnow()},
            {"name": "Наука та IT", "slug": "science-tech", "description": "Наука та технології", "created_at": datetime.utcnow()},
            {"name": "Леді", "slug": "lifestyle", "description": "Стиль життя", "created_at": datetime.utcnow()},
        ]
        
        await categories_collection.insert_many(default_categories)
        logger.info("Default categories created")

init_db = init_db
