#!/usr/bin/env python3
"""
Backend API Testing for Article Management Functionality
Tests all article CRUD operations and related endpoints
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://77b80d3b-08a9-4440-a9ff-928d52268df6.preview.emergentagent.com')

class BackendTester:
    def __init__(self):
        self.session = None
        self.results = []
        self.auth_token = None
        self.test_article_id = None
        self.test_category_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    async def authenticate_admin(self):
        """Authenticate as admin user"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("access_token")
                    if self.auth_token:
                        self.log_result("Admin Authentication", True, "Successfully authenticated as admin")
                        return True
                    else:
                        self.log_result("Admin Authentication", False, "No access token in response")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Admin Authentication", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Admin Authentication", False, f"Exception: {str(e)}")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
    
    async def test_categories_admin_endpoint(self):
        """Test categories admin endpoint to get a valid category ID"""
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        self.test_category_id = data[0]["id"]
                        self.log_result("Categories Admin Endpoint", True, f"Found {len(data)} categories, using category ID: {self.test_category_id}")
                        return True
                    else:
                        self.log_result("Categories Admin Endpoint", False, "No categories found")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Categories Admin Endpoint", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Categories Admin Endpoint", False, f"Exception: {str(e)}")
            return False
    
    async def test_articles_list_endpoint(self):
        """Test GET /api/articles/ - list all articles"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/articles/") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_result("Articles List Endpoint", True, f"Retrieved {len(data)} articles")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Articles List Endpoint", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Articles List Endpoint", False, f"Exception: {str(e)}")
            return False
    
    async def test_create_article(self):
        """Test POST /api/articles/ - create new article"""
        if not self.test_category_id:
            self.log_result("Create Article", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            article_data = {
                "title": "Test Article",
                "subtitle": "Test Subtitle",
                "content": "This is test content for the article.",
                "category_id": self.test_category_id,
                "tags": ["test", "article", "science"],
                "status": "draft",
                "seo_title": "Test SEO Title",
                "seo_description": "Test SEO description"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.test_article_id = data.get("id")
                    if self.test_article_id:
                        self.log_result("Create Article", True, f"Article created with ID: {self.test_article_id}")
                        return True
                    else:
                        self.log_result("Create Article", False, "No article ID in response")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Create Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Create Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_get_specific_article(self):
        """Test GET /api/articles/{id} - get specific article"""
        if not self.test_article_id:
            self.log_result("Get Specific Article", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/articles/{self.test_article_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("id") == self.test_article_id:
                        self.log_result("Get Specific Article", True, f"Retrieved article: {data.get('title')}")
                        return True
                    else:
                        self.log_result("Get Specific Article", False, "Article ID mismatch")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Get Specific Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Get Specific Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_update_article(self):
        """Test PUT /api/articles/{id} - update existing article"""
        if not self.test_article_id:
            self.log_result("Update Article", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            update_data = {
                "title": "Updated Test Article",
                "subtitle": "Updated Test Subtitle",
                "content": "This is updated test content for the article.",
                "status": "published"
            }
            
            async with self.session.put(f"{BACKEND_URL}/api/articles/{self.test_article_id}", json=update_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("title") == "Updated Test Article":
                        self.log_result("Update Article", True, f"Article updated successfully: {data.get('title')}")
                        return True
                    else:
                        self.log_result("Update Article", False, "Article title not updated")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Update Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Update Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_delete_article(self):
        """Test DELETE /api/articles/{id} - delete article"""
        if not self.test_article_id:
            self.log_result("Delete Article", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            async with self.session.delete(f"{BACKEND_URL}/api/articles/{self.test_article_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    if "deleted successfully" in data.get("message", "").lower():
                        self.log_result("Delete Article", True, "Article deleted successfully")
                        return True
                    else:
                        self.log_result("Delete Article", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Delete Article", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Delete Article", False, f"Exception: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling with invalid data"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test with missing required fields
            invalid_data = {
                "title": "Test Article"
                # Missing content and category_id
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=invalid_data, headers=headers) as response:
                if response.status in [400, 422]:
                    self.log_result("Error Handling - Missing Fields", True, f"HTTP {response.status} (proper validation)")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Error Handling - Missing Fields", False, f"HTTP {response.status} (should be 400/422)", error_data)
                    return False
        except Exception as e:
            self.log_result("Error Handling - Missing Fields", False, f"Exception: {str(e)}")
            return False
    
    async def test_invalid_category_id(self):
        """Test with invalid category_id"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            article_data = {
                "title": "Test Article",
                "content": "Test content",
                "category_id": "invalid-category-id",
                "tags": ["test"],
                "status": "draft"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status in [400, 404]:
                    self.log_result("Error Handling - Invalid Category", True, f"HTTP {response.status} (proper validation)")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Error Handling - Invalid Category", False, f"HTTP {response.status} (should be 400/404)", error_data)
                    return False
        except Exception as e:
            self.log_result("Error Handling - Invalid Category", False, f"Exception: {str(e)}")
            return False
    
    async def test_authentication_requirements(self):
        """Test that protected endpoints require authentication"""
        try:
            # Test without authentication
            article_data = {
                "title": "Test Article",
                "content": "Test content",
                "category_id": "test-id",
                "status": "draft"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data) as response:
                if response.status in [401, 403]:
                    self.log_result("Authentication Requirements", True, f"HTTP {response.status} (properly protected)")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Authentication Requirements", False, f"HTTP {response.status} (should require auth)", error_data)
                    return False
        except Exception as e:
            self.log_result("Authentication Requirements", False, f"Exception: {str(e)}")
            return False
    
    async def test_ukrainian_article_creation(self):
        """Test creating article with Ukrainian title and content"""
        if not self.test_category_id:
            self.log_result("Ukrainian Article Creation", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Ukrainian article data as requested
            article_data = {
                "title": "Новітні технології штучного інтелекту",
                "subtitle": "Революційний прорив у сфері ШІ",
                "content": "Це тестова стаття для перевірки збереження контенту. Контент має бути збережений після публікації. Штучний інтелект революційний прорив у технологіях.",
                "category_id": self.test_category_id,
                "tags": ["штучний інтелект", "технології", "наука", "дослідження"],
                "featured_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A",
                "status": "published",
                "seo_title": "Новітні технології ШІ - Science Digest News",
                "seo_description": "Дізнайтеся про найновіші досягнення у сфері штучного інтелекту та їх вплив на майбутнє технологій."
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    self.test_article_id = data.get("id")
                    if self.test_article_id:
                        # Check if content was saved properly
                        saved_content = data.get("content", "")
                        saved_title = data.get("title", "")
                        saved_slug = data.get("slug", "")
                        saved_featured_image = data.get("featured_image", "")
                        
                        # Verify content persistence
                        content_saved = "збереження контенту" in saved_content
                        title_saved = saved_title == article_data["title"]
                        featured_image_saved = saved_featured_image == article_data["featured_image"]
                        
                        details = f"Article created with ID: {self.test_article_id}, Slug: '{saved_slug}', Content saved: {content_saved}, Title saved: {title_saved}, Featured image saved: {featured_image_saved}"
                        
                        self.log_result("Ukrainian Article Creation", True, details)
                        return True
                    else:
                        self.log_result("Ukrainian Article Creation", False, "No article ID in response")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Ukrainian Article Creation", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Ukrainian Article Creation", False, f"Exception: {str(e)}")
            return False

    async def test_ukrainian_article_retrieval(self):
        """Test retrieving Ukrainian article to verify content persistence"""
        if not self.test_article_id:
            self.log_result("Ukrainian Article Retrieval", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/articles/{self.test_article_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify all fields are properly saved
                    title = data.get("title", "")
                    content = data.get("content", "")
                    slug = data.get("slug", "")
                    featured_image = data.get("featured_image", "")
                    tags = data.get("tags", [])
                    status = data.get("status", "")
                    seo_title = data.get("seo_title", "")
                    seo_description = data.get("seo_description", "")
                    
                    # Check content persistence
                    content_persisted = "збереження контенту" in content and "публікації" in content
                    title_persisted = "Новітні технології" in title
                    ukrainian_tags = any("штучний" in tag for tag in tags)
                    
                    details = f"Retrieved article - Title: '{title}', Slug: '{slug}', Content persisted: {content_persisted}, Ukrainian tags: {ukrainian_tags}, Status: {status}, Featured image present: {bool(featured_image)}"
                    
                    if content_persisted and title_persisted:
                        self.log_result("Ukrainian Article Retrieval", True, details)
                        return True
                    else:
                        self.log_result("Ukrainian Article Retrieval", False, f"Content not properly persisted. {details}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Ukrainian Article Retrieval", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Ukrainian Article Retrieval", False, f"Exception: {str(e)}")
            return False

    async def test_english_slug_generation(self):
        """Test English slug generation from Ukrainian titles (specific test cases from review)"""
        if not self.test_category_id:
            self.log_result("English Slug Generation", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test specific cases from the review request
            test_cases = [
                {
                    "title": "Новітні технології штучного інтелекту",
                    "expected": "novitni-tekhnolohiyi-shtuchnoho-intelektu"
                },
                {
                    "title": "Штучний інтелект революційний прорив", 
                    "expected": "shtuchnyi-intelekt-revolyutsiynyi-proryv"
                },
                {
                    "title": "Дивні новини про технології",
                    "expected": "dyvni-novyny-pro-tekhnolohiyi"
                }
            ]
            
            results = []
            all_passed = True
            
            for i, test_case in enumerate(test_cases):
                title = test_case["title"]
                expected_slug = test_case["expected"]
                
                article_data = {
                    "title": title,
                    "content": f"Тестовий контент для статті {i+1}",
                    "category_id": self.test_category_id,
                    "tags": ["тест"],
                    "status": "draft"
                }
                
                async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        actual_slug = data.get("slug", "")
                        
                        # Check if slug matches expected
                        slug_matches = actual_slug == expected_slug
                        if not slug_matches:
                            all_passed = False
                        
                        # Check if slug is URL-safe (no URL-encoded characters)
                        is_url_safe = '%' not in actual_slug and all(ord(c) < 128 for c in actual_slug)
                        if not is_url_safe:
                            all_passed = False
                        
                        results.append(f"'{title}' -> '{actual_slug}' (expected: '{expected_slug}', match: {slug_matches}, URL-safe: {is_url_safe})")
                        
                        # Clean up test article
                        article_id = data.get("id")
                        if article_id:
                            await self.session.delete(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers)
                    else:
                        error_data = await response.text()
                        results.append(f"'{title}' -> ERROR {response.status}: {error_data}")
                        all_passed = False
            
            details = "English slug generation results: " + "; ".join(results)
            self.log_result("English Slug Generation", all_passed, details)
            return all_passed
            
        except Exception as e:
            self.log_result("English Slug Generation", False, f"Exception: {str(e)}")
            return False

    async def test_slug_uniqueness(self):
        """Test that duplicate titles generate unique slugs"""
        if not self.test_category_id:
            self.log_result("Slug Uniqueness", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Create multiple articles with the same Ukrainian title
            title = "Новітні технології штучного інтелекту"
            created_articles = []
            slugs_generated = []
            
            for i in range(3):
                article_data = {
                    "title": title,
                    "content": f"Тестовий контент для статті {i+1}",
                    "category_id": self.test_category_id,
                    "tags": ["тест"],
                    "status": "draft"
                }
                
                async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        article_id = data.get("id")
                        slug = data.get("slug", "")
                        created_articles.append(article_id)
                        slugs_generated.append(slug)
                    else:
                        error_data = await response.text()
                        self.log_result("Slug Uniqueness", False, f"Failed to create article {i+1}: {response.status} - {error_data}")
                        return False
            
            # Check that all slugs are unique
            unique_slugs = len(set(slugs_generated)) == len(slugs_generated)
            
            # Check that first slug is base, others have suffixes
            expected_pattern = slugs_generated[0] == "novitni-tekhnolohiyi-shtuchnoho-intelektu"
            expected_pattern = expected_pattern and slugs_generated[1] == "novitni-tekhnolohiyi-shtuchnoho-intelektu-1"
            expected_pattern = expected_pattern and slugs_generated[2] == "novitni-tekhnolohiyi-shtuchnoho-intelektu-2"
            
            # Clean up test articles
            for article_id in created_articles:
                if article_id:
                    await self.session.delete(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers)
            
            details = f"Generated slugs: {slugs_generated}, All unique: {unique_slugs}, Pattern correct: {expected_pattern}"
            success = unique_slugs and expected_pattern
            
            self.log_result("Slug Uniqueness", success, details)
            return success
            
        except Exception as e:
            self.log_result("Slug Uniqueness", False, f"Exception: {str(e)}")
            return False

    async def test_url_compatibility(self):
        """Test that generated slugs are URL-compatible"""
        if not self.test_category_id:
            self.log_result("URL Compatibility", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test various Ukrainian titles with special characters
            test_titles = [
                "Новітні технології: штучний інтелект!",
                "Дивні новини про технології (2024)",
                "Наука & дослідження в Україні - огляд",
                "Штучний інтелект, машинне навчання та ІоТ",
                "100% українські технології"
            ]
            
            results = []
            all_url_safe = True
            
            for title in test_titles:
                article_data = {
                    "title": title,
                    "content": "Тестовий контент",
                    "category_id": self.test_category_id,
                    "tags": ["тест"],
                    "status": "draft"
                }
                
                async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        slug = data.get("slug", "")
                        
                        # Check URL safety
                        is_url_safe = (
                            '%' not in slug and  # No URL encoding
                            all(ord(c) < 128 for c in slug) and  # ASCII only
                            all(c.isalnum() or c in '-_' for c in slug) and  # Only alphanumeric and hyphens/underscores
                            not slug.startswith('-') and  # Doesn't start with hyphen
                            not slug.endswith('-') and  # Doesn't end with hyphen
                            '--' not in slug  # No double hyphens
                        )
                        
                        if not is_url_safe:
                            all_url_safe = False
                        
                        results.append(f"'{title}' -> '{slug}' (URL-safe: {is_url_safe})")
                        
                        # Clean up test article
                        article_id = data.get("id")
                        if article_id:
                            await self.session.delete(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers)
                    else:
                        error_data = await response.text()
                        results.append(f"'{title}' -> ERROR {response.status}")
                        all_url_safe = False
            
            details = "URL compatibility results: " + "; ".join(results)
            self.log_result("URL Compatibility", all_url_safe, details)
            return all_url_safe
            
        except Exception as e:
            self.log_result("URL Compatibility", False, f"Exception: {str(e)}")
            return False

    async def test_database_slug_persistence(self):
        """Test that English slugs are properly saved in database"""
        if not self.test_category_id:
            self.log_result("Database Slug Persistence", False, "No valid category ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Create article with Ukrainian title
            title = "Новітні технології штучного інтелекту"
            expected_slug = "novitni-tekhnolohiyi-shtuchnoho-intelektu"
            
            article_data = {
                "title": title,
                "content": "Тестовий контент для перевірки збереження slug в базі даних",
                "category_id": self.test_category_id,
                "tags": ["технології", "ШІ"],
                "status": "published"
            }
            
            # Create article
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Database Slug Persistence", False, f"Failed to create article: {response.status} - {error_data}")
                    return False
                
                data = await response.json()
                article_id = data.get("id")
                created_slug = data.get("slug", "")
                
                if created_slug != expected_slug:
                    self.log_result("Database Slug Persistence", False, f"Created slug '{created_slug}' doesn't match expected '{expected_slug}'")
                    return False
            
            # Retrieve article to verify slug persistence
            async with self.session.get(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Database Slug Persistence", False, f"Failed to retrieve article: {response.status} - {error_data}")
                    return False
                
                data = await response.json()
                retrieved_slug = data.get("slug", "")
                retrieved_title = data.get("title", "")
                
                # Verify slug persistence
                slug_persisted = retrieved_slug == expected_slug
                title_persisted = retrieved_title == title
                
                # Clean up test article
                await self.session.delete(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers)
                
                details = f"Article '{title}' -> slug '{retrieved_slug}' (expected: '{expected_slug}'), Title persisted: {title_persisted}, Slug persisted: {slug_persisted}"
                success = slug_persisted and title_persisted
                
                self.log_result("Database Slug Persistence", success, details)
                return success
            
        except Exception as e:
            self.log_result("Database Slug Persistence", False, f"Exception: {str(e)}")
            return False

    async def test_featured_image_field(self):
        """Test featured_image field handling"""
        if not self.test_article_id:
            self.log_result("Featured Image Field Test", False, "No test article ID available")
            return False
            
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test updating featured_image
            test_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            
            update_data = {
                "featured_image": test_image
            }
            
            async with self.session.put(f"{BACKEND_URL}/api/articles/{self.test_article_id}", json=update_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    updated_image = data.get("featured_image", "")
                    
                    if updated_image == test_image:
                        self.log_result("Featured Image Field Test", True, "Featured image field properly updated and retrieved")
                        return True
                    else:
                        self.log_result("Featured Image Field Test", False, f"Featured image not properly saved. Expected: {test_image[:50]}..., Got: {updated_image[:50]}...")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Featured Image Field Test", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Featured Image Field Test", False, f"Exception: {str(e)}")
            return False

    async def test_database_content_verification(self):
        """Test database content verification by listing all articles"""
        try:
            # Get all articles to verify database content
            async with self.session.get(f"{BACKEND_URL}/api/articles/") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Look for our Ukrainian article
                    ukrainian_article = None
                    for article in data:
                        if "Новітні технології" in article.get("title", ""):
                            ukrainian_article = article
                            break
                    
                    if ukrainian_article:
                        title = ukrainian_article.get("title", "")
                        content = ukrainian_article.get("content", "")
                        slug = ukrainian_article.get("slug", "")
                        status = ukrainian_article.get("status", "")
                        
                        # Verify content is properly stored in database
                        content_in_db = "збереження контенту" in content
                        published_status = status == "published"
                        
                        details = f"Ukrainian article found in database - Title: '{title}', Slug: '{slug}', Content preserved: {content_in_db}, Published: {published_status}"
                        
                        if content_in_db:
                            self.log_result("Database Content Verification", True, details)
                            return True
                        else:
                            self.log_result("Database Content Verification", False, f"Content not preserved in database. {details}")
                            return False
                    else:
                        self.log_result("Database Content Verification", False, f"Ukrainian article not found in database. Found {len(data)} articles total.")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Database Content Verification", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Database Content Verification", False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for Ukrainian Article Creation Workflow")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        # Step 1: Authenticate as admin
        if not await self.authenticate_admin():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Step 2: Get categories for testing
        if not await self.test_categories_admin_endpoint():
            print("❌ Cannot proceed without valid category")
            return False
        
        # Step 3: Test English slug generation functionality
        print("\n🔤 ENGLISH SLUG GENERATION TESTS")
        print("-" * 50)
        
        await self.test_english_slug_generation()
        await self.test_slug_uniqueness()
        await self.test_url_compatibility()
        await self.test_database_slug_persistence()
        
        # Step 4: Test Ukrainian article creation workflow
        print("\n🇺🇦 UKRAINIAN ARTICLE WORKFLOW TESTS")
        print("-" * 50)
        
        await self.test_ukrainian_article_creation()
        await self.test_ukrainian_article_retrieval()
        await self.test_featured_image_field()
        await self.test_database_content_verification()
        
        # Step 4: Test basic article operations for comparison
        print("\n📝 BASIC ARTICLE OPERATIONS")
        print("-" * 50)
        
        await self.test_articles_list_endpoint()
        await self.test_create_article()
        await self.test_get_specific_article()
        await self.test_update_article()
        await self.test_delete_article()
        
        # Step 5: Test error handling
        print("\n🔍 ERROR HANDLING TESTS")
        print("-" * 50)
        
        await self.test_error_handling()
        await self.test_invalid_category_id()
        await self.test_authentication_requirements()
        
        # Summary
        print("=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Separate Ukrainian-specific results
        ukrainian_tests = [r for r in self.results if "Ukrainian" in r["test"] or "Featured Image" in r["test"] or "Database Content" in r["test"]]
        ukrainian_passed = sum(1 for r in ukrainian_tests if r["success"])
        
        print(f"\n🇺🇦 Ukrainian Article Tests: {ukrainian_passed}/{len(ukrainian_tests)} passed")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

async def main():
    """Main test runner"""
    async with BackendTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)