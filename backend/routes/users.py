"""
User management routes
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId

from ..auth import get_current_active_user, require_admin, get_password_hash
from ..database import get_users_collection
from ..models import User, UserCreate, UserUpdate, UserResponse, UserRole
from ..utils import paginate_results, validate_object_id

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
    
    skip, limit = paginate_results(skip, limit)
    
    # Get users
    users_cursor = users_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = await users_cursor.to_list(length=limit)
    
    # Format responses
    result = []
    for user in users:
        result.append(UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            role=user["role"],
            profile=user["profile"],
            created_at=user["created_at"],
            last_login=user.get("last_login"),
            is_active=user["is_active"]
        ))
    
    return result

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin())
):
    """Get single user by ID"""
    users_collection = get_users_collection()
    
    user = await users_collection.find_one({"_id": validate_object_id(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        role=user["role"],
        profile=user["profile"],
        created_at=user["created_at"],
        last_login=user.get("last_login"),
        is_active=user["is_active"]
    )

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin())
):
    """Create new user"""
    users_collection = get_users_collection()
    
    # Check if username or email already exists
    existing_user = await users_collection.find_one({
        "$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists"
        )
    
    # Create user
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "role": user_data.role,
        "profile": user_data.profile.dict(),
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    return UserResponse(
        id=str(user_dict["_id"]),
        username=user_dict["username"],
        email=user_dict["email"],
        role=user_dict["role"],
        profile=user_dict["profile"],
        created_at=user_dict["created_at"],
        last_login=None,
        is_active=user_dict["is_active"]
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin())
):
    """Update user"""
    users_collection = get_users_collection()
    
    # Get existing user
    user = await users_collection.find_one({"_id": validate_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare update data
    update_data = {}
    
    if user_data.username is not None:
        # Check if username already exists
        existing = await users_collection.find_one({
            "username": user_data.username,
            "_id": {"$ne": validate_object_id(user_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        update_data["username"] = user_data.username
    
    if user_data.email is not None:
        # Check if email already exists
        existing = await users_collection.find_one({
            "email": user_data.email,
            "_id": {"$ne": validate_object_id(user_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        update_data["email"] = user_data.email
    
    if user_data.role is not None:
        update_data["role"] = user_data.role
    
    if user_data.profile is not None:
        update_data["profile"] = user_data.profile.dict()
    
    if user_data.is_active is not None:
        update_data["is_active"] = user_data.is_active
    
    # Update user
    await users_collection.update_one(
        {"_id": validate_object_id(user_id)},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": validate_object_id(user_id)})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        username=updated_user["username"],
        email=updated_user["email"],
        role=updated_user["role"],
        profile=updated_user["profile"],
        created_at=updated_user["created_at"],
        last_login=updated_user.get("last_login"),
        is_active=updated_user["is_active"]
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin())
):
    """Delete user"""
    users_collection = get_users_collection()
    
    # Prevent self-deletion
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Get user
    user = await users_collection.find_one({"_id": validate_object_id(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user
    await users_collection.delete_one({"_id": validate_object_id(user_id)})
    
    return {"message": "User deleted successfully"}