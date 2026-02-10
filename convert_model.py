"""
Floor Plan Model Converter
Downloads pretrained models and converts them to ONNX format
"""

import torch
import torch.onnx
import numpy as np
import onnx
import onnxruntime as ort


def convert_yolov8_to_onnx():
    """
    Convert YOLOv8 model to ONNX
    This is the EASIEST option - YOLOv8 has built-in export
    """
    print("Installing ultralytics...")
    # pip install ultralytics
    
    from ultralytics import YOLO
    
    # Option A: Use pretrained COCO model (will need fine-tuning)
    print("Loading YOLOv8 model...")
    model = YOLO('yolov8n.pt')  # nano version for speed
    
    # Export to ONNX
    print("Exporting to ONNX...")
    model.export(
        format='onnx',
        opset=13,
        simplify=True,  # Simplify for better performance
        dynamic=False,  # Fixed input size for WASM
        imgsz=640
    )
    
    print("✅ YOLOv8 model exported to: yolov8n.onnx")


def download_cubicasa_model():
    """
    Download CubiCasa5K pretrained weights
    """
    import requests
    import os
    
    # Model weights URL (you'll need to check GitHub for actual link)
    # This is a placeholder - check CubiCasa5K repo for real URL
    model_url = "https://github.com/CubiCasa/CubiCasa5k/releases/download/v1.0/model_best_val_loss_var.pkl"
    
    print("Downloading CubiCasa model weights...")
    print("⚠️  Note: Check GitHub repo for actual download link")
    print("    https://github.com/CubiCasa/CubiCasa5k")
    
    # You would download like this:
    # response = requests.get(model_url)
    # with open('cubicasa_model.pkl', 'wb') as f:
    #     f.write(response.content)


def convert_generic_pytorch_to_onnx(model_path, input_shape=(1, 3, 512, 512)):
    """
    Generic PyTorch to ONNX converter
    Works for most PyTorch models
    """
    # Load your model
    print(f"Loading model from {model_path}...")
    model = torch.load(model_path, map_location='cpu')
    
    # If it's a state dict, you need to load it into a model architecture
    if isinstance(model, dict):
        print("⚠️  Model is a state dict. You need the model architecture!")
        print("   Check the original repo for model definition")
        return
    
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randn(*input_shape)
    
    # Export to ONNX
    output_path = model_path.replace('.pt', '.onnx').replace('.pth', '.onnx')
    
    print(f"Exporting to {output_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=13,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"✅ Model exported to: {output_path}")
    return output_path


def verify_onnx_model(onnx_path):
    """
    Verify ONNX model is valid and runnable
    """
    print(f"\nVerifying {onnx_path}...")
    
    # Check model validity
    model = onnx.load(onnx_path)
    onnx.checker.check_model(model)
    print("✅ ONNX model is valid")
    
    # Test inference
    print("Testing inference...")
    session = ort.InferenceSession(onnx_path)
    
    # Get input details
    input_name = session.get_inputs()[0].name
    input_shape = session.get_inputs()[0].shape
    print(f"   Input name: {input_name}")
    print(f"   Input shape: {input_shape}")
    
    # Create test input
    test_input = np.random.randn(*[1, 3, 640, 640]).astype(np.float32)
    
    # Run inference
    outputs = session.run(None, {input_name: test_input})
    print(f"✅ Inference successful!")
    print(f"   Output shape: {outputs[0].shape}")
    
    return True


def optimize_for_web(onnx_path):
    """
    Optimize ONNX model for web deployment
    Reduces file size and improves performance
    """
    import onnxoptimizer
    
    print(f"\nOptimizing {onnx_path} for web...")
    
    model = onnx.load(onnx_path)
    
    # Apply optimization passes
    passes = ['eliminate_deadend', 'eliminate_nop_transpose', 
              'fuse_bn_into_conv', 'fuse_consecutive_squeezes',
              'fuse_consecutive_transposes']
    
    optimized_model = onnxoptimizer.optimize(model, passes)
    
    # Save optimized model
    optimized_path = onnx_path.replace('.onnx', '_optimized.onnx')
    onnx.save(optimized_model, optimized_path)
    
    # Compare file sizes
    import os
    original_size = os.path.getsize(onnx_path) / 1024 / 1024
    optimized_size = os.path.getsize(optimized_path) / 1024 / 1024
    
    print(f"✅ Optimization complete!")
    print(f"   Original size: {original_size:.2f} MB")
    print(f"   Optimized size: {optimized_size:.2f} MB")
    print(f"   Savings: {(1 - optimized_size/original_size)*100:.1f}%")
    
    return optimized_path


if __name__ == "__main__":
    print("="*60)
    print("Floor Plan Model to ONNX Converter")
    print("="*60)
    
    print("\nOptions:")
    print("1. Convert YOLOv8 (Easiest - built-in export)")
    print("2. Download CubiCasa5K model")
    print("3. Convert custom PyTorch model")
    print("4. Verify existing ONNX model")
    
    choice = input("\nEnter choice (1-4): ")
    
    if choice == "1":
        convert_yolov8_to_onnx()
        verify_onnx_model("yolov8n.onnx")
        
    elif choice == "2":
        download_cubicasa_model()
        print("\nAfter downloading, use option 3 to convert to ONNX")
        
    elif choice == "3":
        model_path = input("Enter path to PyTorch model (.pt or .pth): ")
        onnx_path = convert_generic_pytorch_to_onnx(model_path)
        if onnx_path:
            verify_onnx_model(onnx_path)
            
    elif choice == "4":
        onnx_path = input("Enter path to ONNX model: ")
        verify_onnx_model(onnx_path)
        optimize_for_web(onnx_path)
    
    print("\n" + "="*60)
    print("Done! You can now use the ONNX model in your web app.")
    print("="*60)
