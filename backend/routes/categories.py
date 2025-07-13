"""
Category management routes
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from ..auth import get_current_active_user, require_admin
from ..database import get_categories_collection
from ..models import Category, CategoryCreate, CategoryUpdate, User
from ..utils import create_slug, ensure_unique_slug, paginate_results, validate_object_id

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
    
    skip, limit = paginate_results(skip, limit)
    
    # Get categories
    categories_cursor = categories_collection.find(query).sort("name", 1).skip(skip).limit(limit)
    categories = await categories_cursor.to_list(length=limit)
    
    # Format responses
    result = []
    for category in categories:
        result.append(Category(
            id=str(category["_id"]),
            name=category["name"],
            slug=category["slug"],
            description=category.get("description"),
            created_at=category["created_at"]
        ))
    
    return result

@router.get("/{category_id}", response_model=Category)
async def get_category(
    category_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get single category by ID"""
    categories_collection = get_categories_collection()
    
    category = await categories_collection.find_one({"_id": validate_object_id(category_id)})
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return Category(
        id=str(category["_id"]),
        name=category["name"],
        slug=category["slug"],
        description=category.get("description"),
        created_at=category["created_at"]
    )

@router.post("/", response_model=Category)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(require_admin())
):
    """Create new category"""
    categories_collection = get_categories_collection()
    
    # Create slug
    slug = create_slug(category_data.name)
    slug = await ensure_unique_slug(categories_collection, slug)
    
    # Create category
    category_dict = {
        "name": category_data.name,
        "slug": slug,
        "description": category_data.description,
        "created_at": datetime.utcnow()
    }
    
    result = await categories_collection.insert_one(category_dict)
    category_dict["_id"] = result.inserted_id
    
    return Category(
        id=str(category_dict["_id"]),
        name=category_dict["name"],
        slug=category_dict["slug"],
        description=category_dict["description"],
        created_at=category_dict["created_at"]
    )

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: User = Depends(require_admin())
):
    """Update category"""
    categories_collection = get_categories_collection()
    
    # Get existing category
    category = await categories_collection.find_one({"_id": validate_object_id(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Prepare update data
    update_data = {}
    
    if category_data.name is not None:
        update_data["name"] = category_data.name
        # Update slug if name changed
        new_slug = create_slug(category_data.name)
        update_data["slug"] = await ensure_unique_slug(categories_collection, new_slug, category_id)
    
    if category_data.description is not None:
        update_data["description"] = category_data.description
    
    # Update category
    await categories_collection.update_one(
        {"_id": validate_object_id(category_id)},
        {"$set": update_data}
    )
    
    # Get updated category
    updated_category = await categories_collection.find_one({"_id": validate_object_id(category_id)})
    
    return Category(
        id=str(updated_category["_id"]),
        name=updated_category["name"],
        slug=updated_category["slug"],
        description=updated_category.get("description"),
        created_at=updated_category["created_at"]
    )

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(require_admin())
):
    """Delete category"""
    categories_collection = get_categories_collection()
    
    # Get category
    category = await categories_collection.find_one({"_id": validate_object_id(category_id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # TODO: Check if category is used by any articles
    # For now, we'll allow deletion
    
    # Delete category
    await categories_collection.delete_one({"_id": validate_object_id(category_id)})
    
    return {"message": "Category deleted successfully"}