"""
Analytics routes for SQLite
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_active_user
from database import get_db
from models import UserTable, ArticleTable, AnalyticsTable

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard analytics"""
    try:
        # Get article counts
        total_articles_result = await db.execute(select(func.count(ArticleTable.id)))
        total_articles = total_articles_result.scalar()
        
        published_articles_result = await db.execute(
            select(func.count(ArticleTable.id)).where(ArticleTable.status == "published")
        )
        published_articles = published_articles_result.scalar()
        
        draft_articles_result = await db.execute(
            select(func.count(ArticleTable.id)).where(ArticleTable.status == "draft")
        )
        draft_articles = draft_articles_result.scalar()
        
        # Mock data for now (can be implemented later)
        return {
            "overview": {
                "total_articles": total_articles or 0,
                "published_articles": published_articles or 0,
                "draft_articles": draft_articles or 0,
                "total_views": 15420,  # Mock
                "unique_visitors": 8950,  # Mock
                "page_views": 23140,  # Mock
                "bounce_rate": 68.5,  # Mock
                "avg_session": "2:34"  # Mock
            },
            "recent_activity": [
                {
                    "type": "article_published",
                    "title": "New quantum computing breakthrough",
                    "timestamp": datetime.utcnow().isoformat(),
                    "author": "Science Team"
                },
                {
                    "type": "high_traffic",
                    "title": "AI research article trending",
                    "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                    "views": 1250
                }
            ],
            "top_articles": [
                {
                    "id": "1",
                    "title": "Revolutionary AI Discovery",
                    "views": 4250,
                    "published_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "2", 
                    "title": "Mars Rover Breakthrough",
                    "views": 3180,
                    "published_at": datetime.utcnow().isoformat()
                }
            ],
            "traffic_sources": [
                {"source": "Direct", "percentage": 45.2, "visits": 6780},
                {"source": "Google", "percentage": 32.1, "visits": 4820},
                {"source": "Social Media", "percentage": 15.7, "visits": 2350},
                {"source": "Referrals", "percentage": 7.0, "visits": 1050}
            ],
            "weekly_views": [
                {"day": "Mon", "views": 1250},
                {"day": "Tue", "views": 1180},
                {"day": "Wed", "views": 1420},
                {"day": "Thu", "views": 1350},
                {"day": "Fri", "views": 1680},
                {"day": "Sat", "views": 1920},
                {"day": "Sun", "views": 1580}
            ]
        }
    except Exception as e:
        return {
            "overview": {
                "total_articles": 0,
                "published_articles": 0,
                "draft_articles": 0,
                "total_views": 0,
                "unique_visitors": 0,
                "page_views": 0,
                "bounce_rate": 0,
                "avg_session": "0:00"
            },
            "recent_activity": [],
            "top_articles": [],
            "traffic_sources": [],
            "weekly_views": []
        }

@router.get("/article/{article_id}")
async def get_article_analytics(
    article_id: str,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get analytics for specific article"""
    # Verify article exists
    result = await db.execute(select(ArticleTable).where(ArticleTable.id == article_id))
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Mock analytics data
    return {
        "article_id": article_id,
        "title": article.title,
        "views": article.views,
        "unique_views": article.views * 0.8,  # Mock
        "avg_time": "2:15",  # Mock
        "bounce_rate": 65.2,  # Mock
        "daily_views": [
            {"date": "2025-08-01", "views": 120},
            {"date": "2025-08-02", "views": 180},
            {"date": "2025-08-03", "views": 250},
            {"date": "2025-08-04", "views": 190},
            {"date": "2025-08-05", "views": 340},
            {"date": "2025-08-06", "views": 280}
        ],
        "referrers": [
            {"source": "google.com", "visits": 145},
            {"source": "twitter.com", "visits": 89},
            {"source": "facebook.com", "visits": 56},
            {"source": "direct", "visits": 234}
        ]
    }

@router.post("/track-view/{article_id}")
async def track_article_view(
    article_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Track a page view for an article"""
    try:
        # Increment article view count
        result = await db.execute(select(ArticleTable).where(ArticleTable.id == article_id))
        article = result.scalar_one_or_none()
        
        if article:
            article.views += 1
            await db.commit()
        
        return {"success": True, "article_id": article_id}
    except Exception as e:
        return {"success": False, "error": str(e)}