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
    "site_title": "Science Digest News - Наукові відкриття та дослідження",
    "site_description": "Останні наукові відкриття та дослідження з усього світу. Технології, медицина, космос, ШІ та інновації.",
    "site_keywords": "наука, технології, медицина, дослідження, ШІ, космос, інновації, Science Digest News",
    "og_image": "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop&crop=entropy&fm=webp&q=85",
    "twitter_handle": "@sciencedigestnews",
    "language": "uk-UA",
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
    """Get meta tags for specific page - PUBLIC ENDPOINT"""
    base_tags = {
        "title": seo_settings["site_title"],
        "description": seo_settings["site_description"],
        "keywords": seo_settings["site_keywords"],
        "og:title": seo_settings["site_title"],
        "og:description": seo_settings["site_description"],
        "og:image": seo_settings["og_image"],
        "og:url": seo_settings["canonical_url"],
        "og:type": "website",
        "og:site_name": seo_settings["site_title"],
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

# Новый endpoint для обновления метатегов страницы
@router.get("/page-meta")
async def get_page_meta(
    url: str = "/",
    db: AsyncSession = Depends(get_db)  
):
    """Get complete HTML meta tags for page injection - PUBLIC ENDPOINT"""
    
    # Получаем базовые настройки
    title = seo_settings["site_title"]
    description = seo_settings["site_description"] 
    keywords = seo_settings["site_keywords"]
    og_image = seo_settings["og_image"]
    canonical_url = seo_settings["canonical_url"]
    
    # Формируем HTML метатеги
    meta_html = f"""
    <!-- Dynamic SEO Meta Tags -->
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <meta name="keywords" content="{keywords}" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{og_image}" />
    <meta property="og:url" content="{canonical_url}{url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="{title}" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{og_image}" />
    """
    
    return {
        "meta_html": meta_html.strip(),
        "title": title,
        "description": description,
        "keywords": keywords,
        "og_image": og_image,
        "canonical_url": f"{canonical_url}{url}"
    }

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