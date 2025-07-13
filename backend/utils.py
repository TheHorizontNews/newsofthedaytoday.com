"""
Utility functions
"""
import re
from typing import Optional
from datetime import datetime
from bson import ObjectId

def create_slug(title: str) -> str:
    """Create a URL-friendly slug from title"""
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def paginate_results(skip: int, limit: int, max_limit: int = 100) -> tuple:
    """Validate and return pagination parameters"""
    if skip < 0:
        skip = 0
    if limit <= 0 or limit > max_limit:
        limit = max_limit
    return skip, limit

def format_article_response(article_dict: dict, author: dict, category: dict) -> dict:
    """Format article response with author and category info"""
    return {
        "id": str(article_dict["_id"]),
        "title": article_dict["title"],
        "subtitle": article_dict.get("subtitle"),
        "content": article_dict["content"],
        "author": {
            "id": str(author["_id"]),
            "username": author["username"],
            "email": author["email"],
            "role": author["role"],
            "profile": author["profile"],
            "created_at": author["created_at"],
            "last_login": author.get("last_login"),
            "is_active": author["is_active"]
        },
        "category": {
            "id": str(category["_id"]),
            "name": category["name"],
            "slug": category["slug"],
            "description": category.get("description"),
            "created_at": category["created_at"]
        },
        "tags": article_dict.get("tags", []),
        "featured_image": article_dict.get("featured_image"),
        "status": article_dict["status"],
        "published_at": article_dict.get("published_at"),
        "created_at": article_dict["created_at"],
        "updated_at": article_dict["updated_at"],
        "views": article_dict.get("views", 0),
        "slug": article_dict["slug"],
        "seo_title": article_dict.get("seo_title"),
        "seo_description": article_dict.get("seo_description")
    }

def convert_objectid_to_str(obj):
    """Convert ObjectId fields to strings in nested dictionaries"""
    if isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

async def ensure_unique_slug(collection, slug: str, exclude_id: Optional[str] = None) -> str:
    """Ensure slug is unique by appending number if needed"""
    original_slug = slug
    counter = 1
    
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["_id"] = {"$ne": ObjectId(exclude_id)}
        
        existing = await collection.find_one(query)
        if not existing:
            return slug
        
        slug = f"{original_slug}-{counter}"
        counter += 1

def validate_object_id(id_string: str) -> ObjectId:
    """Validate and convert string to ObjectId"""
    try:
        return ObjectId(id_string)
    except Exception:
        raise ValueError(f"Invalid ObjectId: {id_string}")

def get_date_range(start_date: Optional[str], end_date: Optional[str]) -> tuple:
    """Parse and validate date range"""
    start = None
    end = None
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError(f"Invalid start date format: {start_date}")
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise ValueError(f"Invalid end date format: {end_date}")
    
    return start, end