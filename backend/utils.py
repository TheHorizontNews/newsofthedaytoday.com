"""
Utility functions for SQLite
"""
import re
from typing import Optional
from datetime import datetime
import json

def create_slug(title: str) -> str:
    """Create a URL-friendly slug from title with Ukrainian to English transliteration"""
    # Ukrainian to English transliteration mapping
    transliteration_map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
        'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'yi',
        'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E',
        'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Yi',
        'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
        'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
        'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
    }
    
    # Transliterate Ukrainian characters to English
    transliterated = ''
    for char in title:
        transliterated += transliteration_map.get(char, char)
    
    # Convert to lowercase and create slug
    slug = transliterated.lower()
    # Remove special characters except letters, numbers, spaces and hyphens
    slug = re.sub(r'[^\w\s-]', '', slug)
    # Replace multiple spaces/hyphens with single hyphen
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