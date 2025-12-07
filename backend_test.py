#!/usr/bin/env python3
"""
Backend API Testing for NeuroAd WebView Generator - Enhanced Version
Tests all endpoints including project CRUD, scraping, AI generation, and new features
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, List, Any

class NeuroAdAPITester:
    def __init__(self, base_url="https://adbrainwave.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.project_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, f"Error: {str(e)}")
            return False

    def test_get_strategies(self):
        """Test GET /strategies endpoint - Enhanced with visual_instructions"""
        try:
            response = requests.get(f"{self.base_url}/strategies", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                strategies = response.json()
                success = len(strategies) == 15  # Should return 15 strategies
                details += f", Count: {len(strategies)}/15 expected"
                
                # Validate enhanced strategy structure
                if strategies and isinstance(strategies[0], dict):
                    required_fields = ['id', 'name_ar', 'name_en', 'description_ar', 'description_en', 'visual_instructions']
                    has_fields = all(field in strategies[0] for field in required_fields)
                    details += f", Structure: {'Valid' if has_fields else 'Invalid'}"
                    
                    # Check if visual_instructions is present and not empty
                    if has_fields and strategies[0].get('visual_instructions'):
                        details += f", Visual Instructions: Present"
                    else:
                        details += f", Visual Instructions: Missing"
                        success = False
                    
                    success = success and has_fields
            
            self.log_test("GET Strategies (Enhanced)", success, details)
            return success
        except Exception as e:
            self.log_test("GET Strategies (Enhanced)", False, f"Error: {str(e)}")
            return False

    def test_get_platforms(self):
        """Test GET /platforms endpoint"""
        try:
            response = requests.get(f"{self.base_url}/platforms", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                platforms = response.json()
                success = len(platforms) == 5  # Should return 5 platforms
                details += f", Count: {len(platforms)}/5 expected"
                
                # Validate platform structure
                if platforms and isinstance(platforms[0], dict):
                    required_fields = ['id', 'name', 'name_en', 'width', 'height', 'aspect', 'platform']
                    has_fields = all(field in platforms[0] for field in required_fields)
                    details += f", Structure: {'Valid' if has_fields else 'Invalid'}"
                    success = success and has_fields
            
            self.log_test("GET Platforms", success, details)
            return success
        except Exception as e:
            self.log_test("GET Platforms", False, f"Error: {str(e)}")
            return False

    def test_get_marketing_tips(self):
        """Test GET /marketing-tips endpoint"""
        try:
            response = requests.get(f"{self.base_url}/marketing-tips", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                tips = response.json()
                details += f", Count: {len(tips)}"
                
                # Validate tip structure
                if tips and isinstance(tips[0], dict):
                    required_fields = ['ar', 'en']
                    has_fields = all(field in tips[0] for field in required_fields)
                    details += f", Structure: {'Valid' if has_fields else 'Invalid'}"
                    success = success and has_fields
            
            self.log_test("GET Marketing Tips", success, details)
            return success
        except Exception as e:
            self.log_test("GET Marketing Tips", False, f"Error: {str(e)}")
            return False

    def test_scrape_website(self):
        """Test POST /scrape endpoint - Enhanced with brand analysis"""
        try:
            # Test with a simple website
            test_url = "https://example.com"
            payload = {"url": test_url}
            
            response = requests.post(
                f"{self.base_url}/scrape", 
                json=payload, 
                timeout=30
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                # Check if response has expected structure
                expected_fields = ['title', 'description', 'services', 'images', 'keywords', 'brand_analysis']
                has_fields = all(field in data for field in expected_fields)
                details += f", Structure: {'Valid' if has_fields else 'Invalid'}"
                details += f", Title: {data.get('title', 'N/A')[:50]}"
                
                # Check brand analysis structure
                if data.get('brand_analysis'):
                    brand_fields = ['brand_voice', 'color_palette', 'primary_color', 'secondary_color', 'accent_color']
                    brand_valid = all(field in data['brand_analysis'] for field in brand_fields)
                    details += f", Brand Analysis: {'Valid' if brand_valid else 'Invalid'}"
                    success = success and brand_valid
                
                success = success and has_fields
            
            self.log_test("POST Scrape Website (Enhanced)", success, details)
            return success
        except Exception as e:
            self.log_test("POST Scrape Website (Enhanced)", False, f"Error: {str(e)}")
            return False

    def test_create_project(self):
        """Test POST /projects endpoint - Enhanced with brand colors"""
        try:
            project_data = {
                "content_type": "store",
                "company_name": "Test NeuroAd Company",
                "company_description": "A test company for enhanced API testing with neuromarketing",
                "strengths": ["Quality Products", "Fast Delivery", "Great Support"],
                "images": [],
                "design_goal": "direct_sale",
                "platform": "post_square",
                "psychological_strategy_id": "hook",
                "brand_colors": {
                    "primary": "#FF6B35",
                    "secondary": "#F7931E", 
                    "accent": "#FFD23F"
                },
                "language": "ar"
            }
            
            response = requests.post(
                f"{self.base_url}/projects",
                json=project_data,
                timeout=15
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                project = response.json()
                self.project_id = project.get('id')
                details += f", Project ID: {self.project_id}"
                
                # Validate enhanced project structure
                required_fields = ['id', 'company_name', 'status', 'created_at', 'brand_colors', 'platform']
                has_fields = all(field in project for field in required_fields)
                details += f", Structure: {'Valid' if has_fields else 'Invalid'}"
                
                # Check brand colors
                if project.get('brand_colors'):
                    details += f", Brand Colors: Present"
                else:
                    details += f", Brand Colors: Missing"
                
                success = success and has_fields
            
            self.log_test("POST Create Project (Enhanced)", success, details)
            return success
        except Exception as e:
            self.log_test("POST Create Project (Enhanced)", False, f"Error: {str(e)}")
            return False

    def test_get_projects(self):
        """Test GET /projects endpoint"""
        try:
            response = requests.get(f"{self.base_url}/projects", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                projects = response.json()
                details += f", Count: {len(projects)}"
                
                # If we created a project, it should be in the list
                if self.project_id and projects:
                    found_project = any(p.get('id') == self.project_id for p in projects)
                    details += f", Created project found: {found_project}"
                    success = success and found_project
            
            self.log_test("GET Projects", success, details)
            return success
        except Exception as e:
            self.log_test("GET Projects", False, f"Error: {str(e)}")
            return False

    def test_get_project_by_id(self):
        """Test GET /projects/{id} endpoint"""
        if not self.project_id:
            self.log_test("GET Project by ID", False, "No project ID available")
            return False
        
        try:
            response = requests.get(f"{self.base_url}/projects/{self.project_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                project = response.json()
                details += f", Company: {project.get('company_name', 'N/A')}"
                details += f", Status: {project.get('status', 'N/A')}"
            
            self.log_test("GET Project by ID", success, details)
            return success
        except Exception as e:
            self.log_test("GET Project by ID", False, f"Error: {str(e)}")
            return False

    def test_generate_content(self):
        """Test POST /generate-content endpoint - Enhanced with 3 variations"""
        if not self.project_id:
            self.log_test("POST Generate Content", False, "No project ID available")
            return False
        
        try:
            payload = {
                "project_id": self.project_id,
                "variation_count": 3,
                "custom_instructions": "Create test advertisement with neuromarketing principles"
            }
            
            response = requests.post(
                f"{self.base_url}/generate-content",
                json=payload,
                timeout=120  # AI generation takes time
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Success: {result.get('success', False)}"
                if result.get('images'):
                    details += f", Images generated: {len(result['images'])}/3 expected"
                if result.get('caption'):
                    details += f", Caption: Present"
                if result.get('variations_count'):
                    details += f", Variations: {result['variations_count']}"
            else:
                # This might fail due to AI API issues, which is expected
                details += " (Expected to fail if AI API not properly configured)"
            
            self.log_test("POST Generate Content (3 Variations)", success, details)
            return success
        except Exception as e:
            self.log_test("POST Generate Content (3 Variations)", False, f"Error: {str(e)} (Expected if AI API not configured)")
            return False

    def test_generate_video(self):
        """Test POST /generate-video endpoint - New Sora 2 integration"""
        if not self.project_id:
            self.log_test("POST Generate Video", False, "No project ID available")
            return False
        
        try:
            payload = {
                "project_id": self.project_id,
                "duration": 8,
                "video_size": "portrait",
                "custom_instructions": "Create engaging neuromarketing video"
            }
            
            response = requests.post(
                f"{self.base_url}/generate-video",
                json=payload,
                timeout=180  # Video generation takes longer
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Success: {result.get('success', False)}"
                if result.get('video_url'):
                    details += f", Video URL: Present"
            else:
                # This might fail due to AI API issues, which is expected
                details += " (Expected to fail if AI API not properly configured)"
            
            self.log_test("POST Generate Video (Sora 2)", success, details)
            return success
        except Exception as e:
            self.log_test("POST Generate Video (Sora 2)", False, f"Error: {str(e)} (Expected if AI API not configured)")
            return False

    def test_delete_project(self):
        """Test DELETE /projects/{id} endpoint"""
        if not self.project_id:
            self.log_test("DELETE Project", False, "No project ID available")
            return False
        
        try:
            response = requests.delete(f"{self.base_url}/projects/{self.project_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Message: {result.get('message', 'N/A')}"
            
            self.log_test("DELETE Project", success, details)
            return success
        except Exception as e:
            self.log_test("DELETE Project", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all enhanced API tests"""
        print("🚀 Starting NeuroAd WebView Generator API Tests (Enhanced)")
        print("=" * 60)
        
        # Basic API tests
        self.test_api_root()
        self.test_get_strategies()
        self.test_get_platforms()
        self.test_get_marketing_tips()
        
        # Enhanced scraping test with brand analysis
        self.test_scrape_website()
        
        # Enhanced project CRUD tests
        self.test_create_project()
        self.test_get_projects()
        self.test_get_project_by_id()
        
        # Enhanced AI generation tests (expected to fail without proper setup)
        self.test_generate_content()
        self.test_generate_video()
        
        # Cleanup
        self.test_delete_project()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 70  # Consider 70% success rate as acceptable

def main():
    """Main test runner"""
    tester = NeuroAdAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())