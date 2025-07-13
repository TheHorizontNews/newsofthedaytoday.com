"""
SEO and Search Engine Optimization routes
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import Response, PlainTextResponse
from datetime import datetime, timedelta
from typing import List, Optional
import xml.etree.ElementTree as ET
from motor.motor_asyncio import AsyncIOMotorClient
import os

from auth import get_current_active_user, require_admin
from models import User
from utils.google_search_console import search_console

router = APIRouter(prefix="/api/seo", tags=["seo"])

# Get database connection
def get_db():
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    return client.edge_chronicle

@router.get("/sitemap.xml", response_class=Response)
async def generate_sitemap():
    """Generate XML sitemap for the website"""
    try:
        db = get_db()
        
        # Get all published articles
        articles = await db.articles.find({"status": "published"}).to_list(length=1000)
        
        # Create sitemap XML
        urlset = ET.Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
        urlset.set("xmlns:news", "http://www.google.com/schemas/sitemap-news/0.9")
        
        base_url = os.getenv("SITE_URL", "https://edgechronicle.com")
        
        # Add homepage
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = base_url
        ET.SubElement(url, "lastmod").text = datetime.utcnow().isoformat()
        ET.SubElement(url, "changefreq").text = "daily"
        ET.SubElement(url, "priority").text = "1.0"
        
        # Add category pages
        categories = await db.categories.find().to_list(length=100)
        for category in categories:
            url = ET.SubElement(urlset, "url")
            ET.SubElement(url, "loc").text = f"{base_url}/category/{category['slug']}"
            ET.SubElement(url, "lastmod").text = datetime.utcnow().isoformat()
            ET.SubElement(url, "changefreq").text = "daily"
            ET.SubElement(url, "priority").text = "0.8"
        
        # Add articles
        for article in articles:
            url = ET.SubElement(urlset, "url")
            ET.SubElement(url, "loc").text = f"{base_url}/article/{article['_id']}"
            
            # Use updated_at or created_at for lastmod
            lastmod = article.get("updated_at", article.get("created_at", datetime.utcnow()))
            if isinstance(lastmod, str):
                lastmod = datetime.fromisoformat(lastmod.replace('Z', '+00:00'))
            ET.SubElement(url, "lastmod").text = lastmod.isoformat()
            
            ET.SubElement(url, "changefreq").text = "weekly"
            ET.SubElement(url, "priority").text = "0.9"
            
            # Add news-specific data for recent articles (last 2 days)
            if lastmod > datetime.utcnow() - timedelta(days=2):
                news = ET.SubElement(url, "news:news")
                publication = ET.SubElement(news, "news:publication")
                ET.SubElement(publication, "news:name").text = "Edge Chronicle"
                ET.SubElement(publication, "news:language").text = "en"
                
                published_date = article.get("published_at", article.get("created_at"))
                if isinstance(published_date, str):
                    published_date = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
                ET.SubElement(news, "news:publication_date").text = published_date.strftime("%Y-%m-%d")
                ET.SubElement(news, "news:title").text = article.get("title", "")
        
        # Convert to XML string
        xml_str = ET.tostring(urlset, encoding='unicode')
        xml_content = f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}'
        
        return Response(
            content=xml_content,
            media_type="application/xml",
            headers={"Cache-Control": "public, max-age=3600"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sitemap: {str(e)}")

@router.get("/llms.txt", response_class=PlainTextResponse)
async def generate_llms_txt():
    """Generate LLMS.txt file for AI training data"""
    try:
        db = get_db()
        
        # Get recent published articles
        articles = await db.articles.find(
            {"status": "published"}
        ).sort("published_at", -1).limit(50).to_list(length=50)
        
        # Get categories
        categories = await db.categories.find().to_list(length=100)
        
        base_url = os.getenv("SITE_URL", "https://edgechronicle.com")
        
        llms_content = f"""# LLMS.txt - AI Training Data for Edge Chronicle

## About Edge Chronicle
Edge Chronicle is a digital news platform providing breaking news and analysis from around the world.
We cover politics, economics, sports, culture, and technology with a focus on factual reporting.

## Content Guidelines
- All content is original journalism or properly attributed
- Content is fact-checked and follows journalistic standards
- Published content is intended for public consumption
- Respect copyright and attribution requirements

## Site Structure
Base URL: {base_url}
Articles: /article/{{id}}
Categories: /category/{{slug}}
Authors: /author/{{slug}}

## Content Categories
"""
        
        for category in categories:
            llms_content += f"- {category.get('name', 'Unknown')}\n"
        
        llms_content += "\n## Recent Articles\n"
        
        for article in articles:
            # Get author info
            author = await db.users.find_one({"_id": article.get("author_id")})
            author_name = "Edge Chronicle Team"
            if author and author.get("profile", {}).get("name"):
                author_name = author["profile"]["name"]
            
            # Get category info
            category = await db.categories.find_one({"_id": article.get("category_id")})
            category_name = "General"
            if category:
                category_name = category.get("name", "General")
            
            published_date = article.get("published_at", article.get("created_at", datetime.utcnow()))
            if isinstance(published_date, str):
                published_date = datetime.fromisoformat(published_date.replace('Z', '+00:00'))
            
            llms_content += f"""### {article.get('title', 'Untitled')}
URL: {base_url}/article/{article['_id']}
Published: {published_date.isoformat()}
Category: {category_name}
Author: {author_name}
"""
            
            if article.get("tags"):
                llms_content += f"Tags: {', '.join(article['tags'])}\n"
            
            llms_content += "\n"
        
        llms_content += f"""
## Contact
For questions about content usage or licensing:
Email: ai-training@edgechronicle.com
Website: {base_url}/ai-policy

## Last Updated
{datetime.utcnow().isoformat()}
"""
        
        return PlainTextResponse(
            content=llms_content,
            headers={"Cache-Control": "public, max-age=3600"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating LLMS.txt: {str(e)}")

@router.get("/llms-sitemap.xml", response_class=Response)
async def generate_llms_sitemap():
    """Generate LLMS-sitemap.xml for AI crawlers"""
    try:
        db = get_db()
        
        # Get all published articles
        articles = await db.articles.find({"status": "published"}).to_list(length=1000)
        
        # Create sitemap XML with AI-specific metadata
        urlset = ET.Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
        urlset.set("xmlns:ai", "https://schemas.edgechronicle.com/ai-training")
        
        base_url = os.getenv("SITE_URL", "https://edgechronicle.com")
        
        # Add homepage
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = base_url
        ET.SubElement(url, "lastmod").text = datetime.utcnow().isoformat()
        ET.SubElement(url, "changefreq").text = "daily"
        ET.SubElement(url, "priority").text = "1.0"
        ET.SubElement(url, "ai:training-data").text = "true"
        ET.SubElement(url, "ai:content-type").text = "homepage"
        ET.SubElement(url, "ai:language").text = "en"
        
        # Add articles with AI metadata
        for article in articles:
            url = ET.SubElement(urlset, "url")
            ET.SubElement(url, "loc").text = f"{base_url}/article/{article['_id']}"
            
            lastmod = article.get("updated_at", article.get("created_at", datetime.utcnow()))
            if isinstance(lastmod, str):
                lastmod = datetime.fromisoformat(lastmod.replace('Z', '+00:00'))
            ET.SubElement(url, "lastmod").text = lastmod.isoformat()
            
            ET.SubElement(url, "changefreq").text = "weekly"
            ET.SubElement(url, "priority").text = "0.9"
            ET.SubElement(url, "ai:training-data").text = "true"
            ET.SubElement(url, "ai:content-type").text = "news-article"
            ET.SubElement(url, "ai:language").text = "en"
            
            # Get category info
            category = await db.categories.find_one({"_id": article.get("category_id")})
            if category:
                ET.SubElement(url, "ai:category").text = category.get("name", "General")
            
            # Add tags as keywords
            if article.get("tags"):
                ET.SubElement(url, "ai:keywords").text = ", ".join(article["tags"])
        
        # Convert to XML string
        xml_str = ET.tostring(urlset, encoding='unicode')
        xml_content = f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}'
        
        return Response(
            content=xml_content,
            media_type="application/xml",
            headers={"Cache-Control": "public, max-age=3600"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating LLMS sitemap: {str(e)}")

@router.get("/robots.txt", response_class=PlainTextResponse)
async def generate_robots_txt():
    """Generate robots.txt file"""
    base_url = os.getenv("SITE_URL", "https://edgechronicle.com")
    
    robots_content = f"""User-agent: *
Allow: /

# Sitemaps
Sitemap: {base_url}/seo/sitemap.xml
Sitemap: {base_url}/seo/llms-sitemap.xml

# AI Training Data
# LLMS.txt file for AI training guidelines
# {base_url}/seo/llms.txt

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Block admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Block search parameters
Disallow: /*?search=
Disallow: /*?q=
"""
    
    return PlainTextResponse(
        content=robots_content,
        headers={"Cache-Control": "public, max-age=86400"}
    )

@router.post("/submit-url")
async def submit_url_for_indexing(url_data: dict, background_tasks: BackgroundTasks, current_user: User = Depends(require_admin())):
    """Submit URL to search engines for indexing"""
    url = url_data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    # Add background task to submit to search engines
    background_tasks.add_task(submit_to_search_engines, url)
    
    return {"message": "URL submitted for indexing", "url": url}

async def submit_to_search_engines(url: str):
    """Background task to submit URL to search engines"""
    # Submit to Google Search Console
    result = await search_console.submit_url(url)
    print(f"Search Console submission result for {url}: {result}")

@router.get("/search-console/analytics")
async def get_search_console_data(
    start_date: str, 
    end_date: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get Google Search Console analytics data"""
    try:
        result = await search_console.get_search_analytics(start_date, end_date)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Search Console data: {str(e)}")

@router.get("/search-console/sitemaps")
async def get_search_console_sitemaps(current_user: User = Depends(get_current_active_user)):
    """Get submitted sitemaps from Google Search Console"""
    try:
        result = await search_console.get_sitemaps()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sitemaps: {str(e)}")

@router.post("/search-console/submit-sitemap")
async def submit_sitemap_to_search_console(
    sitemap_data: dict,
    current_user: User = Depends(require_admin())
):
    """Submit sitemap to Google Search Console"""
    sitemap_url = sitemap_data.get("sitemap_url")
    if not sitemap_url:
        raise HTTPException(status_code=400, detail="sitemap_url is required")
    
    try:
        result = await search_console.submit_sitemap(sitemap_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting sitemap: {str(e)}")

@router.get("/analytics/dashboard")
async def get_analytics_dashboard(current_user: User = Depends(get_current_active_user)):
    """Get comprehensive analytics dashboard data"""
    try:
        # Get Search Console data for last 30 days
        end_date = datetime.utcnow().strftime("%Y-%m-%d")
        start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        search_console_data = await search_console.get_search_analytics(start_date, end_date)
        sitemaps_data = await search_console.get_sitemaps()
        
        # Get database analytics
        db = get_db()
        
        # Get article counts
        total_articles = await db.articles.count_documents({})
        published_articles = await db.articles.count_documents({"status": "published"})
        draft_articles = await db.articles.count_documents({"status": "draft"})
        
        # Get recent articles
        recent_articles = await db.articles.find(
            {"status": "published"}
        ).sort("published_at", -1).limit(10).to_list(10)
        
        # Get category breakdown
        category_pipeline = [
            {"$match": {"status": "published"}},
            {"$group": {"_id": "$category_id", "count": {"$sum": 1}}},
            {"$lookup": {
                "from": "categories",
                "localField": "_id",
                "foreignField": "_id",
                "as": "category"
            }},
            {"$unwind": "$category"},
            {"$project": {
                "category_name": "$category.name",
                "count": 1
            }}
        ]
        
        category_stats = await db.articles.aggregate(category_pipeline).to_list(100)
        
        return {
            "search_console": search_console_data,
            "sitemaps": sitemaps_data,
            "articles": {
                "total": total_articles,
                "published": published_articles,
                "draft": draft_articles,
                "recent": [
                    {
                        "id": str(article["_id"]),
                        "title": article["title"],
                        "published_at": article.get("published_at"),
                        "views": article.get("views", 0)
                    } for article in recent_articles
                ]
            },
            "categories": category_stats,
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

# Legacy endpoint for backward compatibility
@router.get("/analytics/search-console")
async def get_search_console_data_legacy(start_date: str, end_date: str, current_user: User = Depends(get_current_active_user)):
    """Legacy endpoint - use /search-console/analytics instead"""
    return await get_search_console_data(start_date, end_date, current_user)

# Tag Management Endpoints
@router.get("/tags")
async def get_all_tags(current_user: User = Depends(get_current_active_user)):
    """Get all unique tags from articles"""
    try:
        db = get_db()
        
        # Get all unique tags from published articles
        pipeline = [
            {"$match": {"status": "published", "tags": {"$exists": True, "$ne": []}}},
            {"$unwind": "$tags"},
            {"$group": {
                "_id": "$tags",
                "count": {"$sum": 1},
                "articles": {"$addToSet": {"id": "$_id", "title": "$title"}}
            }},
            {"$sort": {"count": -1}},
            {"$project": {
                "tag": "$_id",
                "count": 1,
                "articles": {"$slice": ["$articles", 5]}  # Show only first 5 articles
            }}
        ]
        
        tags = await db.articles.aggregate(pipeline).to_list(1000)
        
        return {
            "tags": tags,
            "total_tags": len(tags),
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tags: {str(e)}")

@router.get("/tags/popular")
async def get_popular_tags(limit: int = 20, current_user: User = Depends(get_current_active_user)):
    """Get most popular tags"""
    try:
        db = get_db()
        
        pipeline = [
            {"$match": {"status": "published", "tags": {"$exists": True, "$ne": []}}},
            {"$unwind": "$tags"},
            {"$group": {
                "_id": "$tags",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": limit},
            {"$project": {
                "tag": "$_id",
                "count": 1
            }}
        ]
        
        popular_tags = await db.articles.aggregate(pipeline).to_list(limit)
        
        return {
            "popular_tags": popular_tags,
            "limit": limit,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching popular tags: {str(e)}")

@router.post("/tags/cleanup")
async def cleanup_tags(current_user: User = Depends(require_admin())):
    """Clean up unused or duplicate tags"""
    try:
        db = get_db()
        
        # Get all articles with tags
        articles = await db.articles.find({"tags": {"$exists": True, "$ne": []}}).to_list(10000)
        
        updated_count = 0
        for article in articles:
            # Clean up tags: remove duplicates, empty strings, and normalize
            original_tags = article.get("tags", [])
            cleaned_tags = []
            seen_tags = set()
            
            for tag in original_tags:
                if isinstance(tag, str):
                    # Normalize tag
                    normalized_tag = tag.strip().lower()
                    if normalized_tag and normalized_tag not in seen_tags:
                        cleaned_tags.append(tag.strip())  # Keep original case
                        seen_tags.add(normalized_tag)
            
            # Update if tags were cleaned
            if cleaned_tags != original_tags:
                await db.articles.update_one(
                    {"_id": article["_id"]},
                    {"$set": {"tags": cleaned_tags}}
                )
                updated_count += 1
        
        return {
            "message": "Tag cleanup completed",
            "articles_updated": updated_count,
            "completed_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning up tags: {str(e)}")

@router.get("/meta-tags/{article_id}")
async def get_article_meta_tags(article_id: str, current_user: User = Depends(get_current_active_user)):
    """Get SEO meta tags for a specific article"""
    try:
        db = get_db()
        
        # Get article
        from utils import validate_object_id
        article = await db.articles.find_one({"_id": validate_object_id(article_id)})
        
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        # Get author and category
        author = await db.users.find_one({"_id": article["author_id"]})
        category = await db.categories.find_one({"_id": article["category_id"]})
        
        base_url = os.getenv("SITE_URL", "https://edgechronicle.com")
        
        meta_tags = {
            "title": article.get("seo_title") or article.get("title"),
            "description": article.get("seo_description") or article.get("subtitle"),
            "keywords": ", ".join(article.get("tags", [])),
            "author": author.get("profile", {}).get("name", "Edge Chronicle Team") if author else "Edge Chronicle Team",
            "canonical_url": f"{base_url}/article/{article_id}",
            "og_title": article.get("title"),
            "og_description": article.get("seo_description") or article.get("subtitle"),
            "og_image": article.get("featured_image"),
            "og_url": f"{base_url}/article/{article_id}",
            "og_type": "article",
            "twitter_card": "summary_large_image",
            "twitter_title": article.get("title"),
            "twitter_description": article.get("seo_description") or article.get("subtitle"),
            "twitter_image": article.get("featured_image"),
            "article_published_time": article.get("published_at"),
            "article_modified_time": article.get("updated_at"),
            "article_section": category.get("name") if category else None,
            "article_tags": article.get("tags", [])
        }
        
        return {
            "article_id": article_id,
            "meta_tags": meta_tags,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating meta tags: {str(e)}")