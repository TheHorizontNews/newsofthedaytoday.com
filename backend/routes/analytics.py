"""
Analytics routes
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from auth import get_current_active_user, require_admin
from database import get_analytics_collection, get_articles_collection
from models import User, Analytics
from utils import get_date_range, validate_object_id

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics"""
    analytics_collection = get_analytics_collection()
    articles_collection = get_articles_collection()
    
    # Date ranges
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Build query based on user role
    article_query = {}
    if current_user.role != "admin":
        article_query["author_id"] = current_user.id
    
    # Get article counts
    total_articles = await articles_collection.count_documents(article_query)
    published_articles = await articles_collection.count_documents({
        **article_query,
        "status": "published"
    })
    draft_articles = await articles_collection.count_documents({
        **article_query,
        "status": "draft"
    })
    
    # Get analytics for user's articles
    user_articles = await articles_collection.find(
        article_query,
        {"_id": 1}
    ).to_list(length=None)
    
    article_ids = [article["_id"] for article in user_articles]
    
    # Total views
    total_views_result = await analytics_collection.aggregate([
        {"$match": {"article_id": {"$in": article_ids}}},
        {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
    ]).to_list(length=1)
    
    total_views = total_views_result[0]["total_views"] if total_views_result else 0
    
    # Views this week
    week_views_result = await analytics_collection.aggregate([
        {"$match": {
            "article_id": {"$in": article_ids},
            "date": {"$gte": week_ago}
        }},
        {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
    ]).to_list(length=1)
    
    week_views = week_views_result[0]["total_views"] if week_views_result else 0
    
    # Views this month
    month_views_result = await analytics_collection.aggregate([
        {"$match": {
            "article_id": {"$in": article_ids},
            "date": {"$gte": month_ago}
        }},
        {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
    ]).to_list(length=1)
    
    month_views = month_views_result[0]["total_views"] if month_views_result else 0
    
    # Top articles by views
    top_articles = await analytics_collection.aggregate([
        {"$match": {"article_id": {"$in": article_ids}}},
        {"$group": {
            "_id": "$article_id",
            "total_views": {"$sum": "$views"}
        }},
        {"$sort": {"total_views": -1}},
        {"$limit": 5}
    ]).to_list(length=5)
    
    # Get article details for top articles
    top_articles_details = []
    for article in top_articles:
        article_detail = await articles_collection.find_one({"_id": article["_id"]})
        if article_detail:
            top_articles_details.append({
                "id": str(article_detail["_id"]),
                "title": article_detail["title"],
                "views": article["total_views"],
                "published_at": article_detail.get("published_at")
            })
    
    # Daily views for the last 30 days
    daily_views = await analytics_collection.aggregate([
        {"$match": {
            "article_id": {"$in": article_ids},
            "date": {"$gte": month_ago}
        }},
        {"$group": {
            "_id": {
                "year": {"$year": "$date"},
                "month": {"$month": "$date"},
                "day": {"$dayOfMonth": "$date"}
            },
            "views": {"$sum": "$views"}
        }},
        {"$sort": {"_id": 1}}
    ]).to_list(length=30)
    
    # Format daily views
    daily_views_formatted = []
    for day in daily_views:
        date_str = f"{day['_id']['year']}-{day['_id']['month']:02d}-{day['_id']['day']:02d}"
        daily_views_formatted.append({
            "date": date_str,
            "views": day["views"]
        })
    
    return {
        "total_articles": total_articles,
        "published_articles": published_articles,
        "draft_articles": draft_articles,
        "total_views": total_views,
        "week_views": week_views,
        "month_views": month_views,
        "top_articles": top_articles_details,
        "daily_views": daily_views_formatted
    }

@router.get("/articles/{article_id}")
async def get_article_analytics(
    article_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """Get analytics for specific article"""
    analytics_collection = get_analytics_collection()
    articles_collection = get_articles_collection()
    
    # Validate article exists and user has access
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check permissions
    if current_user.role != "admin" and article["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Parse date range
    start, end = get_date_range(start_date, end_date)
    
    # Build query
    query = {"article_id": validate_object_id(article_id)}
    if start or end:
        query["date"] = {}
        if start:
            query["date"]["$gte"] = start
        if end:
            query["date"]["$lte"] = end
    
    # Get analytics data
    analytics_cursor = analytics_collection.find(query).sort("date", -1)
    analytics_data = await analytics_cursor.to_list(length=None)
    
    # Calculate totals
    total_views = sum(item["views"] for item in analytics_data)
    total_unique_views = sum(item.get("unique_views", 0) for item in analytics_data)
    
    # Group by date
    daily_stats = {}
    for item in analytics_data:
        date_key = item["date"].strftime("%Y-%m-%d")
        if date_key not in daily_stats:
            daily_stats[date_key] = {
                "date": date_key,
                "views": 0,
                "unique_views": 0
            }
        daily_stats[date_key]["views"] += item["views"]
        daily_stats[date_key]["unique_views"] += item.get("unique_views", 0)
    
    return {
        "article_id": article_id,
        "article_title": article["title"],
        "total_views": total_views,
        "total_unique_views": total_unique_views,
        "daily_stats": list(daily_stats.values())
    }

@router.post("/track-view")
async def track_view(
    article_id: str,
    referrer: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Track article view (public endpoint)"""
    analytics_collection = get_analytics_collection()
    articles_collection = get_articles_collection()
    
    # Validate article exists
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Create analytics entry
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Check if entry exists for today
    existing_entry = await analytics_collection.find_one({
        "article_id": validate_object_id(article_id),
        "date": today
    })
    
    if existing_entry:
        # Update existing entry
        await analytics_collection.update_one(
            {"_id": existing_entry["_id"]},
            {"$inc": {"views": 1}}
        )
    else:
        # Create new entry
        await analytics_collection.insert_one({
            "article_id": validate_object_id(article_id),
            "date": today,
            "views": 1,
            "unique_views": 1,
            "referrer": referrer,
            "user_agent": user_agent
        })
    
    # Update article view count
    await articles_collection.update_one(
        {"_id": validate_object_id(article_id)},
        {"$inc": {"views": 1}}
    )
    
    return {"message": "View tracked successfully"}