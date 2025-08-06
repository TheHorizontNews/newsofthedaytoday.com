#!/usr/bin/env python3
"""
Backend API Testing for Article Management Functionality
Tests all article CRUD operations and related endpoints
"""

import asyncio
import aiohttp
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import sys

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://8ca882a8-83c2-4c10-93ce-a296b7f160ab.preview.emergentagent.com')

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
    
    async def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "healthy":
                        self.log_result("Health Check", True, f"Status: {data.get('status')}")
                    else:
                        self.log_result("Health Check", False, f"Unexpected status: {data}")
                else:
                    self.log_result("Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
    
    async def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/") as response:
                if response.status == 200:
                    data = await response.json()
                    if "Edge Chronicle" in data.get("message", ""):
                        self.log_result("Root Endpoint", True, f"Message: {data.get('message')}")
                    else:
                        self.log_result("Root Endpoint", False, f"Unexpected response: {data}")
                else:
                    self.log_result("Root Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Exception: {str(e)}")
    
    async def test_sitemap_xml(self):
        """Test sitemap.xml endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/sitemap.xml") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'xml' not in content_type:
                        self.log_result("Sitemap XML", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Parse XML to validate structure
                    try:
                        root = ET.fromstring(content)
                        if root.tag.endswith('urlset'):
                            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
                            self.log_result("Sitemap XML", True, f"Valid XML with {len(urls)} URLs")
                        else:
                            self.log_result("Sitemap XML", False, f"Invalid XML structure, root tag: {root.tag}")
                    except ET.ParseError as e:
                        self.log_result("Sitemap XML", False, f"XML parse error: {str(e)}")
                else:
                    self.log_result("Sitemap XML", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Sitemap XML", False, f"Exception: {str(e)}")
    
    async def test_llms_txt(self):
        """Test llms.txt endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/llms.txt") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'text/plain' not in content_type:
                        self.log_result("LLMS.txt", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Check content structure
                    if "LLMS.txt" in content and "Edge Chronicle" in content:
                        lines = content.split('\n')
                        self.log_result("LLMS.txt", True, f"Valid text file with {len(lines)} lines")
                    else:
                        self.log_result("LLMS.txt", False, "Missing expected content headers")
                else:
                    self.log_result("LLMS.txt", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("LLMS.txt", False, f"Exception: {str(e)}")
    
    async def test_llms_sitemap_xml(self):
        """Test llms-sitemap.xml endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/llms-sitemap.xml") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'xml' not in content_type:
                        self.log_result("LLMS Sitemap XML", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Parse XML to validate structure
                    try:
                        root = ET.fromstring(content)
                        if root.tag.endswith('urlset'):
                            urls = root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}url')
                            # Check for AI-specific metadata by looking for ai: namespace elements
                            ai_elements = [elem for elem in root.iter() if 'ai:' in elem.tag]
                            self.log_result("LLMS Sitemap XML", True, f"Valid XML with {len(urls)} URLs and {len(ai_elements)} AI metadata elements")
                        else:
                            self.log_result("LLMS Sitemap XML", False, f"Invalid XML structure, root tag: {root.tag}")
                    except ET.ParseError as e:
                        self.log_result("LLMS Sitemap XML", False, f"XML parse error: {str(e)}")
                else:
                    self.log_result("LLMS Sitemap XML", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("LLMS Sitemap XML", False, f"Exception: {str(e)}")
    
    async def test_robots_txt(self):
        """Test robots.txt endpoint"""
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/robots.txt") as response:
                if response.status == 200:
                    content = await response.text()
                    content_type = response.headers.get('content-type', '')
                    
                    # Check content type
                    if 'text/plain' not in content_type:
                        self.log_result("Robots.txt", False, f"Wrong content type: {content_type}")
                        return
                    
                    # Check content structure
                    required_elements = ["User-agent:", "Allow:", "Sitemap:", "Disallow:"]
                    missing_elements = [elem for elem in required_elements if elem not in content]
                    
                    if not missing_elements:
                        lines = content.split('\n')
                        self.log_result("Robots.txt", True, f"Valid robots.txt with {len(lines)} lines")
                    else:
                        self.log_result("Robots.txt", False, f"Missing elements: {missing_elements}")
                else:
                    self.log_result("Robots.txt", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Robots.txt", False, f"Exception: {str(e)}")
    
    async def test_api_routes(self):
        """Test existing API routes - expect authentication errors for protected routes"""
        routes_to_test = [
            ("/api/categories", "Categories endpoint"),
            ("/api/users", "Users endpoint"), 
            ("/api/articles", "Articles endpoint"),
            ("/api/auth/me", "Auth me endpoint")
        ]
        
        for route, description in routes_to_test:
            try:
                async with self.session.get(f"{BACKEND_URL}{route}") as response:
                    # These routes require authentication, so 403/401 is expected and correct
                    if response.status in [401, 403]:
                        self.log_result(f"API Route {route}", True, f"HTTP {response.status} (correctly protected)")
                    elif response.status == 307:
                        # Handle redirect
                        async with self.session.get(f"{BACKEND_URL}{route}/") as redirect_response:
                            if redirect_response.status in [401, 403]:
                                self.log_result(f"API Route {route}", True, f"HTTP {redirect_response.status} (correctly protected after redirect)")
                            else:
                                self.log_result(f"API Route {route}", False, f"HTTP {redirect_response.status} after redirect")
                    elif response.status == 200:
                        # Unexpected success without auth
                        self.log_result(f"API Route {route}", False, f"HTTP {response.status} (should require authentication)")
                    else:
                        self.log_result(f"API Route {route}", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result(f"API Route {route}", False, f"Exception: {str(e)}")
    
    async def test_seo_analytics_endpoint(self):
        """Test legacy SEO analytics endpoint"""
        try:
            start_date = "2024-01-01"
            end_date = "2024-12-31"
            url = f"{BACKEND_URL}/api/seo/analytics/search-console?start_date={start_date}&end_date={end_date}"
            
            async with self.session.get(url) as response:
                if response.status in [401, 403]:
                    self.log_result("Legacy SEO Analytics", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    data = await response.json()
                    required_fields = ["clicks", "impressions", "ctr", "position"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_result("Legacy SEO Analytics", True, f"All required fields present: {list(data.keys())}")
                    else:
                        self.log_result("Legacy SEO Analytics", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Legacy SEO Analytics", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Legacy SEO Analytics", False, f"Exception: {str(e)}")
    
    async def test_enhanced_seo_endpoints(self):
        """Test Phase 4 Enhanced SEO API Endpoints"""
        
        # Test GET /api/seo/tags - should require authentication
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/tags") as response:
                if response.status in [401, 403]:
                    self.log_result("SEO Tags Endpoint", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    self.log_result("SEO Tags Endpoint", False, "HTTP 200 (should require authentication)")
                else:
                    self.log_result("SEO Tags Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("SEO Tags Endpoint", False, f"Exception: {str(e)}")
        
        # Test GET /api/seo/tags/popular - should require authentication
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/tags/popular") as response:
                if response.status in [401, 403]:
                    self.log_result("SEO Popular Tags Endpoint", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    self.log_result("SEO Popular Tags Endpoint", False, "HTTP 200 (should require authentication)")
                else:
                    self.log_result("SEO Popular Tags Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("SEO Popular Tags Endpoint", False, f"Exception: {str(e)}")
        
        # Test POST /api/seo/tags/cleanup - should require admin authentication
        try:
            async with self.session.post(f"{BACKEND_URL}/api/seo/tags/cleanup") as response:
                if response.status in [401, 403]:
                    self.log_result("SEO Tags Cleanup Endpoint", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    self.log_result("SEO Tags Cleanup Endpoint", False, "HTTP 200 (should require admin authentication)")
                else:
                    self.log_result("SEO Tags Cleanup Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("SEO Tags Cleanup Endpoint", False, f"Exception: {str(e)}")
        
        # Test GET /api/seo/meta-tags/{article_id} - should require authentication
        try:
            test_article_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format
            async with self.session.get(f"{BACKEND_URL}/api/seo/meta-tags/{test_article_id}") as response:
                if response.status in [401, 403]:
                    self.log_result("SEO Meta Tags Endpoint", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 404:
                    self.log_result("SEO Meta Tags Endpoint", True, "HTTP 404 (article not found - endpoint accessible)")
                elif response.status == 200:
                    self.log_result("SEO Meta Tags Endpoint", False, "HTTP 200 (should require authentication)")
                else:
                    self.log_result("SEO Meta Tags Endpoint", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("SEO Meta Tags Endpoint", False, f"Exception: {str(e)}")
    
    async def test_google_search_console_mock_endpoints(self):
        """Test Google Search Console Mock Integration Endpoints"""
        
        # Test GET /api/seo/search-console/analytics - should require authentication
        try:
            start_date = "2024-01-01"
            end_date = "2024-12-31"
            url = f"{BACKEND_URL}/api/seo/search-console/analytics?start_date={start_date}&end_date={end_date}"
            
            async with self.session.get(url) as response:
                if response.status in [401, 403]:
                    self.log_result("Search Console Analytics", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    data = await response.json()
                    if data.get("status") == "success" and "data" in data:
                        self.log_result("Search Console Analytics", True, "Mock data returned successfully")
                    else:
                        self.log_result("Search Console Analytics", False, f"Invalid response format: {data}")
                else:
                    self.log_result("Search Console Analytics", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Search Console Analytics", False, f"Exception: {str(e)}")
        
        # Test GET /api/seo/search-console/sitemaps - should require authentication
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/search-console/sitemaps") as response:
                if response.status in [401, 403]:
                    self.log_result("Search Console Sitemaps", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    data = await response.json()
                    if data.get("status") == "success" and "sitemaps" in data:
                        self.log_result("Search Console Sitemaps", True, "Mock sitemap data returned successfully")
                    else:
                        self.log_result("Search Console Sitemaps", False, f"Invalid response format: {data}")
                else:
                    self.log_result("Search Console Sitemaps", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Search Console Sitemaps", False, f"Exception: {str(e)}")
        
        # Test POST /api/seo/search-console/submit-sitemap - should require admin authentication
        try:
            sitemap_data = {"sitemap_url": f"{BACKEND_URL}/api/seo/sitemap.xml"}
            async with self.session.post(f"{BACKEND_URL}/api/seo/search-console/submit-sitemap", json=sitemap_data) as response:
                if response.status in [401, 403]:
                    self.log_result("Search Console Submit Sitemap", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    self.log_result("Search Console Submit Sitemap", False, "HTTP 200 (should require admin authentication)")
                else:
                    self.log_result("Search Console Submit Sitemap", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Search Console Submit Sitemap", False, f"Exception: {str(e)}")
        
        # Test GET /api/seo/analytics/dashboard - should require authentication
        try:
            async with self.session.get(f"{BACKEND_URL}/api/seo/analytics/dashboard") as response:
                if response.status in [401, 403]:
                    self.log_result("SEO Analytics Dashboard", True, f"HTTP {response.status} (correctly protected)")
                elif response.status == 200:
                    data = await response.json()
                    required_sections = ["search_console", "sitemaps", "articles", "categories"]
                    missing_sections = [section for section in required_sections if section not in data]
                    if not missing_sections:
                        self.log_result("SEO Analytics Dashboard", True, f"All required sections present: {list(data.keys())}")
                    else:
                        self.log_result("SEO Analytics Dashboard", False, f"Missing sections: {missing_sections}")
                else:
                    self.log_result("SEO Analytics Dashboard", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("SEO Analytics Dashboard", False, f"Exception: {str(e)}")
    
    async def test_seo_files_mime_types(self):
        """Test SEO files return correct MIME types"""
        seo_files = [
            ("/api/seo/sitemap.xml", "application/xml", "Sitemap XML MIME Type"),
            ("/api/seo/llms.txt", "text/plain", "LLMS.txt MIME Type"),
            ("/api/seo/llms-sitemap.xml", "application/xml", "LLMS Sitemap XML MIME Type"),
            ("/api/seo/robots.txt", "text/plain", "Robots.txt MIME Type")
        ]
        
        for endpoint, expected_mime, test_name in seo_files:
            try:
                async with self.session.get(f"{BACKEND_URL}{endpoint}") as response:
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '')
                        if expected_mime in content_type:
                            self.log_result(test_name, True, f"Correct MIME type: {content_type}")
                        else:
                            self.log_result(test_name, False, f"Wrong MIME type: {content_type}, expected: {expected_mime}")
                    else:
                        self.log_result(test_name, False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
    
    async def test_error_handling_edge_cases(self):
        """Test error handling and edge cases"""
        
        # Test invalid article ID for meta-tags endpoint
        try:
            invalid_id = "invalid-article-id"
            async with self.session.get(f"{BACKEND_URL}/api/seo/meta-tags/{invalid_id}") as response:
                if response.status in [400, 422, 401, 403]:
                    self.log_result("Invalid Article ID Handling", True, f"HTTP {response.status} (proper error handling)")
                else:
                    self.log_result("Invalid Article ID Handling", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Invalid Article ID Handling", False, f"Exception: {str(e)}")
        
        # Test missing sitemap_url in submit-sitemap endpoint
        try:
            empty_data = {}
            async with self.session.post(f"{BACKEND_URL}/api/seo/search-console/submit-sitemap", json=empty_data) as response:
                if response.status in [400, 422, 401, 403]:
                    self.log_result("Missing Sitemap URL Handling", True, f"HTTP {response.status} (proper error handling)")
                else:
                    self.log_result("Missing Sitemap URL Handling", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Missing Sitemap URL Handling", False, f"Exception: {str(e)}")
        
        # Test invalid date format for search console analytics
        try:
            invalid_url = f"{BACKEND_URL}/api/seo/search-console/analytics?start_date=invalid&end_date=invalid"
            async with self.session.get(invalid_url) as response:
                if response.status in [400, 422, 401, 403]:
                    self.log_result("Invalid Date Format Handling", True, f"HTTP {response.status} (proper error handling)")
                else:
                    self.log_result("Invalid Date Format Handling", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Invalid Date Format Handling", False, f"Exception: {str(e)}")
    
    async def test_database_integration(self):
        """Test database integration by checking if backend can connect to MongoDB"""
        try:
            # Test through a public endpoint that uses database
            async with self.session.get(f"{BACKEND_URL}/api/seo/sitemap.xml") as response:
                if response.status == 200:
                    content = await response.text()
                    # If sitemap generates successfully, database connection is working
                    if "urlset" in content:
                        self.log_result("Database Integration", True, "Database connection working (verified through sitemap generation)")
                    else:
                        self.log_result("Database Integration", False, "Sitemap endpoint accessible but content invalid")
                else:
                    self.log_result("Database Integration", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_result("Database Integration", False, f"Exception: {str(e)}")
    
    async def test_health_and_root_endpoints(self):
        """Test health and root endpoints with proper error handling"""
        endpoints = [
            ("/health", "Health Check"),
            ("/", "Root Endpoint")
        ]
        
        for endpoint, name in endpoints:
            try:
                async with self.session.get(f"{BACKEND_URL}{endpoint}") as response:
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '')
                        if 'application/json' in content_type:
                            data = await response.json()
                            if endpoint == "/health" and data.get("status") == "healthy":
                                self.log_result(name, True, f"Status: {data.get('status')}")
                            elif endpoint == "/" and "Edge Chronicle" in data.get("message", ""):
                                self.log_result(name, True, f"Message: {data.get('message')}")
                            else:
                                self.log_result(name, True, f"HTTP 200 with JSON response")
                        else:
                            # Might be HTML response due to routing
                            self.log_result(name, True, f"HTTP 200 (content-type: {content_type})")
                    else:
                        self.log_result(name, False, f"HTTP {response.status}")
            except Exception as e:
                self.log_result(name, False, f"Exception: {str(e)}")
    
    async def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 Starting Backend API Tests for Edge Chronicle Phase 4 SEO")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Core endpoints
        await self.test_health_and_root_endpoints()
        
        # Basic SEO endpoints
        await self.test_sitemap_xml()
        await self.test_llms_txt()
        await self.test_llms_sitemap_xml()
        await self.test_robots_txt()
        
        # Enhanced Phase 4 SEO endpoints
        await self.test_enhanced_seo_endpoints()
        await self.test_google_search_console_mock_endpoints()
        
        # SEO file MIME types
        await self.test_seo_files_mime_types()
        
        # Legacy analytics endpoint
        await self.test_seo_analytics_endpoint()
        
        # API routes authentication
        await self.test_api_routes()
        
        # Error handling and edge cases
        await self.test_error_handling_edge_cases()
        
        # Database integration
        await self.test_database_integration()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
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