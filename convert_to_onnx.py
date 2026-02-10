from ultralytics import YOLO
import os
import shutil

# Paths
source_pt = r'C:\Users\Admin\Downloads\best.pt'
target_dir = r'c:\Users\Admin\Desktop\signage analyzer\public\models'
target_onnx_name = 'fire_safety_omega.onnx'

def convert():
    if not os.path.exists(source_pt):
        print(f"❌ Error: Could not find {source_pt}")
        return

    print(f"🔄 Loading model from {source_pt}...")
    model = YOLO(source_pt)

    print("⏳ Exporting to ONNX format (imgsz=640)...")
    # Export returns the path to the saved file
    path = model.export(format='onnx', imgsz=640)
    
    # The default export name is best.onnx in the same folder as best.pt
    exported_onnx = source_pt.replace('.pt', '.onnx')
    
    if os.path.exists(exported_onnx):
        final_path = os.path.join(target_dir, target_onnx_name)
        print(f"🚚 Moving and renaming to {final_path}...")
        
        # Ensure target directory exists
        os.makedirs(target_dir, exist_ok=True)
        
        # Copy to target location
        shutil.copy2(exported_onnx, final_path)
        print("✅ Conversion and placement complete!")
    else:
        print("❌ Error: Export failed, could not find exported ONNX file.")

if __name__ == "__main__":
    convert()
