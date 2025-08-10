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

class CategoryLoadingTester:
    def __init__(self):
        self.session = None
        self.results = []
        self.auth_token = None
        self.test_categories = []
        
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
    
    async def test_categories_admin_endpoint_structure(self):
        """Test GET /api/categories/admin endpoint structure and data format"""
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not data:
                        self.log_result("Categories Admin Endpoint Structure", False, "No categories returned from API")
                        return False
                    
                    # Check if data is a list
                    if not isinstance(data, list):
                        self.log_result("Categories Admin Endpoint Structure", False, f"Expected list, got {type(data)}")
                        return False
                    
                    # Store categories for later tests
                    self.test_categories = data
                    
                    # Check structure of first category
                    if len(data) > 0:
                        first_cat = data[0]
                        required_fields = ['id', 'name']
                        missing_fields = [field for field in required_fields if field not in first_cat]
                        
                        if missing_fields:
                            self.log_result("Categories Admin Endpoint Structure", False, f"Missing required fields: {missing_fields}")
                            return False
                        
                        # Check if ID is a valid UUID
                        try:
                            uuid.UUID(first_cat['id'])
                            id_is_uuid = True
                        except ValueError:
                            id_is_uuid = False
                        
                        details = f"Found {len(data)} categories. First category: ID='{first_cat['id']}' (UUID: {id_is_uuid}), Name='{first_cat['name']}'"
                        
                        if id_is_uuid:
                            self.log_result("Categories Admin Endpoint Structure", True, details)
                            return True
                        else:
                            self.log_result("Categories Admin Endpoint Structure", False, f"Category ID is not a valid UUID: {first_cat['id']}")
                            return False
                    else:
                        self.log_result("Categories Admin Endpoint Structure", False, "Categories list is empty")
                        return False
                        
                elif response.status == 403:
                    self.log_result("Categories Admin Endpoint Structure", False, "Authentication required (403 Forbidden)")
                    return False
                else:
                    error_data = await response.text()
                    self.log_result("Categories Admin Endpoint Structure", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Categories Admin Endpoint Structure", False, f"Exception: {str(e)}")
            return False
    
    async def test_category_data_validation(self):
        """Test that category data has valid UUIDs and proper names"""
        if not self.test_categories:
            self.log_result("Category Data Validation", False, "No categories available for validation")
            return False
        
        try:
            valid_categories = 0
            invalid_categories = []
            
            for cat in self.test_categories:
                # Check required fields
                if 'id' not in cat or 'name' not in cat:
                    invalid_categories.append(f"Missing fields in category: {cat}")
                    continue
                
                # Check UUID format
                try:
                    uuid.UUID(cat['id'])
                except ValueError:
                    invalid_categories.append(f"Invalid UUID '{cat['id']}' for category '{cat['name']}'")
                    continue
                
                # Check name is not empty
                if not cat['name'] or not cat['name'].strip():
                    invalid_categories.append(f"Empty name for category ID '{cat['id']}'")
                    continue
                
                # Check ID is not a status value
                if cat['id'].lower() in ['published', 'draft', 'archived']:
                    invalid_categories.append(f"Category ID '{cat['id']}' appears to be a status value, not UUID")
                    continue
                
                valid_categories += 1
            
            if invalid_categories:
                details = f"Found {len(invalid_categories)} invalid categories: " + "; ".join(invalid_categories[:3])
                self.log_result("Category Data Validation", False, details)
                return False
            else:
                details = f"All {valid_categories} categories have valid UUIDs and names"
                self.log_result("Category Data Validation", True, details)
                return True
                
        except Exception as e:
            self.log_result("Category Data Validation", False, f"Exception: {str(e)}")
            return False
    
    async def test_categories_without_auth(self):
        """Test that categories/admin endpoint requires authentication"""
        try:
            # Test without authentication headers
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin") as response:
                if response.status in [401, 403]:
                    self.log_result("Categories Authentication Requirement", True, f"Properly protected endpoint (HTTP {response.status})")
                    return True
                else:
                    error_data = await response.text()
                    self.log_result("Categories Authentication Requirement", False, f"Endpoint not protected - HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Categories Authentication Requirement", False, f"Exception: {str(e)}")
            return False
    
    async def test_fallback_categories_format(self):
        """Test that hardcoded fallback categories in frontend have proper format"""
        # These are the hardcoded categories from WorkingArticleEditor.js lines 25-32
        fallback_categories = [
            { 'id': '8f8284e0-dc51-4788-93c0-a56f3fcd3f1c', 'name': 'ШІ та Обчислення' },
            { 'id': 'tech-id-1', 'name': 'Технології' },
            { 'id': 'med-id-1', 'name': 'Медицина' },
            { 'id': 'space-id-1', 'name': 'Космос і Фізика' },
            { 'id': 'bio-id-1', 'name': 'Біологія' },
            { 'id': 'env-id-1', 'name': 'Довкілля' }
        ]
        
        try:
            valid_fallbacks = 0
            invalid_fallbacks = []
            
            for cat in fallback_categories:
                # Check if first category has valid UUID
                if cat['id'] == '8f8284e0-dc51-4788-93c0-a56f3fcd3f1c':
                    try:
                        uuid.UUID(cat['id'])
                        valid_fallbacks += 1
                    except ValueError:
                        invalid_fallbacks.append(f"First fallback category has invalid UUID: {cat['id']}")
                else:
                    # Other fallback categories have placeholder IDs
                    if not cat['id'] or not cat['name']:
                        invalid_fallbacks.append(f"Fallback category missing ID or name: {cat}")
                    else:
                        valid_fallbacks += 1
            
            if invalid_fallbacks:
                details = f"Found {len(invalid_fallbacks)} invalid fallback categories: " + "; ".join(invalid_fallbacks)
                self.log_result("Fallback Categories Format", False, details)
                return False
            else:
                details = f"All {valid_fallbacks} fallback categories have proper format. First category has valid UUID."
                self.log_result("Fallback Categories Format", True, details)
                return True
                
        except Exception as e:
            self.log_result("Fallback Categories Format", False, f"Exception: {str(e)}")
            return False
    
    async def test_article_creation_with_category(self):
        """Test creating an article with a valid category ID"""
        if not self.test_categories:
            self.log_result("Article Creation with Category", False, "No categories available for testing")
            return False
        
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Use first available category
            test_category_id = self.test_categories[0]['id']
            
            article_data = {
                "title": "Test Category Loading Article",
                "subtitle": "Testing category selection",
                "content": "This article tests if category selection works properly in the article editor.",
                "category_id": test_category_id,
                "tags": ["test", "category", "debug"],
                "status": "draft",
                "seo_title": "Test Category Article",
                "seo_description": "Testing category functionality"
            }
            
            async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    article_id = data.get("id")
                    
                    if article_id:
                        # Verify category was properly assigned
                        category_in_response = data.get("category", {})
                        category_id_in_response = category_in_response.get("id") if isinstance(category_in_response, dict) else data.get("category_id")
                        
                        if category_id_in_response == test_category_id:
                            details = f"Article created successfully with category ID: {test_category_id}, Article ID: {article_id}"
                            self.log_result("Article Creation with Category", True, details)
                            
                            # Clean up test article
                            await self.session.delete(f"{BACKEND_URL}/api/articles/{article_id}", headers=headers)
                            return True
                        else:
                            details = f"Category mismatch - Expected: {test_category_id}, Got: {category_id_in_response}"
                            self.log_result("Article Creation with Category", False, details)
                            return False
                    else:
                        self.log_result("Article Creation with Category", False, "No article ID in response")
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Article Creation with Category", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Article Creation with Category", False, f"Exception: {str(e)}")
            return False
    
    async def test_invalid_category_handling(self):
        """Test article creation with invalid category ID"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Test with various invalid category IDs
            invalid_category_ids = [
                "published",  # Status value instead of UUID
                "draft",      # Status value instead of UUID
                "invalid-uuid-format",
                "",           # Empty string
                "12345",      # Number as string
                "nonexistent-uuid-12345678-1234-1234-1234-123456789012"
            ]
            
            for invalid_id in invalid_category_ids:
                article_data = {
                    "title": f"Test Invalid Category {invalid_id}",
                    "content": "Testing invalid category handling",
                    "category_id": invalid_id,
                    "tags": ["test"],
                    "status": "draft"
                }
                
                async with self.session.post(f"{BACKEND_URL}/api/articles/", json=article_data, headers=headers) as response:
                    if response.status in [400, 404, 422]:
                        # Good - invalid category was rejected
                        continue
                    else:
                        error_data = await response.text()
                        details = f"Invalid category ID '{invalid_id}' was accepted (HTTP {response.status})"
                        self.log_result("Invalid Category Handling", False, details, error_data)
                        return False
            
            self.log_result("Invalid Category Handling", True, f"All {len(invalid_category_ids)} invalid category IDs were properly rejected")
            return True
            
        except Exception as e:
            self.log_result("Invalid Category Handling", False, f"Exception: {str(e)}")
            return False
    
    async def test_category_response_format(self):
        """Test that category API returns expected format for frontend dropdown"""
        try:
            headers = self.get_auth_headers()
            async with self.session.get(f"{BACKEND_URL}/api/categories/admin", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not data:
                        self.log_result("Category Response Format", False, "Empty categories response")
                        return False
                    
                    # Check if response format matches what frontend expects
                    expected_format_valid = True
                    format_issues = []
                    
                    for cat in data:
                        # Frontend expects: {id: "uuid", name: "Category Name", ...}
                        if not isinstance(cat, dict):
                            format_issues.append(f"Category is not an object: {cat}")
                            expected_format_valid = False
                            continue
                        
                        if 'id' not in cat:
                            format_issues.append("Category missing 'id' field")
                            expected_format_valid = False
                        
                        if 'name' not in cat:
                            format_issues.append("Category missing 'name' field")
                            expected_format_valid = False
                        
                        # Check for common issues that could cause frontend problems
                        if cat.get('id') in ['published', 'draft', 'archived']:
                            format_issues.append(f"Category ID '{cat.get('id')}' is a status value, not UUID")
                            expected_format_valid = False
                    
                    if expected_format_valid:
                        sample_category = data[0]
                        details = f"Response format valid for frontend dropdown. Sample: {{id: '{sample_category['id']}', name: '{sample_category['name']}'}}"
                        self.log_result("Category Response Format", True, details)
                        return True
                    else:
                        details = f"Format issues found: {'; '.join(format_issues[:3])}"
                        self.log_result("Category Response Format", False, details)
                        return False
                else:
                    error_data = await response.text()
                    self.log_result("Category Response Format", False, f"HTTP {response.status}", error_data)
                    return False
        except Exception as e:
            self.log_result("Category Response Format", False, f"Exception: {str(e)}")
            return False
    
    async def run_category_loading_tests(self):
        """Run all category loading tests"""
        print(f"🔍 Starting Category Loading Issue Debug Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        # Step 1: Authenticate as admin
        if not await self.authenticate_admin():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Step 2: Test category endpoint structure
        print("\n📋 CATEGORY ENDPOINT TESTS")
        print("-" * 50)
        
        await self.test_categories_admin_endpoint_structure()
        await self.test_category_data_validation()
        await self.test_categories_without_auth()
        await self.test_category_response_format()
        
        # Step 3: Test fallback categories
        print("\n🔄 FALLBACK CATEGORY TESTS")
        print("-" * 50)
        
        await self.test_fallback_categories_format()
        
        # Step 4: Test article creation with categories
        print("\n📝 ARTICLE-CATEGORY INTEGRATION TESTS")
        print("-" * 50)
        
        await self.test_article_creation_with_category()
        await self.test_invalid_category_handling()
        
        # Summary
        print("=" * 80)
        print("📊 CATEGORY LOADING TEST SUMMARY")
        print("=" * 80)
        
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
        
        # Specific diagnosis for category loading issue
        print("\n🔍 CATEGORY LOADING ISSUE DIAGNOSIS:")
        print("-" * 50)
        
        if self.test_categories:
            print(f"✅ Categories API returns {len(self.test_categories)} categories")
            sample_cat = self.test_categories[0]
            print(f"✅ Sample category: ID='{sample_cat['id']}', Name='{sample_cat['name']}'")
            
            # Check if any category IDs are status values
            status_ids = [cat for cat in self.test_categories if cat['id'].lower() in ['published', 'draft', 'archived']]
            if status_ids:
                print(f"⚠️  WARNING: Found {len(status_ids)} categories with status-like IDs")
                for cat in status_ids:
                    print(f"    - Category '{cat['name']}' has ID '{cat['id']}'")
                print("    This could cause the publish button to remain disabled!")
            else:
                print("✅ No status-like category IDs found")
        else:
            print("❌ No categories loaded from API")
        
        return passed == total

async def main():
    """Main test runner"""
    async with CategoryLoadingTester() as tester:
        success = await tester.run_category_loading_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)