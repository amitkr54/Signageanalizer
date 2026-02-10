"""
Roboflow CLI Upload Script
Uploads YOLOv8 dataset (images + labels) to your Roboflow project
"""

from roboflow import Roboflow
import os

# ========================================
# CONFIGURATION - FILL THESE IN
# ========================================

# Your Roboflow API Key (get from: https://app.roboflow.com/settings/api)
API_KEY = "DyQaygIT3iGDmXbKQlbX"

# Your workspace name (find in Roboflow URL: app.roboflow.com/YOUR_WORKSPACE/...)
WORKSPACE_NAME = "floorplan-bssyz"

# Your project name (the Signage-Omega-Master project)
PROJECT_NAME = "signage-omega-master"

# Path to your downloaded YOLOv8 dataset folder
# Example: "C:/Users/Admin/Downloads/VR_AI.v1-for-floorplan.yolov8"
DATASET_PATH = "C:/Users/Admin/Downloads/VR_AI.v1-for-floorplan.yolov8"

# ========================================
# UPLOAD SCRIPT
# ========================================

def upload_yolov8_dataset():
    """Upload YOLOv8 dataset to Roboflow with labels"""
    
    print("🚀 Starting Roboflow Upload...")
    
    # Initialize Roboflow
    rf = Roboflow(api_key=API_KEY)
    
    # Get your project
    project = rf.workspace(WORKSPACE_NAME).project(PROJECT_NAME)
    
    # Check if dataset path exists
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Error: Dataset path not found: {DATASET_PATH}")
        return
    
    print(f"📤 Uploading from: {DATASET_PATH}")
    
    # Upload images with annotations
    # Roboflow expects images to be uploaded individually
    upload_count = 0
    
    # Upload from train folder
    train_images = os.path.join(DATASET_PATH, "train", "images")
    train_labels = os.path.join(DATASET_PATH, "train", "labels")
    
    if os.path.exists(train_images):
        print(f"Uploading training images from {train_images}...")
        for img_file in os.listdir(train_images):
            if img_file.endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(train_images, img_file)
                label_file = os.path.splitext(img_file)[0] + '.txt'
                label_path = os.path.join(train_labels, label_file)
                
                try:
                    project.upload(
                        image_path=img_path,
                        annotation_path=label_path if os.path.exists(label_path) else None,
                        split="train"
                    )
                    upload_count += 1
                    if upload_count % 10 == 0:
                        print(f"  Uploaded {upload_count} images...")
                except Exception as e:
                    print(f"  ⚠️  Skipped {img_file}: {e}")
    
    # Upload from valid folder
    valid_images = os.path.join(DATASET_PATH, "valid", "images")
    valid_labels = os.path.join(DATASET_PATH, "valid", "labels")
    
    if os.path.exists(valid_images):
        print(f"Uploading validation images from {valid_images}...")
        for img_file in os.listdir(valid_images):
            if img_file.endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(valid_images, img_file)
                label_file = os.path.splitext(img_file)[0] + '.txt'
                label_path = os.path.join(valid_labels, label_file)
                
                try:
                    project.upload(
                        image_path=img_path,
                        annotation_path=label_path if os.path.exists(label_path) else None,
                        split="valid"
                    )
                    upload_count += 1
                    if upload_count % 10 == 0:
                        print(f"  Uploaded {upload_count} images...")
                except Exception as e:
                    print(f"  ⚠️  Skipped {img_file}: {e}")
    
    print(f"✅ Upload complete! Uploaded {upload_count} images total.")
    print(f"🔗 View at: https://app.roboflow.com/{WORKSPACE_NAME}/{PROJECT_NAME}")

if __name__ == "__main__":
    upload_yolov8_dataset()
