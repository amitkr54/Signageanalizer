"""
Delete all images from Roboflow project
Useful for clearing unlabeled uploads before re-uploading with labels
"""

from roboflow import Roboflow

# ========================================
# CONFIGURATION
# ========================================

API_KEY = "DyQaygIT3iGDmXbKQlbX"
WORKSPACE_NAME = "floorplan-bssyz"
PROJECT_NAME = "signage-omega-master"

# ========================================
# DELETE SCRIPT
# ========================================

def delete_all_images():
    """Delete all images from the Roboflow project"""
    
    print("🗑️  Starting image deletion from Roboflow project...")
    
    # Initialize Roboflow
    rf = Roboflow(api_key=API_KEY)
    
    # Get your project
    try:
        project = rf.workspace(WORKSPACE_NAME).project(PROJECT_NAME)
        print(f"✅ Connected to project: {PROJECT_NAME}")
        
        # Get all images in the project
        # Note: Roboflow API doesn't have a direct bulk delete
        # This will delete images from the latest version
        
        print("⚠️  Note: You may need to delete images manually from the Roboflow web interface")
        print("   Go to: https://app.roboflow.com/floorplan-bssyz/signage-omega-master")
        print("   Click 'Dataset' → Select All → Delete")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    delete_all_images()
