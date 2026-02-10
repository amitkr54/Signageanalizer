# Quick Start Guide: Floor Plan AI Model Setup

## 🚀 Quick Start (5 Minutes)

The **fastest** way to get a working floor plan detection model in ONNX format:

### Step 1: Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate  # Windows

# Install ultralytics (YOLOv8)
pip install ultralytics onnx onnxruntime
```

### Step 2: Export YOLOv8 to ONNX

```python
from ultralytics import YOLO

# Load pretrained YOLOv8 nano (smallest, fastest)
model = YOLO('yolov8n.pt')

# Export to ONNX
model.export(
    format='onnx',
    opset=13,
    simplify=True,
    imgsz=640
)

print("✅ Model exported to: yolov8n.onnx")
```

**File size:** ~6 MB  
**Speed:** Very fast in browser

### Step 3: Copy to Your Project

```bash
# Create models folder
mkdir "C:\Users\Admin\Desktop\signage analyzer\models"

# Copy ONNX model
copy yolov8n.onnx "C:\Users\Admin\Desktop\signage analyzer\models\"
```

### Step 4: Test in Browser

1. Open `test-floor-plan-detection.html` in browser
2. Upload a floor plan image
3. See detections!

---

## ⚡ For Better Floor Plan Accuracy

YOLOv8 pretrained on COCO won't detect floor plan elements well. You need to:

### Option A: Use Roboflow (Easiest)

1. Go to https://universe.roboflow.com/
2. Search "floor plan detection"
3. Find a pretrained model (e.g., "Floor Plans 500")
4. Export as ONNX
5. Download and use!

**Example:**
```python
from roboflow import Roboflow

rf = Roboflow(api_key="YOUR_API_KEY")
project = rf.workspace("YOUR_WORKSPACE").project("floor-plan-detection")
model = project.version(1).model

# Get ONNX export
model.export(format="onnx")
```

### Option B: Fine-tune YOLOv8 (Best Accuracy)

```python
from ultralytics import YOLO

# Download floor plan dataset from Kaggle:
# "Floor Plans 500 - Annotated Object Detection"

model = YOLO('yolov8n.pt')

# Train on floor plan data
model.train(
    data='floor-plans-500/data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    device='cpu'  # or 'cuda' if you have GPU
)

# Export trained model
model.export(format='onnx')
```

**Training time:** 2-4 hours on CPU, 30 min on GPU

### Option C: Use CubiCasa5K Model

1. Clone repo:
```bash
git clone https://github.com/CubiCasa/CubiCasa5k.git
```

2. Download weights (check repo README for link)

3. Convert to ONNX using `convert_model.py`

---

## 📁 File Structure

```
signage analyzer/
├── models/
│   ├── yolov8n.onnx              # Your ONNX model
│   └── yolov8n_optimized.onnx    # Optimized version
├── test-floor-plan-detection.html
├── convert_model.py
└── model-conversion-guide.md
```

---

## 🧪 Testing Your Model

### Test 1: Verify ONNX Model

```python
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("models/yolov8n.onnx")

# Get input details
input_name = session.get_inputs()[0].name
input_shape = session.get_inputs()[0].shape

print(f"Input: {input_name}, Shape: {input_shape}")

# Test inference
test_input = np.random.randn(1, 3, 640, 640).astype(np.float32)
outputs = session.run(None, {input_name: test_input})

print(f"✅ Model works! Output shape: {outputs[0].shape}")
```

### Test 2: Browser Test

1. Run a local server:
```bash
# Python 3
python -m http.server 8000

# Or use VS Code Live Server
```

2. Open: http://localhost:8000/test-floor-plan-detection.html

3. Upload a floor plan image

---

## 🎯 Next Steps

After getting the basic model working:

1. **Fine-tune on floor plans** for better accuracy
2. **Add PDF processing** (PDF.js)
3. **Implement fire safety rules** engine
4. **Generate reports** (jsPDF)
5. **Deploy** to production

---

## ⚠️ Important Notes

- **YOLOv8 COCO model** = General objects (person, car, etc.) - NOT floor plan specific
- **Floor plan model** = Needs training on architectural drawings
- **For production** = Must fine-tune or use pretrained floor plan model
- **File size** = Keep model < 20MB for fast web loading

---

## 🆘 Troubleshooting

**Model not loading in browser?**
- Check console for errors
- Verify model path in HTML file
- Make sure you're running a local server (not file://)

**Poor detection accuracy?**
- YOLOv8 COCO won't detect floor plan elements
- Need floor-plan-specific training data
- Use Roboflow or fine-tune the model

**Model too slow?**
- Use YOLOv8 nano (yolov8n) instead of larger versions
- Reduce input size (640 → 416)
- Enable WebGL/WebGPU execution provider

---

## 📚 Resources

- YOLOv8 Docs: https://docs.ultralytics.com/
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- CubiCasa5K: https://github.com/CubiCasa/CubiCasa5k
- Roboflow Universe: https://universe.roboflow.com/
- Floor Plans Dataset: https://www.kaggle.com/datasets/alekseysub/floor-plans-500

---

**Ready to start?** Run `python convert_model.py` and choose option 1!
