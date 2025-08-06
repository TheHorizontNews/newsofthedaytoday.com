"""
Main FastAPI application for Science Digest News
"""
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Import route modules
from routes.articles import router as articles_router
from routes.users import router as users_router
from routes.categories import router as categories_router
from routes.auth import router as auth_router
from routes.analytics import router as analytics_router
from routes.seo import router as seo_router_new
from seo_routes import router as seo_router

# Import database
from database import init_db

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifespan handler"""
    # Startup
    await init_db()
    logger.info("SQLite database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")

# Create FastAPI app
app = FastAPI(
    title="Science Digest News API",
    description="Backend API for Science Digest News platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(articles_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(auth_router)
app.include_router(analytics_router)
app.include_router(seo_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Science Digest News API"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Science Digest News API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)