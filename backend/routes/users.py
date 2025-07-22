"""
User management routes
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from auth import get_current_active_user, require_admin, get_password_hash
from database import get_users_collection
from models import User, UserCreate, UserUpdate, UserResponse, UserRole
import utils

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin())
):
    """Get users with pagination and filtering"""
    users_collection = get_users_collection()
    
    # Build query
    query = {}
    
    if role:
        query["role"] = role
    
    if search:
        query["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"profile.name": {"$regex": search, "$options": "i"}}
        ]
    
    skip, limit = utils.paginate_results(skip, limit)
    
    # Get users
    users_cursor = users_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = await users_cursor.to_list(length=limit)
    
    # Convert to response format
    result = []
    for user in users:
        user_response = {
            "_id": user["_id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user["is_active"],
            "profile": user.get("profile", {}),
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        }
        result.append(user_response)
    
    return result

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin())
):
    """Create new user"""
    users_collection = get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({
        "$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]
    })
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "role": user_data.role,
        "is_active": user_data.is_active,
        "profile": user_data.profile.model_dump(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    
    # Return created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    user_response = {
        "_id": created_user["_id"],
        "username": created_user["username"],
        "email": created_user["email"],
        "role": created_user["role"],
        "is_active": created_user["is_active"],
        "profile": created_user.get("profile", {}),
        "created_at": created_user["created_at"],
        "updated_at": created_user["updated_at"]
    }
    
    return user_response

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin())
):
    """Delete user"""
    users_collection = get_users_collection()
    
    # Get user
    user = await users_collection.find_one({"_id": utils.validate_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting yourself
    if str(user["_id"]) == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Delete user
    await users_collection.delete_one({"_id": utils.validate_object_id(user_id)})
    
    return {"message": "User deleted successfully"}
