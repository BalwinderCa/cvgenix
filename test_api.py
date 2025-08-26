#!/usr/bin/env python3
"""
Test script for Resume Builder API endpoints
"""
import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_api_endpoints():
    """Test all available API endpoints"""
    
    print("🚀 Testing Resume Builder API Endpoints")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/profiles/")
        print(f"✅ Server is running (Status: {response.status_code})")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start the Django server first.")
        return
    
    # Test 2: Get authentication token
    print("\n🔐 Testing Authentication...")
    auth_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/token/", json=auth_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data['access']
            print(f"✅ Authentication successful")
            print(f"   Access token: {access_token[:20]}...")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return
    
    # Headers for authenticated requests
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Test 3: Test Profiles API
    print("\n👤 Testing Profiles API...")
    try:
        response = requests.get(f"{BASE_URL}/profiles/", headers=headers)
        print(f"   GET /profiles/ - Status: {response.status_code}")
        
        if response.status_code == 200:
            profiles = response.json()
            if profiles:
                profile_id = profiles[0]['id']
                print(f"   ✅ Found existing profile with ID: {profile_id}")
                
                # Update the existing profile
                profile_data = {
                    "about": "Experienced software developer with 5+ years in web development",
                    "headline": "Senior Full Stack Developer",
                    "phone": "+1234567890",
                    "location": "San Francisco, CA",
                    "website": "https://example.com",
                    "linkedin_url": "https://linkedin.com/in/example",
                    "github_url": "https://github.com/example"
                }
                
                response = requests.patch(f"{BASE_URL}/profiles/{profile_id}/", 
                                       json=profile_data, 
                                       headers=headers)
                print(f"   PATCH /profiles/{profile_id}/ - Status: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"   ✅ Profile updated successfully")
                else:
                    print(f"   ❌ Profile update failed: {response.text}")
            else:
                print(f"   ℹ️  No existing profiles found")
        else:
            print(f"   ❌ Failed to get profiles: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Profiles API error: {e}")
    
    # Test 4: Test Templates API
    print("\n📄 Testing Templates API...")
    try:
        response = requests.get(f"{BASE_URL}/templates/", headers=headers)
        print(f"   GET /templates/ - Status: {response.status_code}")
        
        # Create a test template (admin users can create templates)
        template_data = {
            "name": "Modern Professional",
            "description": "A clean and modern professional template",
            "category": "professional",
            "layout_config": {"sections": ["header", "experience", "education"]},
            "styles": {"colors": {"primary": "#2563eb", "secondary": "#64748b"}},
            "is_premium": False,
            "is_featured": True
        }
        
        response = requests.post(f"{BASE_URL}/templates/", 
                               json=template_data, 
                               headers=headers)
        print(f"   POST /templates/ - Status: {response.status_code}")
        
        if response.status_code == 201:
            template_id = response.json()['id']
            print(f"   ✅ Template created with ID: {template_id}")
        else:
            print(f"   ❌ Template creation failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Templates API error: {e}")
    
    # Test 5: Test Resumes API
    print("\n📝 Testing Resumes API...")
    try:
        response = requests.get(f"{BASE_URL}/resumes/", headers=headers)
        print(f"   GET /resumes/ - Status: {response.status_code}")
        
        # Create a test resume
        resume_data = {
            "title": "Software Developer Resume",
            "description": "My professional resume for software development positions",
            "target_company": "Tech Corp",
            "job_description": "Looking for a senior developer position",
            "export_format": "pdf"
        }
        
        response = requests.post(f"{BASE_URL}/resumes/", 
                               json=resume_data, 
                               headers=headers)
        print(f"   POST /resumes/ - Status: {response.status_code}")
        
        if response.status_code == 201:
            resume_id = response.json()['id']
            print(f"   ✅ Resume created with ID: {resume_id}")
        else:
            print(f"   ❌ Resume creation failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Resumes API error: {e}")
    
    # Test 6: Test Education API
    print("\n🎓 Testing Education API...")
    try:
        education_data = {
            "education": [
                {
                    "institution": "Stanford University",
                    "degree": "Master of Science",
                    "field_of_study": "Computer Science",
                    "start_date": "2020-09-01",
                    "end_date": "2022-06-01",
                    "gpa": "3.8",
                    "description": "Specialized in Machine Learning and AI"
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/profiles/education/bulk_create/", 
                               json=education_data, 
                               headers=headers)
        print(f"   POST /profiles/education/bulk_create/ - Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ Education entries created successfully")
        else:
            print(f"   ❌ Education creation failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Education API error: {e}")
    
    # Test 7: Test Skills API
    print("\n💻 Testing Skills API...")
    try:
        skills_data = {
            "skills": [
                {
                    "name": "Python",
                    "category": "technical",
                    "level": "expert"
                },
                {
                    "name": "JavaScript",
                    "category": "technical", 
                    "level": "advanced"
                },
                {
                    "name": "React",
                    "category": "framework",
                    "level": "advanced"
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/profiles/skills/bulk_create/", 
                               json=skills_data, 
                               headers=headers)
        print(f"   POST /profiles/skills/bulk_create/ - Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ Skills created successfully")
        else:
            print(f"   ❌ Skills creation failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Skills API error: {e}")
    
    # Test 8: Test Profile Completion
    print("\n📊 Testing Profile Completion...")
    try:
        response = requests.get(f"{BASE_URL}/profiles/completion/", headers=headers)
        print(f"   GET /profiles/completion/ - Status: {response.status_code}")
        
        if response.status_code == 200:
            completion_data = response.json()
            print(f"   ✅ Completion percentage: {completion_data['completion_percentage']}%")
            print(f"   ✅ Filled fields: {completion_data['filled_fields']}/{completion_data['total_fields']}")
        else:
            print(f"   ❌ Completion check failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Completion API error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\n📋 Available Endpoints:")
    print("   • GET/PATCH /api/profiles/")
    print("   • GET/POST /api/profiles/education/")
    print("   • GET/POST /api/profiles/experience/")
    print("   • GET/POST /api/profiles/skills/")
    print("   • GET/POST /api/profiles/projects/")
    print("   • GET/POST /api/profiles/certifications/")
    print("   • GET/POST /api/templates/")
    print("   • GET/POST /api/resumes/")
    print("   • GET /api/profiles/completion/")
    print("\n🔗 Admin Interface: http://localhost:8000/admin/")
    print("   Username: admin")
    print("   Password: admin123")

if __name__ == "__main__":
    test_api_endpoints()
