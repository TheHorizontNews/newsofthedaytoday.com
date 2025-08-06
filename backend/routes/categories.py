"""
Category management routes for SQLite
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_active_user, require_admin
from database import get_db
from models import CategoryTable, Category, CategoryCreate, CategoryUpdate, UserTable
import utils

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[Category])
async def get_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get categories with pagination and filtering"""
    query = select(CategoryTable)
    
    if search:
        query = query.where(
            CategoryTable.name.contains(search) |
            CategoryTable.description.contains(search)
        )
    
    query = query.order_by(CategoryTable.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    return [Category.from_orm(cat) for cat in categories]

@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    current_user: UserTable = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single category by ID"""
    result = await db.execute(select(CategoryTable).where(CategoryTable.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return Category.from_orm(category)

@router.post("/", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Create new category"""
    # Create slug
    slug = utils.create_slug(category_data.name)
    
    # Ensure unique slug
    counter = 1
    original_slug = slug
    while True:
        result = await db.execute(select(CategoryTable).where(CategoryTable.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    # Create category
    category = CategoryTable(
        name=category_data.name,
        slug=slug,
        description=category_data.description
    )
    
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return Category.from_orm(category)

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Update category"""
    result = await db.execute(select(CategoryTable).where(CategoryTable.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Update fields
    if category_data.name is not None:
        category.name = category_data.name
        # Update slug if name changed
        new_slug = utils.create_slug(category_data.name)
        
        # Ensure unique slug
        counter = 1
        original_slug = new_slug
        while True:
            result = await db.execute(
                select(CategoryTable).where(
                    CategoryTable.slug == new_slug,
                    CategoryTable.id != category_id
                )
            )
            if not result.scalar_one_or_none():
                break
            new_slug = f"{original_slug}-{counter}"
            counter += 1
        
        category.slug = new_slug
    
    if category_data.description is not None:
        category.description = category_data.description
    
    await db.commit()
    await db.refresh(category)
    
    return Category.from_orm(category)

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: UserTable = Depends(require_admin()),
    db: AsyncSession = Depends(get_db)
):
    """Delete category"""
    result = await db.execute(select(CategoryTable).where(CategoryTable.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # TODO: Check if category is used by any articles
    
    await db.delete(category)
    await db.commit()
    
    return {"message": "Category deleted successfully"}