"""
Article management routes for SQLite
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_active_user, require_editor_or_admin
from database import get_db, tags_to_json, json_to_tags
from models import (
    ArticleTable, UserTable, CategoryTable,
    ArticleCreate, ArticleUpdate, ArticleResponse, 
    ArticleStatus, UserResponse, Category, UserProfile
)
import utils

router = APIRouter(prefix="/api/articles", tags=["articles"])

@router.get("/", response_model=List[ArticleResponse])
async def get_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get articles with pagination and filtering (public endpoint)"""
    query = select(ArticleTable, UserTable, CategoryTable).join(
        UserTable, ArticleTable.author_id == UserTable.id
    ).join(
        CategoryTable, ArticleTable.category_id == CategoryTable.id
    )
    
    # Build where conditions
    conditions = []
    
    if status:
        try:
            status_enum = ArticleStatus(status)
            conditions.append(ArticleTable.status == status_enum)
        except ValueError:
            # Invalid status, ignore
            pass
    
    if category_id and category_id.strip():
        conditions.append(ArticleTable.category_id == category_id)
    
    if author_id and author_id.strip():
        conditions.append(ArticleTable.author_id == author_id)
    
    if search and search.strip():
        conditions.append(
            or_(
                ArticleTable.title.contains(search),
                ArticleTable.content.contains(search),
                ArticleTable.tags.contains(search)
            )
        )
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(ArticleTable.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    rows = result.fetchall()
    
    # Format responses
    response_articles = []
    for article, author, category in rows:
        author_profile = UserProfile(
            name=author.name or "",
            bio=author.bio,
            avatar=author.avatar
        )
        
        author_response = UserResponse(
            id=author.id,
            username=author.username,
            email=author.email,
            role=author.role,
            profile=author_profile,
            created_at=author.created_at,
            last_login=author.last_login,
            is_active=author.is_active
        )
        
        category_response = Category(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            created_at=category.created_at
        )
        
        response_articles.append(ArticleResponse(
            id=article.id,
            title=article.title,
            subtitle=article.subtitle,
            content=article.content,
            author=author_response,
            category=category_response,
            tags=json_to_tags(article.tags),
            featured_image=article.featured_image,
            status=article.status,
            published_at=article.published_at,
            created_at=article.created_at,
            updated_at=article.updated_at,
            views=article.views,
            slug=article.slug,
            seo_title=article.seo_title,
            seo_description=article.seo_description
        ))
    
@router.get("/admin", response_model=List[ArticleResponse])
async def get_articles_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get articles with pagination and filtering (admin endpoint with auth)"""
    query = select(ArticleTable, UserTable, CategoryTable).join(
        UserTable, ArticleTable.author_id == UserTable.id
    ).join(
        CategoryTable, ArticleTable.category_id == CategoryTable.id
    )
    
    # Build where conditions
    conditions = []
    
    if status and status.strip():
        try:
            status_enum = ArticleStatus(status)
            conditions.append(ArticleTable.status == status_enum)
        except ValueError:
            # Invalid status, ignore
            pass
    
    if category_id and category_id.strip():
        conditions.append(ArticleTable.category_id == category_id)
    
    if author_id and author_id.strip():
        conditions.append(ArticleTable.author_id == author_id)
    
    if search and search.strip():
        conditions.append(
            or_(
                ArticleTable.title.contains(search),
                ArticleTable.content.contains(search),
                ArticleTable.tags.contains(search)
            )
        )
    
    # Non-admin users can only see their own articles
    if current_user.role != "admin":
        conditions.append(ArticleTable.author_id == current_user.id)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(ArticleTable.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    rows = result.fetchall()
    
    # Format responses
    response_articles = []
    for article, author, category in rows:
        author_profile = UserProfile(
            name=author.name or "",
            bio=author.bio,
            avatar=author.avatar
        )
        
        author_response = UserResponse(
            id=author.id,
            username=author.username,
            email=author.email,
            role=author.role,
            profile=author_profile,
            created_at=author.created_at,
            last_login=author.last_login,
            is_active=author.is_active
        )
        
        category_response = Category(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            created_at=category.created_at
        )
        
        response_articles.append(ArticleResponse(
            id=article.id,
            title=article.title,
            subtitle=article.subtitle,
            content=article.content,
            author=author_response,
            category=category_response,
            tags=json_to_tags(article.tags),
            featured_image=article.featured_image,
            status=article.status,
            published_at=article.published_at,
            created_at=article.created_at,
            updated_at=article.updated_at,
            views=article.views,
            slug=article.slug,
            seo_title=article.seo_title,
            seo_description=article.seo_description
        ))
    
    return response_articles
async def get_article(
    article_id: str,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single article by ID"""
    result = await db.execute(
        select(ArticleTable, UserTable, CategoryTable).join(
            UserTable, ArticleTable.author_id == UserTable.id
        ).join(
            CategoryTable, ArticleTable.category_id == CategoryTable.id
        ).where(ArticleTable.id == article_id)
    )
    
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article, author, category = row
    
    # Check permissions
    if current_user.role != "admin" and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Format response
    author_profile = UserProfile(
        name=author.name or "",
        bio=author.bio,
        avatar=author.avatar
    )
    
    author_response = UserResponse(
        id=author.id,
        username=author.username,
        email=author.email,
        role=author.role,
        profile=author_profile,
        created_at=author.created_at,
        last_login=author.last_login,
        is_active=author.is_active
    )
    
    category_response = Category(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        created_at=category.created_at
    )
    
    return ArticleResponse(
        id=article.id,
        title=article.title,
        subtitle=article.subtitle,
        content=article.content,
        author=author_response,
        category=category_response,
        tags=json_to_tags(article.tags),
        featured_image=article.featured_image,
        status=article.status,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
        views=article.views,
        slug=article.slug,
        seo_title=article.seo_title,
        seo_description=article.seo_description
    )

@router.post("/", response_model=ArticleResponse)
async def create_article(
    article_data: ArticleCreate,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new article"""
    # Validate category exists
    result = await db.execute(select(CategoryTable).where(CategoryTable.id == article_data.category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    
    # Create slug
    slug = utils.create_slug(article_data.title)
    
    # Ensure unique slug
    counter = 1
    original_slug = slug
    while True:
        result = await db.execute(select(ArticleTable).where(ArticleTable.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    # Create article
    article = ArticleTable(
        title=article_data.title,
        subtitle=article_data.subtitle,
        content=article_data.content,
        author_id=current_user.id,
        category_id=article_data.category_id,
        tags=tags_to_json(article_data.tags),
        featured_image=article_data.featured_image,
        status=article_data.status,
        slug=slug,
        seo_title=article_data.seo_title,
        seo_description=article_data.seo_description,
        views=0
    )
    
    # Set published_at if status is published
    if article_data.status == ArticleStatus.PUBLISHED:
        article.published_at = datetime.utcnow()
    
    db.add(article)
    await db.commit()
    await db.refresh(article)
    
    # Get author for response
    author_profile = UserProfile(
        name=current_user.name or "",
        bio=current_user.bio,
        avatar=current_user.avatar
    )
    
    author_response = UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        profile=author_profile,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        is_active=current_user.is_active
    )
    
    category_response = Category(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        created_at=category.created_at
    )
    
    return ArticleResponse(
        id=article.id,
        title=article.title,
        subtitle=article.subtitle,
        content=article.content,
        author=author_response,
        category=category_response,
        tags=json_to_tags(article.tags),
        featured_image=article.featured_image,
        status=article.status,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
        views=article.views,
        slug=article.slug,
        seo_title=article.seo_title,
        seo_description=article.seo_description
    )

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article_data: ArticleUpdate,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update article"""
    # Get existing article
    result = await db.execute(select(ArticleTable).where(ArticleTable.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check permissions
    if current_user.role != "admin" and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Update fields
    if article_data.title is not None:
        article.title = article_data.title
        # Update slug if title changed
        new_slug = utils.create_slug(article_data.title)
        
        # Ensure unique slug
        counter = 1
        original_slug = new_slug
        while True:
            result = await db.execute(
                select(ArticleTable).where(
                    ArticleTable.slug == new_slug,
                    ArticleTable.id != article_id
                )
            )
            if not result.scalar_one_or_none():
                break
            new_slug = f"{original_slug}-{counter}"
            counter += 1
        
        article.slug = new_slug
    
    if article_data.subtitle is not None:
        article.subtitle = article_data.subtitle
    
    if article_data.content is not None:
        article.content = article_data.content
    
    if article_data.category_id is not None:
        # Validate category exists
        result = await db.execute(select(CategoryTable).where(CategoryTable.id == article_data.category_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Category not found")
        article.category_id = article_data.category_id
    
    if article_data.tags is not None:
        article.tags = tags_to_json(article_data.tags)
    
    if article_data.featured_image is not None:
        article.featured_image = article_data.featured_image
    
    if article_data.status is not None:
        article.status = article_data.status
        # Set published_at if status changed to published
        if article_data.status == ArticleStatus.PUBLISHED and article.status != ArticleStatus.PUBLISHED:
            article.published_at = datetime.utcnow()
    
    if article_data.seo_title is not None:
        article.seo_title = article_data.seo_title
    
    if article_data.seo_description is not None:
        article.seo_description = article_data.seo_description
    
    article.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(article)
    
    # Get author and category for response
    result = await db.execute(
        select(UserTable, CategoryTable).where(
            UserTable.id == article.author_id,
            CategoryTable.id == article.category_id
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=500, detail="Article data incomplete")
    
    author, category = row
    
    author_profile = UserProfile(
        name=author.name or "",
        bio=author.bio,
        avatar=author.avatar
    )
    
    author_response = UserResponse(
        id=author.id,
        username=author.username,
        email=author.email,
        role=author.role,
        profile=author_profile,
        created_at=author.created_at,
        last_login=author.last_login,
        is_active=author.is_active
    )
    
    category_response = Category(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        created_at=category.created_at
    )
    
    return ArticleResponse(
        id=article.id,
        title=article.title,
        subtitle=article.subtitle,
        content=article.content,
        author=author_response,
        category=category_response,
        tags=json_to_tags(article.tags),
        featured_image=article.featured_image,
        status=article.status,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
        views=article.views,
        slug=article.slug,
        seo_title=article.seo_title,
        seo_description=article.seo_description
    )

@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: UserTable = Depends(require_editor_or_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Delete article"""
    result = await db.execute(select(ArticleTable).where(ArticleTable.id == article_id))
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Check permissions (only admin or author can delete)
    if current_user.role != "admin" and article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    await db.delete(article)
    await db.commit()
    
    return {"message": "Article deleted successfully"}

@router.post("/{article_id}/publish")
async def publish_article(
    article_id: str,
    current_user: UserTable = Depends(require_editor_or_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Publish article"""
    result = await db.execute(select(ArticleTable).where(ArticleTable.id == article_id))
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.status = ArticleStatus.PUBLISHED
    article.published_at = datetime.utcnow()
    article.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Article published successfully"}

@router.post("/{article_id}/unpublish")
async def unpublish_article(
    article_id: str,
    current_user: UserTable = Depends(require_editor_or_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Unpublish article"""
    result = await db.execute(select(ArticleTable).where(ArticleTable.id == article_id))
    article = result.scalar_one_or_none()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.status = ArticleStatus.DRAFT
    article.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Article unpublished successfully"}