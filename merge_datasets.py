"""
Merge VR_AI + safety datasets for fine-tuning existing CubiCasa model
This adds fire safety detection to your trained floor plan model
"""

import os
import shutil
from pathlib import Path
import yaml

# ========================================
# CONFIGURATION
# ========================================

# Fire safety dataset paths
VR_AI_PATH = "C:/Users/Admin/Downloads/VR_AI.v1-for-floorplan.yolov8"
SAFETY_PATH = "C:/Users/Admin/Downloads/safety.v1-for-floorplan.yolov8"

# Output merged dataset path
OUTPUT_DIR = "C:/Users/Admin/Downloads/fire_safety_merged"

# ========================================
# MERGE SCRIPT
# ========================================

def merge_fire_safety_datasets():
    """Merge VR_AI and safety datasets"""
    
    print("🔥 Merging Fire Safety Datasets...")
    
    # Create output directories
    output_path = Path(OUTPUT_DIR)
    for split in ['train', 'valid']:
        (output_path / split / 'images').mkdir(parents=True, exist_ok=True)
        (output_path / split / 'labels').mkdir(parents=True, exist_ok=True)
    
    total_images = 0
    all_classes = set()
    
    # Merge both datasets
    for dataset_name, dataset_path in [("vr_ai", VR_AI_PATH), ("safety", SAFETY_PATH)]:
        print(f"\n📦 Processing {dataset_name}...")
        
        if not os.path.exists(dataset_path):
            print(f"   ⚠️  Path not found: {dataset_path}")
            continue
        
        source_path = Path(dataset_path)
        
        # Copy images and labels for both train and valid
        for split in ['train', 'valid']:
            src_img_dir = source_path / split / 'images'
            src_lbl_dir = source_path / split / 'labels'
            
            if not src_img_dir.exists():
                print(f"   ⚠️  {split}/images not found, skipping...")
                continue
            
            dst_img_dir = output_path / split / 'images'
            dst_lbl_dir = output_path / split / 'labels'
            
            img_count = 0
            # Process .jpg and .png files
            for ext in ['*.jpg', '*.jpeg', '*.png']:
                for img_file in src_img_dir.glob(ext):
                    # Prefix with dataset name to avoid conflicts
                    new_img_name = f"{dataset_name}_{img_file.name}"
                    shutil.copy2(img_file, dst_img_dir / new_img_name)
                    
                    # Copy corresponding label file
                    lbl_file = src_lbl_dir / f"{img_file.stem}.txt"
                    if lbl_file.exists():
                        new_lbl_name = f"{dataset_name}_{img_file.stem}.txt"
                        shutil.copy2(lbl_file, dst_lbl_dir / new_lbl_name)
                        
                        # Collect class IDs from labels
                        with open(lbl_file, 'r') as f:
                            for line in f:
                                class_id = line.strip().split()[0]
                                all_classes.add(int(class_id))
                    
                    img_count += 1
            
            print(f"   ✅ {split}: {img_count} images")
            total_images += img_count
    
    # Create data.yaml
    create_data_yaml(output_path, all_classes)
    
    print(f"\n🎉 Merge Complete!")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"📊 Total images: {total_images}")
    print(f"\n✅ Ready for fine-tuning in Colab!")

def create_data_yaml(output_path, class_ids):
    """Create data.yaml for fire safety dataset"""
    
    # Fire safety class names (adjust based on your datasets)
    class_names = [
        'exit_sign',
        'fire_extinguisher', 
        'fire_alarm',
        'emergency_button',
        'fire_hose',
        'emergency_exit'
    ]
    
    yaml_content = f"""# Fire Safety Merged Dataset
# VR_AI + safety datasets

path: .
train: train/images
val: valid/images

nc: {len(class_names)}
names: {class_names}
"""
    
    with open(output_path / 'data.yaml', 'w') as f:
        f.write(yaml_content)
    
    print(f"\n   ✅ Created data.yaml with {len(class_names)} fire safety classes")

if __name__ == "__main__":
    merge_fire_safety_datasets()
    print("\n📋 Next Steps:")
    print("1. Zip the fire_safety_merged folder")
    print("2. Upload to Google Drive")
    print("3. In Colab, fine-tune your CubiCasa model with this data")
