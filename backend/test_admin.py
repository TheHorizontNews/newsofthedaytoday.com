"""
Test admin API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8002"

def test_login():
    """Test login endpoint"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Access Token: {data.get('access_token')[:50]}...")
        return data.get('access_token')
    else:
        print(f"Login Error: {response.text}")
        return None

def test_get_articles(token):
    """Test get articles endpoint"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/articles/", headers=headers)
    
    print(f"Get Articles Status: {response.status_code}")
    if response.status_code == 200:
        articles = response.json()
        print(f"Found {len(articles)} articles")
    else:
        print(f"Get Articles Error: {response.text}")

def test_health():
    """Test health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health Status: {response.status_code}")
    print(f"Health Response: {response.text}")

if __name__ == "__main__":
    print("Testing Admin API...")
    
    # Test health
    test_health()
    
    # Test login
    token = test_login()
    
    if token:
        # Test get articles
        test_get_articles(token)