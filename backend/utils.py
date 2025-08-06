"""
Utility functions for SQLite
"""
import re
from typing import Optional
from datetime import datetime
import json

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