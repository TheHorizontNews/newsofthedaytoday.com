"""
SEO and Search Engine Optimization routes
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import Response, PlainTextResponse
from datetime import datetime, timedelta
from typing import List, Optional
import xml.etree.ElementTree as ET
from motor.motor_asyncio import AsyncIOMotorClient
import os

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
async def submit_url_for_indexing(url_data: dict, background_tasks: BackgroundTasks):
    """Submit URL to search engines for indexing"""
    url = url_data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    # Add background task to submit to search engines
    background_tasks.add_task(submit_to_search_engines, url)
    
    return {"message": "URL submitted for indexing", "url": url}

async def submit_to_search_engines(url: str):
    """Background task to submit URL to search engines"""
    # This would integrate with Google Search Console API, Bing Webmaster Tools, etc.
    # For now, we'll just log it
    print(f"Submitting URL for indexing: {url}")
    
    # In a real implementation, you would:
    # 1. Use Google Search Console API to submit URL
    # 2. Use Bing Webmaster Tools API
    # 3. Submit to other search engines
    # 4. Log the submission for tracking

@router.get("/analytics/search-console")
async def get_search_console_data(start_date: str, end_date: str):
    """Get Google Search Console analytics data"""
    # This would integrate with Search Console API
    # For now, return mock data
    
    return {
        "clicks": 1250,
        "impressions": 45600,
        "ctr": 2.74,
        "position": 12.5,
        "queries": [
            {"query": "edge chronicle news", "clicks": 150, "impressions": 2000, "ctr": 7.5, "position": 3.2},
            {"query": "breaking news today", "clicks": 120, "impressions": 5000, "ctr": 2.4, "position": 8.1},
            {"query": "ukraine war updates", "clicks": 200, "impressions": 8000, "ctr": 2.5, "position": 6.3}
        ],
        "pages": [
            {"page": "/article/ukraine-latest", "clicks": 300, "impressions": 3500, "ctr": 8.6, "position": 4.2},
            {"page": "/article/breaking-news", "clicks": 250, "impressions": 4200, "ctr": 5.9, "position": 7.1}
        ]
    }