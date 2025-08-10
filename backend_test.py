#!/usr/bin/env python3
"""
Backend API Testing for Category Loading Issue in Article Editor
Tests category endpoints and data structure to debug publish button issue
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import os
import sys
import uuid

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://d13e79a9-491f-48ad-9444-63d6326a4a5a.preview.emergentagent.com')

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
                    "expected": "shtuchnyyi-intelekt-revolyutsiyinyyi-proryv"
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

    async def test_new_slug_endpoint_basic(self):
        """Test the new GET /api/articles/slug/{slug} endpoint with basic functionality"""
        try:
            # First, create a published article to test with
            if not self.test_category_id:
                self.log_result("New Slug Endpoint Basic", False, "No valid category ID available")
                return False
                
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Create a published article
            article_data = {
                "title": "Тестова стаття для slug endpoint",
                "subtitle": "Перевірка нового публічного endpoint",
                "content": "Це тестовий контент для перевірки нового endpoint /api/articles/slug/{slug}. Контент має бути доступний без автентифікації.",
                "category_id": self.test_category_id,
                "tags": ["тест", "slug", "endpoint"],
                "status": "published",
                "seo_title": "Тестова стаття SEO",
                "seo_description": "Опис для тестової статті"
            }
            
            # Create the article
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("New Slug Endpoint Basic", False, f"Failed to create test article: {response.status} - {error_data}")
                    return False
                
                created_article = await response.json()
                test_slug = created_article.get("slug")
                test_article_id = created_article.get("id")
                
                if not test_slug:
                    self.log_result("New Slug Endpoint Basic", False, "No slug returned from article creation")
                    return False
            
            # Test the new slug endpoint WITHOUT authentication
            async with self.session.get(f"{BACKEND_URL}/api/articles/slug/{test_slug}") as response:
                if response.status == 200:
                    article = await response.json()
                    
                    # Verify article structure and content
                    title_correct = article.get("title") == article_data["title"]
                    content_correct = article_data["content"] in article.get("content", "")
                    status_published = article.get("status") == "published"
                    has_author = "author" in article and article["author"] is not None
                    has_category = "category" in article and article["category"] is not None
                    slug_correct = article.get("slug") == test_slug
                    
                    # Check if views were incremented (should be at least 1)
                    views_incremented = article.get("views", 0) >= 1
                    
                    details = f"Slug endpoint working - Title: {title_correct}, Content: {content_correct}, Status: {status_published}, Author: {has_author}, Category: {has_category}, Slug: {slug_correct}, Views incremented: {views_incremented}"
                    
                    success = all([title_correct, content_correct, status_published, has_author, has_category, slug_correct, views_incremented])
                    
                    # Clean up test article
                    if test_article_id:
                        await self.session.delete(f"{BACKEND_URL}/api/articles/{test_article_id}", headers=headers)
                    
                    self.log_result("New Slug Endpoint Basic", success, details)
                    return success
                else:
                    error_data = await response.text()
                    # Clean up test article
                    if test_article_id:
                        await self.session.delete(f"{BACKEND_URL}/api/articles/{test_article_id}", headers=headers)
                    
                    self.log_result("New Slug Endpoint Basic", False, f"HTTP {response.status}", error_data)
                    return False
                    
        except Exception as e:
            self.log_result("New Slug Endpoint Basic", False, f"Exception: {str(e)}")
            return False

    async def test_slug_endpoint_404_cases(self):
        """Test that slug endpoint returns 404 for non-existent and unpublished articles"""
        try:
            # Test 1: Non-existent slug
            non_existent_slug = "non-existent-article-slug-12345"
            async with self.session.get(f"{BACKEND_URL}/api/articles/slug/{non_existent_slug}") as response:
                if response.status != 404:
                    self.log_result("Slug Endpoint 404 Cases", False, f"Non-existent slug should return 404, got {response.status}")
                    return False
            
            # Test 2: Create draft article and verify it returns 404
            if not self.test_category_id:
                self.log_result("Slug Endpoint 404 Cases", False, "No valid category ID available")
                return False
                
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Create a draft (unpublished) article
            draft_article_data = {
                "title": "Чернетка статті для тестування",
                "content": "Цей контент не повинен бути доступний через slug endpoint",
                "category_id": self.test_category_id,
                "tags": ["чернетка"],
                "status": "draft"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=draft_article_data, headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Slug Endpoint 404 Cases", False, f"Failed to create draft article: {response.status} - {error_data}")
                    return False
                
                draft_article = await response.json()
                draft_slug = draft_article.get("slug")
                draft_article_id = draft_article.get("id")
                
                if not draft_slug:
                    self.log_result("Slug Endpoint 404 Cases", False, "No slug returned from draft article creation")
                    return False
            
            # Test that draft article returns 404 via slug endpoint
            async with self.session.get(f"{BACKEND_URL}/api/articles/slug/{draft_slug}") as response:
                if response.status != 404:
                    # Clean up
                    if draft_article_id:
                        await self.session.delete(f"{BACKEND_URL}/api/articles/{draft_article_id}", headers=headers)
                    
                    self.log_result("Slug Endpoint 404 Cases", False, f"Draft article should return 404, got {response.status}")
                    return False
            
            # Clean up draft article
            if draft_article_id:
                await self.session.delete(f"{BACKEND_URL}/api/articles/{draft_article_id}", headers=headers)
            
            self.log_result("Slug Endpoint 404 Cases", True, "Both non-existent and draft articles correctly return 404")
            return True
            
        except Exception as e:
            self.log_result("Slug Endpoint 404 Cases", False, f"Exception: {str(e)}")
            return False

    async def test_slug_endpoint_no_auth_required(self):
        """Test that slug endpoint works without authentication"""
        try:
            # First create a published article
            if not self.test_category_id:
                self.log_result("Slug Endpoint No Auth", False, "No valid category ID available")
                return False
                
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            article_data = {
                "title": "Публічна стаття без автентифікації",
                "content": "Цей контент має бути доступний без логіну",
                "category_id": self.test_category_id,
                "tags": ["публічний", "доступ"],
                "status": "published"
            }
            
            # Create article with auth
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Slug Endpoint No Auth", False, f"Failed to create article: {response.status} - {error_data}")
                    return False
                
                article = await response.json()
                test_slug = article.get("slug")
                test_article_id = article.get("id")
            
            # Test access WITHOUT any authentication headers
            async with self.session.get(f"{BACKEND_URL}/api/articles/slug/{test_slug}") as response:
                if response.status == 200:
                    article_data = await response.json()
                    content_accessible = "без логіну" in article_data.get("content", "")
                    
                    # Clean up
                    if test_article_id:
                        await self.session.delete(f"{BACKEND_URL}/api/articles/{test_article_id}", headers=headers)
                    
                    if content_accessible:
                        self.log_result("Slug Endpoint No Auth", True, "Article accessible without authentication")
                        return True
                    else:
                        self.log_result("Slug Endpoint No Auth", False, "Article content not properly returned")
                        return False
                else:
                    error_data = await response.text()
                    # Clean up
                    if test_article_id:
                        await self.session.delete(f"{BACKEND_URL}/api/articles/{test_article_id}", headers=headers)
                    
                    self.log_result("Slug Endpoint No Auth", False, f"HTTP {response.status} - should be accessible without auth", error_data)
                    return False
                    
        except Exception as e:
            self.log_result("Slug Endpoint No Auth", False, f"Exception: {str(e)}")
            return False

    async def test_slug_endpoint_view_count_increment(self):
        """Test that slug endpoint increments view count"""
        try:
            # Create a published article
            if not self.test_category_id:
                self.log_result("Slug Endpoint View Count", False, "No valid category ID available")
                return False
                
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            article_data = {
                "title": "Стаття для тестування лічильника переглядів",
                "content": "Перегляди мають збільшуватися при кожному запиті",
                "category_id": self.test_category_id,
                "tags": ["перегляди"],
                "status": "published"
            }
            
            # Create article
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Slug Endpoint View Count", False, f"Failed to create article: {response.status} - {error_data}")
                    return False
                
                article = await response.json()
                test_slug = article.get("slug")
                test_article_id = article.get("id")
                initial_views = article.get("views", 0)
            
            # Make multiple requests and check view count increment
            view_counts = []
            for i in range(3):
                async with self.session.get(f"{BACKEND_URL}/api/articles/slug/{test_slug}") as response:
                    if response.status == 200:
                        article_data = await response.json()
                        view_counts.append(article_data.get("views", 0))
                    else:
                        # Clean up and fail
                        if test_article_id:
                            await self.session.delete(f"{BACKEND_URL}/api/articles/{test_article_id}", headers=headers)
                        
                        self.log_result("Slug Endpoint View Count", False, f"Request {i+1} failed with status {response.status}")
                        return False
            
            # Clean up
            if test_article_id:
                await self.session.delete(f"{BACKEND_URL}/api/articles/{test_article_id}", headers=headers)
            
            # Verify view counts are incrementing
            views_incrementing = all(view_counts[i] < view_counts[i+1] for i in range(len(view_counts)-1))
            expected_final_views = initial_views + 3
            final_views_correct = view_counts[-1] == expected_final_views
            
            details = f"View counts: {view_counts}, Incrementing: {views_incrementing}, Final count correct: {final_views_correct}"
            success = views_incrementing and final_views_correct
            
            self.log_result("Slug Endpoint View Count", success, details)
            return success
            
        except Exception as e:
            self.log_result("Slug Endpoint View Count", False, f"Exception: {str(e)}")
            return False

    async def test_slug_endpoint_with_existing_articles(self):
        """Test slug endpoint with existing articles in database"""
        try:
            # Get all published articles
            async with self.session.get(f"{BACKEND_URL}/api/articles/?status=published") as response:
                if response.status != 200:
                    self.log_result("Slug Endpoint Existing Articles", False, f"Failed to get published articles: {response.status}")
                    return False
                
                published_articles = await response.json()
                
                if not published_articles:
                    self.log_result("Slug Endpoint Existing Articles", True, "No existing published articles to test with")
                    return True
                
                # Test first few published articles
                tested_count = 0
                successful_tests = 0
                
                for article in published_articles[:3]:  # Test up to 3 existing articles
                    slug = article.get("slug")
                    if not slug:
                        continue
                        
                    tested_count += 1
                    
                    # Test slug endpoint
                    async with self.session.get(f"{BACKEND_URL}/api/articles/slug/{slug}") as slug_response:
                        if slug_response.status == 200:
                            slug_article = await slug_response.json()
                            
                            # Verify article data matches
                            title_matches = slug_article.get("title") == article.get("title")
                            id_matches = slug_article.get("id") == article.get("id")
                            status_published = slug_article.get("status") == "published"
                            has_proper_structure = all(key in slug_article for key in ["author", "category", "content"])
                            
                            if all([title_matches, id_matches, status_published, has_proper_structure]):
                                successful_tests += 1
                
                success = tested_count > 0 and successful_tests == tested_count
                details = f"Tested {tested_count} existing articles, {successful_tests} successful"
                
                self.log_result("Slug Endpoint Existing Articles", success, details)
                return success
                
        except Exception as e:
            self.log_result("Slug Endpoint Existing Articles", False, f"Exception: {str(e)}")
            return False

    # ========================================
    # HOMEPAGE EDITOR FUNCTIONALITY TESTS
    # ========================================

    async def test_homepage_config_get_authenticated(self):
        """Test GET /api/homepage/config (authenticated) - should return homepage configuration"""
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/homepage/config", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify structure
                    has_blocks = "blocks" in data
                    blocks = data.get("blocks", [])
                    
                    # Check for expected blocks
                    expected_block_ids = {"hero", "main", "sidebar", "trending", "featured"}
                    actual_block_ids = {block.get("id") for block in blocks}
                    has_all_blocks = expected_block_ids.issubset(actual_block_ids)
                    
                    # Check block structure
                    valid_block_structure = True
                    max_articles_correct = True
                    
                    for block in blocks:
                        if not all(key in block for key in ["id", "name", "articles", "maxArticles"]):
                            valid_block_structure = False
                            break
                        
                        # Check maxArticles values
                        block_id = block.get("id")
                        max_articles = block.get("maxArticles")
                        expected_max = {
                            "hero": 1, "main": 3, "sidebar": 5, "trending": 4, "featured": 6
                        }.get(block_id)
                        
                        if expected_max and max_articles != expected_max:
                            max_articles_correct = False
                    
                    details = f"Blocks present: {has_blocks}, All expected blocks: {has_all_blocks}, Valid structure: {valid_block_structure}, Max articles correct: {max_articles_correct}"
                    success = has_blocks and has_all_blocks and valid_block_structure and max_articles_correct
                    
                    self.log_result("Homepage Config GET (Authenticated)", success, details)
                    return success
                else:
                    error_data = await response.text()
                    self.log_result("Homepage Config GET (Authenticated)", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Homepage Config GET (Authenticated)", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_config_get_unauthenticated(self):
        """Test GET /api/homepage/config without authentication - should return 403"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/homepage/config") as response:
                if response.status in [401, 403]:
                    self.log_result("Homepage Config GET (Unauthenticated)", True, f"Properly protected - HTTP {response.status}")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Homepage Config GET (Unauthenticated)", False, f"Should require authentication - HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Homepage Config GET (Unauthenticated)", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_config_put_authenticated(self):
        """Test PUT /api/homepage/config (authenticated) - should save homepage configuration"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Create test configuration with mock article data
            test_config = {
                "blocks": [
                    {
                        "id": "hero",
                        "name": "Hero Section",
                        "articles": [
                            {
                                "id": "test-hero-article-1",
                                "title": "Breaking: Revolutionary AI Discovery",
                                "subtitle": "Scientists achieve quantum breakthrough",
                                "category": {"id": "tech", "name": "Technology"},
                                "featured_image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A",
                                "slug": "revolutionary-ai-discovery",
                                "views": 1250
                            }
                        ],
                        "maxArticles": 1
                    },
                    {
                        "id": "main",
                        "name": "Main News",
                        "articles": [
                            {
                                "id": "test-main-article-1",
                                "title": "Climate Change Solutions",
                                "subtitle": "New renewable energy breakthrough",
                                "category": {"id": "environment", "name": "Environment"},
                                "featured_image": None,
                                "slug": "climate-change-solutions",
                                "views": 890
                            },
                            {
                                "id": "test-main-article-2", 
                                "title": "Space Exploration Update",
                                "subtitle": "Mars mission progress report",
                                "category": {"id": "space", "name": "Space"},
                                "featured_image": None,
                                "slug": "space-exploration-update",
                                "views": 675
                            }
                        ],
                        "maxArticles": 3
                    },
                    {
                        "id": "sidebar",
                        "name": "Sidebar News",
                        "articles": [],
                        "maxArticles": 5
                    },
                    {
                        "id": "trending",
                        "name": "Trending",
                        "articles": [
                            {
                                "id": "test-trending-article-1",
                                "title": "Viral Science Discovery",
                                "subtitle": "Research goes viral on social media",
                                "category": {"id": "biology", "name": "Biology"},
                                "featured_image": None,
                                "slug": "viral-science-discovery",
                                "views": 2340
                            }
                        ],
                        "maxArticles": 4
                    },
                    {
                        "id": "featured",
                        "name": "Featured Articles",
                        "articles": [],
                        "maxArticles": 6
                    }
                ]
            }
            
            async with self.session.put(f"{BACKEND_URL}/api/homepage/config", json=test_config, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    success_message = "successfully" in data.get("message", "").lower()
                    
                    if success_message:
                        self.log_result("Homepage Config PUT (Authenticated)", True, "Configuration saved successfully")
                        return True
                    else:
                        self.log_result("Homepage Config PUT (Authenticated)", False, f"Unexpected response: {data}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Homepage Config PUT (Authenticated)", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Homepage Config PUT (Authenticated)", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_config_put_unauthenticated(self):
        """Test PUT /api/homepage/config without authentication - should return 403"""
        try:
            test_config = {
                "blocks": [
                    {
                        "id": "hero",
                        "name": "Hero Section", 
                        "articles": [],
                        "maxArticles": 1
                    }
                ]
            }
            
            async with self.session.put(f"{BACKEND_URL}/api/homepage/config", json=test_config) as response:
                if response.status in [401, 403]:
                    self.log_result("Homepage Config PUT (Unauthenticated)", True, f"Properly protected - HTTP {response.status}")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Homepage Config PUT (Unauthenticated)", False, f"Should require authentication - HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Homepage Config PUT (Unauthenticated)", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_public_endpoint(self):
        """Test GET /api/homepage/public (no auth) - should return homepage configuration for public display"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/homepage/public") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Should have blocks structure
                    has_blocks = "blocks" in data
                    blocks = data.get("blocks", [])
                    
                    # If we saved config earlier, it should be returned
                    # If no config exists, should return empty blocks array
                    valid_response = isinstance(blocks, list)
                    
                    details = f"Has blocks: {has_blocks}, Valid response: {valid_response}, Blocks count: {len(blocks)}"
                    success = has_blocks and valid_response
                    
                    self.log_result("Homepage Public Endpoint", success, details)
                    return success
                else:
                    error_data = await response.text()
                    self.log_result("Homepage Public Endpoint", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Homepage Public Endpoint", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_config_persistence(self):
        """Test that saved homepage configuration persists and can be retrieved"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Save a specific configuration
            unique_title = f"Test Persistence Article {datetime.now().strftime('%H%M%S')}"
            test_config = {
                "blocks": [
                    {
                        "id": "hero",
                        "name": "Hero Section",
                        "articles": [
                            {
                                "id": "persistence-test-article",
                                "title": unique_title,
                                "subtitle": "Testing configuration persistence",
                                "category": {"id": "test", "name": "Test Category"},
                                "featured_image": None,
                                "slug": "test-persistence-article",
                                "views": 42
                            }
                        ],
                        "maxArticles": 1
                    },
                    {
                        "id": "main",
                        "name": "Main News",
                        "articles": [],
                        "maxArticles": 3
                    }
                ]
            }
            
            # Save configuration
            async with self.session.put(f"{BACKEND_URL}/api/homepage/config", json=test_config, headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Homepage Config Persistence", False, f"Failed to save config: {response.status} - {error_data}")
                    return False
            
            # Retrieve configuration via authenticated endpoint
            async with self.session.get(f"{BACKEND_URL}/api/homepage/config", headers=headers) as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Homepage Config Persistence", False, f"Failed to retrieve config: {response.status} - {error_data}")
                    return False
                
                auth_data = await response.json()
                
                # Check if our test data is present
                hero_block = None
                for block in auth_data.get("blocks", []):
                    if block.get("id") == "hero":
                        hero_block = block
                        break
                
                if not hero_block:
                    self.log_result("Homepage Config Persistence", False, "Hero block not found in retrieved config")
                    return False
                
                hero_articles = hero_block.get("articles", [])
                if not hero_articles:
                    self.log_result("Homepage Config Persistence", False, "No articles found in hero block")
                    return False
                
                saved_title = hero_articles[0].get("title", "")
                title_matches = saved_title == unique_title
                
                if not title_matches:
                    self.log_result("Homepage Config Persistence", False, f"Title mismatch: expected '{unique_title}', got '{saved_title}'")
                    return False
            
            # Retrieve configuration via public endpoint
            async with self.session.get(f"{BACKEND_URL}/api/homepage/public") as response:
                if response.status != 200:
                    error_data = await response.text()
                    self.log_result("Homepage Config Persistence", False, f"Failed to retrieve public config: {response.status} - {error_data}")
                    return False
                
                public_data = await response.json()
                
                # Check if same data is available publicly
                public_hero_block = None
                for block in public_data.get("blocks", []):
                    if block.get("id") == "hero":
                        public_hero_block = block
                        break
                
                public_title_matches = False
                if public_hero_block and public_hero_block.get("articles"):
                    public_saved_title = public_hero_block["articles"][0].get("title", "")
                    public_title_matches = public_saved_title == unique_title
                
                details = f"Auth endpoint title match: {title_matches}, Public endpoint title match: {public_title_matches}"
                success = title_matches and public_title_matches
                
                self.log_result("Homepage Config Persistence", success, details)
                return success
                
        except Exception as e:
            self.log_result("Homepage Config Persistence", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_database_table_creation(self):
        """Test that homepage_config table is created when saving configuration"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Save a minimal configuration to trigger table creation
            minimal_config = {
                "blocks": [
                    {
                        "id": "hero",
                        "name": "Hero Section",
                        "articles": [],
                        "maxArticles": 1
                    }
                ]
            }
            
            async with self.session.put(f"{BACKEND_URL}/api/homepage/config", json=minimal_config, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    success_message = "successfully" in data.get("message", "").lower()
                    
                    # If save was successful, table should have been created
                    if success_message:
                        # Try to retrieve the config to verify table exists and works
                        async with self.session.get(f"{BACKEND_URL}/api/homepage/config", headers=headers) as get_response:
                            if get_response.status == 200:
                                retrieved_data = await get_response.json()
                                has_blocks = "blocks" in retrieved_data
                                
                                self.log_result("Homepage Database Table Creation", has_blocks, f"Table created and functional: {has_blocks}")
                                return has_blocks
                            else:
                                self.log_result("Homepage Database Table Creation", False, f"Failed to retrieve after save: {get_response.status}")
                                return False
                    else:
                        self.log_result("Homepage Database Table Creation", False, f"Save operation failed: {data}")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Homepage Database Table Creation", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Homepage Database Table Creation", False, f"Exception: {str(e)}")
            return False

    async def test_homepage_config_validation(self):
        """Test homepage configuration validation with invalid data"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test with invalid structure (missing required fields)
            invalid_configs = [
                # Missing blocks
                {},
                # Invalid blocks structure
                {"blocks": "not_an_array"},
                # Missing required block fields
                {
                    "blocks": [
                        {
                            "id": "hero"
                            # Missing name, articles, maxArticles
                        }
                    ]
                },
                # Invalid article structure
                {
                    "blocks": [
                        {
                            "id": "hero",
                            "name": "Hero Section",
                            "articles": [
                                {
                                    # Missing required fields like id, title, slug
                                    "invalid": "article"
                                }
                            ],
                            "maxArticles": 1
                        }
                    ]
                }
            ]
            
            validation_results = []
            
            for i, invalid_config in enumerate(invalid_configs):
                async with self.session.put(f"{BACKEND_URL}/api/homepage/config", json=invalid_config, headers=headers) as response:
                    # Should return 422 (validation error) or 400 (bad request)
                    if response.status in [400, 422]:
                        validation_results.append(f"Config {i+1}: Properly rejected ({response.status})")
                    else:
                        validation_results.append(f"Config {i+1}: Should have been rejected but got {response.status}")
            
            # All invalid configs should be rejected
            all_rejected = all("Properly rejected" in result for result in validation_results)
            
            details = "; ".join(validation_results)
            self.log_result("Homepage Config Validation", all_rejected, details)
            return all_rejected
            
        except Exception as e:
            self.log_result("Homepage Config Validation", False, f"Exception: {str(e)}")
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for Article Display Fix")
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
        
        # Step 3: Test NEW SLUG ENDPOINT functionality (main focus)
        print("\n🔗 NEW SLUG ENDPOINT TESTS (MAIN FOCUS)")
        print("-" * 50)
        
        await self.test_new_slug_endpoint_basic()
        await self.test_slug_endpoint_404_cases()
        await self.test_slug_endpoint_no_auth_required()
        await self.test_slug_endpoint_view_count_increment()
        await self.test_slug_endpoint_with_existing_articles()
        
        # Step 4: Test English slug generation functionality
        print("\n🔤 ENGLISH SLUG GENERATION TESTS")
        print("-" * 50)
        
        await self.test_english_slug_generation()
        await self.test_slug_uniqueness()
        await self.test_url_compatibility()
        await self.test_database_slug_persistence()
        
        # Step 5: Test Ukrainian article creation workflow
        print("\n🇺🇦 UKRAINIAN ARTICLE WORKFLOW TESTS")
        print("-" * 50)
        
        await self.test_ukrainian_article_creation()
        await self.test_ukrainian_article_retrieval()
        await self.test_featured_image_field()
        await self.test_database_content_verification()
        
        # Step 6: Test basic article operations for comparison
        print("\n📝 BASIC ARTICLE OPERATIONS")
        print("-" * 50)
        
        await self.test_articles_list_endpoint()
        await self.test_create_article()
        await self.test_get_specific_article()
        await self.test_update_article()
        await self.test_delete_article()
        
        # Step 7: Test error handling
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
        
        # Separate NEW SLUG ENDPOINT results (main focus)
        slug_endpoint_tests = [r for r in self.results if "Slug Endpoint" in r["test"]]
        slug_endpoint_passed = sum(1 for r in slug_endpoint_tests if r["success"])
        
        print(f"\n🔗 NEW Slug Endpoint Tests: {slug_endpoint_passed}/{len(slug_endpoint_tests)} passed")
        
        # Separate English slug generation results
        english_slug_tests = [r for r in self.results if "English Slug" in r["test"] or "Slug Uniqueness" in r["test"] or "URL Compatibility" in r["test"] or "Database Slug" in r["test"]]
        english_slug_passed = sum(1 for r in english_slug_tests if r["success"])
        
        print(f"🔤 English Slug Generation Tests: {english_slug_passed}/{len(english_slug_tests)} passed")
        
        # Separate Ukrainian-specific results
        ukrainian_tests = [r for r in self.results if "Ukrainian" in r["test"] or "Featured Image" in r["test"] or "Database Content" in r["test"]]
        ukrainian_passed = sum(1 for r in ukrainian_tests if r["success"])
        
        print(f"🇺🇦 Ukrainian Article Tests: {ukrainian_passed}/{len(ukrainian_tests)} passed")
        
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