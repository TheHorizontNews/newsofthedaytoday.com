"""
SEO management routes for SQLite
"""
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from auth import get_current_active_user, require_admin
from database import get_db
from models import UserTable

router = APIRouter(prefix="/api/seo", tags=["seo"])

# In-memory SEO settings (можно потом перенести в БД)
seo_settings = {
    "site_title": "Science Digest News",
    "site_description": "Останні наукові відкриття та дослідження з усього світу. Технології, медицина, космос, ШІ та інновації.",
    "site_keywords": "наука, технології, медицина, дослідження, ШІ, космос, інновації",
    "og_image": "https://sciencedigestnews.com/og-image.jpg",
    "twitter_handle": "@ScienceDigest",
    "language": "uk",
    "robots": "index, follow",
    "canonical_url": "https://sciencedigestnews.com"
}

class SEOSettings(BaseModel):
    site_title: str
    site_description: str  
    site_keywords: str
    og_image: str
    twitter_handle: str
    language: str
    robots: str
    canonical_url: str

class SEOUpdate(BaseModel):
    site_title: str = None
    site_description: str = None
    site_keywords: str = None
    og_image: str = None
    twitter_handle: str = None
    language: str = None
    robots: str = None
    canonical_url: str = None

@router.get("/settings", response_model=SEOSettings)
async def get_seo_settings(
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current SEO settings"""
    return SEOSettings(**seo_settings)

@router.put("/settings", response_model=SEOSettings)
async def update_seo_settings(
    updates: SEOUpdate,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Update SEO settings"""
    global seo_settings
    
    # Update only provided fields
    update_dict = updates.dict(exclude_unset=True)
    seo_settings.update(update_dict)
    
    return SEOSettings(**seo_settings)

@router.get("/meta-tags")
async def get_meta_tags(
    page: str = "home",
    db: AsyncSession = Depends(get_db)
):
    """Get meta tags for specific page"""
    base_tags = {
        "title": seo_settings["site_title"],
        "description": seo_settings["site_description"],
        "keywords": seo_settings["site_keywords"],
        "og:title": seo_settings["site_title"],
        "og:description": seo_settings["site_description"],
        "og:image": seo_settings["og_image"],
        "og:url": seo_settings["canonical_url"],
        "og:type": "website",
        "og:site_name": "Science Digest News",
        "twitter:card": "summary_large_image",
        "twitter:site": seo_settings["twitter_handle"],
        "twitter:title": seo_settings["site_title"],
        "twitter:description": seo_settings["site_description"],
        "twitter:image": seo_settings["og_image"],
        "robots": seo_settings["robots"],
        "canonical": seo_settings["canonical_url"],
        "language": seo_settings["language"]
    }
    
    return {"meta_tags": base_tags, "page": page}

@router.get("/sitemap")
async def generate_sitemap(
    db: AsyncSession = Depends(get_db)
):
    """Generate sitemap.xml"""
    # В реальном проекте здесь будут все статьи из БД
    sitemap_urls = [
        {
            "url": seo_settings["canonical_url"],
            "lastmod": "2025-08-06",
            "changefreq": "daily",
            "priority": 1.0
        },
        {
            "url": f"{seo_settings['canonical_url']}/about",
            "lastmod": "2025-08-06", 
            "changefreq": "monthly",
            "priority": 0.8
        }
    ]
    
    return {"urls": sitemap_urls, "total": len(sitemap_urls)}

@router.get("/robots")
async def get_robots_txt():
    """Generate robots.txt"""
    robots_content = f"""User-agent: *
Allow: /

Sitemap: {seo_settings['canonical_url']}/sitemap.xml

# Science Digest News - robots.txt
"""
    
    return {"content": robots_content}