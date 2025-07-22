"""
Utility functions
"""
import re
from typing import Optional
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId

def create_slug(title: str) -> str:
    """Create URL-friendly slug from title"""
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def paginate_results(skip: int, limit: int, max_limit: int = 100):
    """Validate and normalize pagination parameters"""
    if skip < 0:
        skip = 0
    if limit <= 0 or limit > max_limit:
        limit = max_limit
    return skip, limit

def validate_object_id(oid: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(oid)
    except InvalidId:
        raise ValueError(f"Invalid ObjectId: {oid}")

def convert_objectid_to_str(obj):
    """Convert ObjectId fields to strings in a dictionary or list"""
    if isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    return obj

def format_article_response(article: dict, author: dict = None, category: dict = None) -> dict:
    """Format article for API response"""
    formatted = {
        "id": str(article["_id"]),
        "title": article["title"],
        "subtitle": article.get("subtitle", ""),
        "content": article["content"],
        "slug": article["slug"],
        "tags": article.get("tags", []),
        "featured_image": article.get("featured_image", ""),
        "status": article["status"],
        "views": article.get("views", 0),
        "seo_title": article.get("seo_title", ""),
        "seo_description": article.get("seo_description", ""),
        "created_at": article["created_at"],
        "updated_at": article["updated_at"],
        "published_at": article.get("published_at")
    }
    
    if author:
        formatted["author"] = {
            "id": str(author["_id"]),
            "username": author["username"],
            "profile": author.get("profile", {})
        }
    
    if category:
        formatted["category"] = {
            "id": str(category["_id"]),
            "name": category["name"],
            "slug": category["slug"]
        }
    
    return formatted

async def ensure_unique_slug(collection, base_slug: str, exclude_id: str = None) -> str:
    """Ensure slug is unique by adding counter if needed"""
    slug = base_slug
    counter = 1
    
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["_id"] = {"$ne": validate_object_id(exclude_id)}
        
        existing = await collection.find_one(query)
        if not existing:
            return slug
        
        slug = f"{base_slug}-{counter}"
        counter += 1

def get_date_range(start_date: Optional[str], end_date: Optional[str]) -> tuple:
    """Parse and validate date range parameters"""
    try:
        if start_date:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start = datetime.utcnow() - timedelta(days=30)
        
        if end_date:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end = datetime.utcnow()
        
        return start, end
    except ValueError as e:
        raise ValueError(f"Invalid date format: {e}")
