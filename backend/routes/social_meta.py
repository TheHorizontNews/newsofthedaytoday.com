"""
Social media meta tags routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import ArticleTable, UserTable, CategoryTable
import re

router = APIRouter(prefix="/api/meta", tags=["social-meta"])

@router.get("/article/{slug}")
async def get_article_meta(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Generate HTML with social media meta tags for article pages
    Used by social media bots and crawlers
    """
    
    # Check if this is a bot request
    user_agent = request.headers.get('user-agent', '').lower()
    is_bot = any(bot in user_agent for bot in [
        'facebookexternalhit', 'twitterbot', 'telegrambot', 'whatsapp',
        'slackbot', 'linkedinbot', 'viberbot', 'skypebot', 'discordbot',
        'googlebot', 'bingbot', 'yandexbot'
    ])
    
    # Query article with related data
    stmt = select(ArticleTable).where(
        ArticleTable.slug == slug,
        ArticleTable.status == "PUBLISHED"
    )
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get category and author separately if needed
    category = None
    author = None
    
    if article.category_id:
        stmt = select(CategoryTable).where(CategoryTable.id == article.category_id)
        result = await db.execute(stmt)
        category = result.scalar_one_or_none()
    
    if article.author_id:
        stmt = select(UserTable).where(UserTable.id == article.author_id)
        result = await db.execute(stmt)
        author = result.scalar_one_or_none()
    
    # Clean description for meta tags
    description = article.subtitle or article.seo_description or 'Останні наукові відкриття та дослідження з усього світу'
    description = re.sub(r'<[^>]+>', '', description)  # Remove HTML tags
    description = description.replace('"', '&quot;').replace("'", '&#x27;')  # Escape quotes
    
    # Clean title
    title = article.title.replace('"', '&quot;').replace("'", '&#x27;')
    
    # Generate HTML with meta tags
    html_content = f"""<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="utf-8">
    <title>{title} - Science Digest News</title>
    <meta name="description" content="{description}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{article.featured_image or 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop'}" />
    <meta property="og:url" content="https://sciencedigestnews.com/article/{article.slug}" />
    <meta property="og:site_name" content="Science Digest News" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{article.featured_image or 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop'}" />
    
    <!-- Article specific -->
    {f'<meta property="article:published_time" content="{article.published_at.isoformat()}" />' if article.published_at else ''}
    {f'<meta property="article:author" content="{author.username}" />' if author else ''}
    {f'<meta property="article:section" content="{category.name}" />' if category else ''}
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://sciencedigestnews.com/article/{article.slug}" />
    
    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" />
    
    {"<!-- Bot detected: Serving meta tags only -->" if is_bot else "<!-- Regular user: Redirecting to main app -->"}
    
    {f'''
    <script>
        // Redirect human users to the full React app after a brief delay
        setTimeout(function() {{
            window.location.href = 'https://fe8d82c0-0a63-4335-ac55-219ae55bdb53.preview.emergentagent.com/article/{article.slug}';
        }}, 500);
    </script>
    ''' if not is_bot else ''}
    
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }}
        .article-header {{
            border-bottom: 2px solid #0c61cf;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }}
        .category {{
            background: #0c61cf;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            text-transform: uppercase;
        }}
        .meta {{
            color: #666;
            font-size: 14px;
            margin: 10px 0;
        }}
    </style>
</head>
<body>
    <div class="article-header">
        <h1>{title}</h1>
        {f'<div class="category">{category.name}</div>' if category else ''}
        <div class="meta">
            {f'Автор: {author.username} | ' if author else ''}
            {f'Опубліковано: {article.published_at.strftime("%d.%m.%Y")}' if article.published_at else ''}
        </div>
        <p><strong>{description}</strong></p>
    </div>
    
    {f'<img src="{article.featured_image}" alt="{title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin: 20px 0;" />' if article.featured_image else ''}
    
    {'<p>📖 <em>Це мета-сторінка для ботів соціальних мереж. Повна стаття доступна на основному сайті.</em></p>' if is_bot else '<p>🔄 <em>Перенаправлення на повну версію статті...</em></p>'}
    
    <p><a href="https://fe8d82c0-0a63-4335-ac55-219ae55bdb53.preview.emergentagent.com/article/{article.slug}">👉 Читати повну статтю</a></p>
    
    <hr style="margin: 30px 0;" />
    <p style="text-align: center; color: #666; font-size: 14px;">
        <strong>Science Digest News</strong><br>
        Останні наукові відкриття та дослідження з усього світу
    </p>
</body>
</html>"""
    
    return HTMLResponse(content=html_content, status_code=200)

@router.get("/test/bots")
async def test_bot_detection(request: Request):
    """Test endpoint to check bot detection"""
    user_agent = request.headers.get('user-agent', '')
    is_bot = any(bot in user_agent.lower() for bot in [
        'facebookexternalhit', 'twitterbot', 'telegrambot', 'whatsapp',
        'slackbot', 'linkedinbot', 'viberbot', 'skypebot', 'discordbot',
        'googlebot', 'bingbot', 'yandexbot'
    ])
    
    return {
        "user_agent": user_agent,
        "is_bot": is_bot,
        "detected_bots": [bot for bot in ['facebookexternalhit', 'twitterbot', 'telegrambot', 'whatsapp', 'slackbot'] if bot in user_agent.lower()]
    }