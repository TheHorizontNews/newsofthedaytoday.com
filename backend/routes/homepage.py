"""
Homepage configuration routes
"""
from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from auth import get_current_active_user
from database import get_db
from models import UserTable

router = APIRouter(prefix="/api/homepage", tags=["homepage"])


class HomepageBlockItem(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    category: Optional[Dict] = None
    featured_image: Optional[str] = None
    slug: str
    views: int = 0


class HomepageBlock(BaseModel):
    id: str
    name: str
    articles: List[HomepageBlockItem]
    maxArticles: int


class HomepageConfig(BaseModel):
    blocks: List[HomepageBlock]
    updated_at: Optional[datetime] = None


@router.get("/config")
async def get_homepage_config(
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get homepage configuration"""
    try:
        # Try to get saved config from database
        result = await db.execute(
            text("SELECT config FROM homepage_config ORDER BY created_at DESC LIMIT 1")
        )
        row = result.fetchone()
        
        if row and row[0]:
            import json
            return json.loads(row[0])
        
        # Return default configuration if none exists
        return {
            "blocks": [
                {
                    "id": "hero",
                    "name": "Hero Section",
                    "articles": [],
                    "maxArticles": 1
                },
                {
                    "id": "main",
                    "name": "Main News", 
                    "articles": [],
                    "maxArticles": 3
                },
                {
                    "id": "sidebar",
                    "name": "Sidebar News",
                    "articles": [],
                    "maxArticles": 5
                },
                {
                    "id": "trending",
                    "name": "Trending",
                    "articles": [],
                    "maxArticles": 4
                },
                {
                    "id": "featured",
                    "name": "Featured Articles",
                    "articles": [],
                    "maxArticles": 6
                }
            ],
            "updated_at": None
        }
        
    except Exception as e:
        print(f"Error getting homepage config: {e}")
        # Return default config on error
        return {
            "blocks": [
                {"id": "hero", "name": "Hero Section", "articles": [], "maxArticles": 1},
                {"id": "main", "name": "Main News", "articles": [], "maxArticles": 3},
                {"id": "sidebar", "name": "Sidebar News", "articles": [], "maxArticles": 5},
                {"id": "trending", "name": "Trending", "articles": [], "maxArticles": 4},
                {"id": "featured", "name": "Featured Articles", "articles": [], "maxArticles": 6}
            ]
        }


@router.put("/config")
async def save_homepage_config(
    config: HomepageConfig,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Save homepage configuration"""
    try:
        # Create table if it doesn't exist
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS homepage_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                config TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_by TEXT
            )
        """))
        
        import json
        config_json = json.dumps({
            "blocks": [block.dict() for block in config.blocks],
            "updated_at": datetime.utcnow().isoformat()
        })
        
        # Insert new configuration
        await db.execute(
            text("INSERT INTO homepage_config (config, updated_by) VALUES (:config, :user_id)"),
            {"config": config_json, "user_id": current_user.id}
        )
        
        await db.commit()
        
        return {"message": "Homepage configuration saved successfully"}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save homepage configuration: {str(e)}")


@router.get("/public")
async def get_public_homepage_config(db: AsyncSession = Depends(get_db)):
    """Get homepage configuration for public display (no auth required)"""
    try:
        # Get saved config from database
        result = await db.execute(
            text("SELECT config FROM homepage_config ORDER BY created_at DESC LIMIT 1")
        )
        row = result.fetchone()
        
        if row and row[0]:
            import json
            return json.loads(row[0])
        
        # Return empty config if none exists
        return {
            "blocks": []
        }
        
    except Exception as e:
        print(f"Error getting public homepage config: {e}")
        return {
            "blocks": []
        }