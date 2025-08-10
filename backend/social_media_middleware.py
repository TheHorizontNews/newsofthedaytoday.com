"""
Social media meta tags middleware for article pages
"""
from fastapi import Request
from fastapi.responses import HTMLResponse
import re


async def social_media_meta_middleware(request: Request, call_next):
    """
    Middleware to serve meta tags for social media bots
    """
    response = await call_next(request)
    
    # Check if this is an article page request
    article_slug_match = re.match(r'^/article/([^/]+)/?$', str(request.url.path))
    
    if not article_slug_match:
        return response
    
    # Check if this is a bot request (social media crawlers)
    user_agent = request.headers.get('user-agent', '').lower()
    is_bot = any(bot in user_agent for bot in [
        'facebookexternalhit', 'twitterbot', 'telegrambot', 'whatsapp',
        'slackbot', 'linkedinbot', 'viberbot', 'skypebot', 'discordbot'
    ])
    
    if not is_bot:
        return response
    
    # Get article data from database
    article_slug = article_slug_match.group(1)
    
    try:
        from database import get_db
        from models import Article, Category, User
        from sqlalchemy.orm import joinedload
        
        # Get database session
        db_gen = get_db()
        db = next(db_gen)
        
        # Query article with related data
        article = db.query(Article).options(
            joinedload(Article.category),
            joinedload(Article.author)
        ).filter(
            Article.slug == article_slug,
            Article.status == "PUBLISHED"
        ).first()
        
        if not article:
            return response
        
        # Generate HTML with meta tags
        html_content = f"""<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="utf-8">
    <title>{article.title} - Science Digest News</title>
    <meta name="description" content="{article.subtitle or article.seo_description or 'Останні наукові відкриття та дослідження з усього світу'}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="{article.title}" />
    <meta property="og:description" content="{article.subtitle or article.seo_description or 'Останні наукові відкриття та дослідження з усього світу'}" />
    <meta property="og:image" content="{article.featured_image or 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop'}" />
    <meta property="og:url" content="https://sciencedigestnews.com/article/{article.slug}" />
    <meta property="og:site_name" content="Science Digest News" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{article.title}" />
    <meta name="twitter:description" content="{article.subtitle or article.seo_description or 'Останні наукові відкриття та дослідження з усього світу'}" />
    <meta name="twitter:image" content="{article.featured_image or 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop'}" />
    
    <!-- Article specific -->
    {f'<meta property="article:published_time" content="{article.published_at.isoformat()}" />' if article.published_at else ''}
    {f'<meta property="article:author" content="{article.author.username}" />' if article.author else ''}
    {f'<meta property="article:section" content="{article.category.name}" />' if article.category else ''}
    
    <!-- Redirect to main app after meta tags are read -->
    <script>
        setTimeout(function() {{
            window.location.href = '/article/{article.slug}';
        }}, 100);
    </script>
</head>
<body>
    <h1>{article.title}</h1>
    <p>{article.subtitle or ''}</p>
    <p>Перенаправлення на повну версію статті...</p>
</body>
</html>"""
        
        return HTMLResponse(content=html_content, status_code=200)
        
    except Exception as e:
        print(f"Error in social media middleware: {e}")
        return response
    finally:
        try:
            db.close()
        except:
            pass