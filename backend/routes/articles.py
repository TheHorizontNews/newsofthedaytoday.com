"""
Article management routes
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from ..auth import get_current_active_user, require_editor_or_admin
from ..database import get_articles_collection, get_users_collection, get_categories_collection
from ..models import (
    Article, ArticleCreate, ArticleUpdate, ArticleResponse, 
    User, ArticleStatus, UserResponse, Category
)
from ..utils import create_slug, ensure_unique_slug, paginate_results, format_article_response, validate_object_id

router = APIRouter(prefix="/api/articles", tags=["articles"])

@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ArticleStatus] = None,
    category_id: Optional[str] = None,
    author_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get articles with pagination and filtering"""
    articles_collection = get_articles_collection()
    users_collection = get_users_collection()
    categories_collection = get_categories_collection()
    
    # Build query
    query = {}
    
    if status:
        query["status"] = status
    
    if category_id:
        query["category_id"] = validate_object_id(category_id)
    
    if author_id:
        query["author_id"] = validate_object_id(author_id)
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Non-admin users can only see their own articles
    if current_user.role != "admin":
        query["author_id"] = current_user.id
    
    skip, limit = paginate_results(skip, limit)
    
    # Get articles
    articles_cursor = articles_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    articles = await articles_cursor.to_list(length=limit)
    
    # Format responses
    result = []
    for article in articles:
        # Get author info
        author = await users_collection.find_one({"_id": article["author_id"]})
        # Get category info
        category = await categories_collection.find_one({"_id": article["category_id"]})
        
        if author and category:
            result.append(format_article_response(article, author, category))
    
    return result

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get single article by ID"""
    articles_collection = get_articles_collection()
    users_collection = get_users_collection()
    categories_collection = get_categories_collection()
    
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check permissions
    if current_user.role != "admin" and article["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get author and category info
    author = await users_collection.find_one({"_id": article["author_id"]})
    category = await categories_collection.find_one({"_id": article["category_id"]})
    
    if not author or not category:
        raise HTTPException(status_code=500, detail="Article data incomplete")
    
    return format_article_response(article, author, category)

@router.post("/", response_model=ArticleResponse)
async def create_article(
    article_data: ArticleCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create new article"""
    articles_collection = get_articles_collection()
    users_collection = get_users_collection()
    categories_collection = get_categories_collection()
    
    # Validate category exists
    category = await categories_collection.find_one({"_id": validate_object_id(article_data.category_id)})
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    
    # Create slug
    slug = create_slug(article_data.title)
    slug = await ensure_unique_slug(articles_collection, slug)
    
    # Create article
    article_dict = {
        "title": article_data.title,
        "subtitle": article_data.subtitle,
        "content": article_data.content,
        "author_id": current_user.id,
        "category_id": validate_object_id(article_data.category_id),
        "tags": article_data.tags,
        "featured_image": article_data.featured_image,
        "status": article_data.status,
        "slug": slug,
        "seo_title": article_data.seo_title,
        "seo_description": article_data.seo_description,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "views": 0
    }
    
    # Set published_at if status is published
    if article_data.status == ArticleStatus.PUBLISHED:
        article_dict["published_at"] = datetime.utcnow()
    
    result = await articles_collection.insert_one(article_dict)
    article_dict["_id"] = result.inserted_id
    
    # Get author info
    author = await users_collection.find_one({"_id": current_user.id})
    
    return format_article_response(article_dict, author, category)

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update article"""
    articles_collection = get_articles_collection()
    users_collection = get_users_collection()
    categories_collection = get_categories_collection()
    
    # Get existing article
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check permissions
    if current_user.role != "admin" and article["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    
    # Update fields if provided
    if article_data.title is not None:
        update_data["title"] = article_data.title
        # Update slug if title changed
        new_slug = create_slug(article_data.title)
        update_data["slug"] = await ensure_unique_slug(articles_collection, new_slug, article_id)
    
    if article_data.subtitle is not None:
        update_data["subtitle"] = article_data.subtitle
    
    if article_data.content is not None:
        update_data["content"] = article_data.content
    
    if article_data.category_id is not None:
        # Validate category exists
        category = await categories_collection.find_one({"_id": validate_object_id(article_data.category_id)})
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        update_data["category_id"] = validate_object_id(article_data.category_id)
    
    if article_data.tags is not None:
        update_data["tags"] = article_data.tags
    
    if article_data.featured_image is not None:
        update_data["featured_image"] = article_data.featured_image
    
    if article_data.status is not None:
        update_data["status"] = article_data.status
        # Set published_at if status changed to published
        if article_data.status == ArticleStatus.PUBLISHED and article["status"] != ArticleStatus.PUBLISHED:
            update_data["published_at"] = datetime.utcnow()
    
    if article_data.seo_title is not None:
        update_data["seo_title"] = article_data.seo_title
    
    if article_data.seo_description is not None:
        update_data["seo_description"] = article_data.seo_description
    
    # Update article
    await articles_collection.update_one(
        {"_id": validate_object_id(article_id)},
        {"$set": update_data}
    )
    
    # Get updated article
    updated_article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    
    # Get author and category info
    author = await users_collection.find_one({"_id": updated_article["author_id"]})
    category = await categories_collection.find_one({"_id": updated_article["category_id"]})
    
    return format_article_response(updated_article, author, category)

@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: User = Depends(require_editor_or_admin())
):
    """Delete article"""
    articles_collection = get_articles_collection()
    
    # Get article
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check permissions (only admin or author can delete)
    if current_user.role != "admin" and article["author_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete article
    await articles_collection.delete_one({"_id": validate_object_id(article_id)})
    
    return {"message": "Article deleted successfully"}

@router.post("/{article_id}/publish")
async def publish_article(
    article_id: str,
    current_user: User = Depends(require_editor_or_admin())
):
    """Publish article"""
    articles_collection = get_articles_collection()
    
    # Get article
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Update status to published
    await articles_collection.update_one(
        {"_id": validate_object_id(article_id)},
        {"$set": {
            "status": ArticleStatus.PUBLISHED,
            "published_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Article published successfully"}

@router.post("/{article_id}/unpublish")
async def unpublish_article(
    article_id: str,
    current_user: User = Depends(require_editor_or_admin())
):
    """Unpublish article"""
    articles_collection = get_articles_collection()
    
    # Get article
    article = await articles_collection.find_one({"_id": validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Update status to draft
    await articles_collection.update_one(
        {"_id": validate_object_id(article_id)},
        {"$set": {
            "status": ArticleStatus.DRAFT,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Article unpublished successfully"}