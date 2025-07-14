"""
Category management routes
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from auth import get_current_active_user, require_admin
from database import get_categories_collection
from models import Category, CategoryCreate, CategoryUpdate, User
import utils

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[Category])
async def get_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get categories with pagination and filtering"""
    categories_collection = get_categories_collection()
    
    # Build query
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    skip, limit = utils.paginate_results(skip, limit)
    
    # Get categories
    categories_cursor = categories_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    categories = await categories_cursor.to_list(length=limit)
    
    # Convert ObjectId to string for response
    for category in categories:
        category["id"] = str(category["_id"])
        del category["_id"]
    
    return categories

@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get single category by ID"""
    categories_collection = get_categories_collection()
    
    category = await categories_collection.find_one({"_id": utils.validate_object_id(category_id)})
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Convert ObjectId to string for response
    category["id"] = str(category["_id"])
    del category["_id"]
    
    return category

@router.post("/", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(require_admin())
):
    """Create new category"""
    categories_collection = get_categories_collection()
    
    # Create slug
    slug = utils.create_slug(category_data.name)
    slug = await utils.ensure_unique_slug(categories_collection, slug)
    
    # Create category
    category_dict = {
        "name": category_data.name,
        "slug": slug,
        "description": category_data.description,
        "created_at": datetime.utcnow()
    }
    
    result = await categories_collection.insert_one(category_dict)
    category_dict["id"] = str(result.inserted_id)
    del category_dict["_id"] if "_id" in category_dict else None
    
    return category_dict

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: User = Depends(require_admin())
):
    """Update category"""
    categories_collection = get_categories_collection()
    
    # Get existing category
    category = await categories_collection.find_one({"_id": utils.validate_object_id(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Prepare update data
    update_data = {}
    
    if category_data.name is not None:
        update_data["name"] = category_data.name
        # Update slug if name changed
        new_slug = utils.create_slug(category_data.name)
        update_data["slug"] = await utils.ensure_unique_slug(categories_collection, new_slug, category_id)
    
    if category_data.description is not None:
        update_data["description"] = category_data.description
    
    # Update category
    await categories_collection.update_one(
        {"_id": utils.validate_object_id(category_id)},
        {"$set": update_data}
    )
    
    # Get updated category
    updated_category = await categories_collection.find_one({"_id": utils.validate_object_id(category_id)})
    
    # Convert ObjectId to string for response
    updated_category["id"] = str(updated_category["_id"])
    del updated_category["_id"]
    
    return updated_category

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(require_admin())
):
    """Delete category"""
    categories_collection = get_categories_collection()
    
    # Get category
    category = await categories_collection.find_one({"_id": utils.validate_object_id(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # TODO: Check if category is used by any articles
    
    # Delete category
    await categories_collection.delete_one({"_id": utils.validate_object_id(category_id)})
    
    return {"message": "Category deleted successfully"}