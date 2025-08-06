"""
SQLite database configuration and connection
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import Base, CategoryTable
import json

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./science_digest_news.db")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    future=True
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

class Database:
    """Database utility class"""
    
    @staticmethod
    async def get_session() -> AsyncSession:
        """Get database session"""
        async with AsyncSessionLocal() as session:
            return session
    
    @staticmethod
    async def create_tables():
        """Create all database tables"""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Database tables created successfully")

# Dependency to get database session
async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Database initialization
async def init_db():
    """Initialize database with default data"""
    print("🔗 Initializing SQLite database...")
    
    # Create tables
    await Database.create_tables()
    
    # Add default categories
    async with AsyncSessionLocal() as session:
        try:
            default_categories = [
                {"name": "Technology", "slug": "technology", "description": "Latest technology news and innovations"},
                {"name": "Medicine", "slug": "medicine", "description": "Medical breakthroughs and health research"},
                {"name": "Space & Physics", "slug": "space-physics", "description": "Space exploration and physics discoveries"},
                {"name": "Environment", "slug": "environment", "description": "Environmental science and climate research"},
                {"name": "AI & Computing", "slug": "ai-computing", "description": "Artificial Intelligence and computing advances"},
                {"name": "Biology", "slug": "biology", "description": "Biological sciences and life research"},
            ]
            
            for cat_data in default_categories:
                # Check if category exists
                from sqlalchemy import select
                result = await session.execute(
                    select(CategoryTable).where(CategoryTable.slug == cat_data["slug"])
                )
                existing = result.scalar_one_or_none()
                
                if not existing:
                    category = CategoryTable(**cat_data)
                    session.add(category)
                    print(f"✅ Created category: {cat_data['name']}")
            
            await session.commit()
            print("✅ Database initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            await session.rollback()
            raise

def tags_to_json(tags_list):
    """Convert list of tags to JSON string"""
    if not tags_list:
        return "[]"
    return json.dumps(tags_list)

def json_to_tags(tags_json):
    """Convert JSON string to list of tags"""
    if not tags_json:
        return []
    try:
        return json.loads(tags_json)
    except:
        return []