"""
Article management routes
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from auth import get_current_active_user, require_editor_or_admin
from database import get_articles_collection, get_users_collection, get_categories_collection
from models import (
    Article, ArticleCreate, ArticleUpdate, ArticleResponse, 
    User, ArticleStatus, UserResponse, Category
)
import utils

router = APIRouter(prefix="/api/articles", tags=["articles"])

@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[ArticleStatus] = None,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None
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
        query["category_id"] = category_id
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"subtitle": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    skip, limit = utils.paginate_results(skip, limit)
    
    # Get articles
    articles_cursor = articles_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    articles = await articles_cursor.to_list(length=limit)
    
    # Get related data for each article
    result = []
    for article in articles:
        # Get author
        author = await users_collection.find_one({"_id": ObjectId(article["author_id"])})
        
        # Get category  
        category = await categories_collection.find_one({"_id": ObjectId(article["category_id"])})
        
        # Format response
        formatted_article = utils.format_article_response(article, author, category)
        result.append(formatted_article)
    
    return result

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str):
    """Get single article by ID"""
    articles_collection = get_articles_collection()
    users_collection = get_users_collection()
    categories_collection = get_categories_collection()
    
    article = await articles_collection.find_one({"_id": utils.validate_object_id(article_id)})
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    await articles_collection.update_one(
        {"_id": utils.validate_object_id(article_id)},
        {"$inc": {"views": 1}}
    )
    
    # Get author and category
    author = await users_collection.find_one({"_id": ObjectId(article["author_id"])})
    category = await categories_collection.find_one({"_id": ObjectId(article["category_id"])})
    
    return utils.format_article_response(article, author, category)

@router.post("/", response_model=ArticleResponse)
async def create_article(
    article_data: ArticleCreate,
    current_user: dict = Depends(require_editor_or_admin())
):
    """Create new article"""
    articles_collection = get_articles_collection()
    categories_collection = get_categories_collection()
    
    # Verify category exists
    category = await categories_collection.find_one({"_id": utils.validate_object_id(article_data.category_id)})
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    
    # Create slug
    slug = utils.create_slug(article_data.title)
    slug = await utils.ensure_unique_slug(articles_collection, slug)
    
    # Create article
    article_dict = {
        **article_data.model_dump(),
        "slug": slug,
        "author_id": str(current_user["_id"]),
        "views": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    if article_data.status == ArticleStatus.PUBLISHED:
        article_dict["published_at"] = datetime.utcnow()
    
    result = await articles_collection.insert_one(article_dict)
    
    # Get created article with related data
    created_article = await articles_collection.find_one({"_id": result.inserted_id})
    author = current_user
    
    return utils.format_article_response(created_article, author, category)

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    current_user: dict = Depends(require_editor_or_admin())
):
    """Update article"""
    articles_collection = get_articles_collection()
    categories_collection = get_categories_collection()
    users_collection = get_users_collection()
    
    # Get existing article
    article = await articles_collection.find_one({"_id": utils.validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if user can edit this article
    if current_user["role"] != "admin" and str(article["author_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to edit this article")
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    
    # Update fields that are provided
    if article_data.title is not None:
        update_data["title"] = article_data.title
        # Update slug if title changed
        if article_data.title != article.get("title"):
            new_slug = utils.create_slug(article_data.title)
            update_data["slug"] = await utils.ensure_unique_slug(articles_collection, new_slug, article_id)
    
    if article_data.subtitle is not None:
        update_data["subtitle"] = article_data.subtitle
    
    if article_data.content is not None:
        update_data["content"] = article_data.content
    
    if article_data.category_id is not None:
        # Verify category exists
        category = await categories_collection.find_one({"_id": utils.validate_object_id(article_data.category_id)})
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        update_data["category_id"] = article_data.category_id
    
    if article_data.tags is not None:
        update_data["tags"] = article_data.tags
    
    if article_data.featured_image is not None:
        update_data["featured_image"] = article_data.featured_image
    
    if article_data.seo_title is not None:
        update_data["seo_title"] = article_data.seo_title
    
    if article_data.seo_description is not None:
        update_data["seo_description"] = article_data.seo_description
    
    if article_data.status is not None:
        update_data["status"] = article_data.status
        # Set published_at when publishing
        if article_data.status == ArticleStatus.PUBLISHED and not article.get("published_at"):
            update_data["published_at"] = datetime.utcnow()
        # Remove published_at when unpublishing
        elif article_data.status != ArticleStatus.PUBLISHED:
            update_data["published_at"] = None
    
    # Update article
    await articles_collection.update_one(
        {"_id": utils.validate_object_id(article_id)},
        {"$set": update_data}
    )
    
    # Get updated article with related data
    updated_article = await articles_collection.find_one({"_id": utils.validate_object_id(article_id)})
    author = await users_collection.find_one({"_id": ObjectId(updated_article["author_id"])})
    category = await categories_collection.find_one({"_id": ObjectId(updated_article["category_id"])})
    
    return utils.format_article_response(updated_article, author, category)

@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: dict = Depends(require_editor_or_admin())
):
    """Delete article"""
    articles_collection = get_articles_collection()
    
    # Get article
    article = await articles_collection.find_one({"_id": utils.validate_object_id(article_id)})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check if user can delete this article
    if current_user["role"] != "admin" and str(article["author_id"]) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized to delete this article")
    
    # Delete article
    await articles_collection.delete_one({"_id": utils.validate_object_id(article_id)})
    
    return {"message": "Article deleted successfully"}
