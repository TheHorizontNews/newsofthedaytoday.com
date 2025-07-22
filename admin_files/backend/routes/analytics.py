"""
Analytics API endpoints
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from auth import get_current_active_user, require_admin
from database import get_articles_collection, get_users_collection
import utils

router = APIRouter()

@router.get("/dashboard")
async def get_analytics_dashboard(
    range: str = Query("7d", description="Time range: 1d, 7d, 30d, 90d"),
    current_user: dict = Depends(get_current_active_user)
):
    """Get analytics dashboard data"""
    try:
        articles_collection = get_articles_collection()
        
        # Calculate date range
        end_date = datetime.now()
        if range == "1d":
            start_date = end_date - timedelta(days=1)
        elif range == "7d":
            start_date = end_date - timedelta(days=7)
        elif range == "30d":
            start_date = end_date - timedelta(days=30)
        elif range == "90d":
            start_date = end_date - timedelta(days=90)
        else:
            start_date = end_date - timedelta(days=7)

        # Get articles in date range
        articles_cursor = articles_collection.find({
            "created_at": {"$gte": start_date, "$lte": end_date}
        })
        articles = list(articles_cursor)

        # Calculate basic stats
        total_views = sum(article.get("views", 0) for article in articles)
        unique_visitors = int(total_views * 0.7)  # Mock calculation
        page_views = int(total_views * 1.2)  # Mock calculation
        bounce_rate = 42.5  # Mock data

        # Get popular articles
        popular_articles = sorted(
            articles, 
            key=lambda x: x.get("views", 0), 
            reverse=True
        )[:5]

        # Mock traffic sources
        traffic_sources = [
            {"source": "Direct", "visits": int(total_views * 0.45), "percentage": 45.0},
            {"source": "Google", "visits": int(total_views * 0.31), "percentage": 31.0},
            {"source": "Social Media", "visits": int(total_views * 0.15), "percentage": 15.0},
            {"source": "Other", "visits": int(total_views * 0.09), "percentage": 9.0},
        ]

        # Generate daily stats
        daily_stats = []
        current_date = start_date
        while current_date <= end_date:
            daily_articles = [
                a for a in articles 
                if a.get("created_at", datetime.now()).date() == current_date.date()
            ]
            daily_views = sum(article.get("views", 0) for article in daily_articles)
            
            daily_stats.append({
                "date": current_date.isoformat(),
                "views": daily_views if daily_views > 0 else 120 + (len(daily_stats) * 50),  # Mock data
                "visitors": int((daily_views if daily_views > 0 else 120) * 0.7)
            })
            current_date += timedelta(days=1)

        return {
            "overview": {
                "total_views": total_views if total_views > 0 else 12547,
                "unique_visitors": unique_visitors if unique_visitors > 0 else 8932,
                "page_views": page_views if page_views > 0 else 15430,
                "bounce_rate": bounce_rate
            },
            "popular_articles": [
                {
                    "title": article.get("title", "Untitled"),
                    "views": article.get("views", 0),
                    "url": f"/article/{article.get('slug', str(article['_id']))}"
                }
                for article in popular_articles
            ],
            "traffic_sources": traffic_sources,
            "daily_stats": daily_stats
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.get("/articles/{article_id}")
async def get_article_analytics(
    article_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get analytics for a specific article"""
    try:
        if not utils.validate_object_id(article_id):
            raise HTTPException(status_code=400, detail="Invalid article ID")

        articles_collection = get_articles_collection()
        article = articles_collection.find_one({"_id": ObjectId(article_id)})
        
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        # Mock analytics data for the article
        return {
            "article_id": article_id,
            "title": article.get("title"),
            "total_views": article.get("views", 0),
            "unique_views": int(article.get("views", 0) * 0.8),
            "average_time": "2:35",  # Mock data
            "bounce_rate": 35.2,  # Mock data
            "traffic_sources": [
                {"source": "Google", "percentage": 45},
                {"source": "Direct", "percentage": 30},
                {"source": "Social", "percentage": 25}
            ],
            "daily_views": [
                {"date": "2024-01-01", "views": 45},
                {"date": "2024-01-02", "views": 67},
                {"date": "2024-01-03", "views": 23},
                {"date": "2024-01-04", "views": 89},
                {"date": "2024-01-05", "views": 56}
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get article analytics: {str(e)}")

@router.post("/track/page-view")
async def track_page_view(
    page_data: dict
):
    """Track a page view (public endpoint)"""
    try:
        # In a real application, you would store this in a dedicated analytics collection
        # For now, we'll just return success
        
        page_url = page_data.get("url", "")
        article_id = page_data.get("article_id")
        
        # If it's an article page view, increment the article's view count
        if article_id and utils.validate_object_id(article_id):
            articles_collection = get_articles_collection()
            articles_collection.update_one(
                {"_id": ObjectId(article_id)},
                {"$inc": {"views": 1}}
            )

        return {"success": True, "message": "Page view tracked"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to track page view: {str(e)}")

@router.get("/export")
async def export_analytics(
    format: str = Query("csv", description="Export format: csv, json"),
    range: str = Query("30d", description="Time range: 7d, 30d, 90d"),
    current_user: dict = Depends(require_admin)
):
    """Export analytics data (admin only)"""
    try:
        # Get dashboard data
        dashboard_data = await get_analytics_dashboard(range, current_user)
        
        if format == "json":
            return dashboard_data
        elif format == "csv":
            # In a real application, you would convert to CSV format
            # For now, return a simple representation
            return {
                "format": "csv",
                "data": "CSV export functionality would be implemented here",
                "download_url": "/api/analytics/download/analytics.csv"
            }
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export analytics: {str(e)}")