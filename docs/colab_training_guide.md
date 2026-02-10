# Custom Floor Plan Model - Google Colab Training Guide

This guide will help you train a custom AI model (YOLOv8 Nano) using **Google Colab** (Free Cloud GPU).
This model will learn to detect **Elevators**, **Toilets**, **Stairs**, and **Fire Extinguishers** directly from the image.

## 1. Get the "Magic Code" (Don't Download Zip) 🪄
Since Roboflow asks for upgrades sometimes, use the **Coding Method** instead.

1.  Go to the **[floor-plan-features dataset page](https://universe.roboflow.com/beekeeperexploration/floor-plan-features-zuzxt)**.
2.  Click **"Download Dataset"** (white/purple button).
3.  Select Format: **`YOLOv8`**.
4.  Check **"Show download code"** (or select "Jupyter Notebook").
5.  **Copy the Code Snippet**. It will look like this:
    ```python
    !pip install roboflow
    from roboflow import Roboflow
    rf = Roboflow(api_key="YOUR_PRIVATE_KEY")
    project = rf.workspace("beekeeperexploration").project("floor-plan-features-zuzxt")
    version = project.version(1)
    dataset = version.download("yolov8")
    ```

---

## 2. Open Google Colab
1.  Go to [Google Colab](https://colab.research.google.com/).
2.  Click **New Notebook**.
3.  Go to **Runtime** > **Change runtime type** > Select **T4 GPU**.

---

## 3. Run Training Code
Copy and paste the following code blocks into Colab cells and run them one by one.

### Step 3.1: Install & Download Data
**PASTE YOUR ROBOFLOW CODE HERE** (The one you copied in Step 1).
It will handle downloading everything automatically!

### Step 3.2: Install YOLO
```python
!pip install ultralytics
import ultralytics
ultralytics.checks()
```

### Step 3.3: Train the Model
This will train a small, fast model (`yolov8n.pt`) for 100 epochs.
*Note: The dataset folder name might change. Check the file browser on the left to see what folder was created (e.g. `floor-plan-features-1`). Update the path below if needed.*
```python
from ultralytics import YOLO

# Load a model
model = YOLO('yolov8n.pt') 

# Train the model (Update folder name if needed!)
# Usually it is './floor-plan-features-1/data.yaml'
results = model.train(data='./floor-plan-features-1/data.yaml', epochs=100, imgsz=640)
```

### Step 3.4: Validate
Check how well it performs on unseen images.
```python
results = model.val()
```

### Step 3.5: Export to ONNX (For Browser)
This converts the trained PyTorch model into a format that runs in your web browser.
```python
success = model.export(format='onnx')
```

---

## 4. Download Your Model
1.  In the left sidebar file browser, navigate to:
    `runs/detect/train/weights/`
2.  Find **`best.onnx`**.
3.  Right-click and **Download**.

---

## 5. Use in Your App (CRITICAL STEP)
You need to tell the app what classes your model detects.

1.  **Check `citations/data.yaml`** in your dataset (or just remember what labels were there).
    -   For "floor-plan-features", they are likely: `['Bathroom', 'Elevator', 'Stairs', 'elements']`
2.  **Rename `best.onnx`** to `custom_floor_plan_model.onnx`.
3.  **Copy it** to your `public/models/` folder.
4.  **Edit Code**: Open `lib/ai/floor-plan-detector.ts`.
5.  **Update `classNames` array**:
    ```typescript
    // REPLACE the old list with your new dataset classes IN ORDER
    const classNames = ['Bathroom', 'Elevator', 'Stairs', 'elements']; 
    // ^ Whatever labels match your dataset!
    ```

---

## 🏆 Scaling Up: The Master Model (5,000+ Images)
If you want to move to the professional level (handling malls, hospitals, and giant factories), you should switch to the **CubiCasa 5K** dataset.

1.  **Find the Dataset**: Search Roboflow Universe for `cubicasa_5k_0` or [click here](https://universe.roboflow.com/search?q=cubicasa).
2.  **Wait for Training**: With 5,000 images, set `epochs=50` (instead of 100) to save time. It will take about 3-5 hours on a T4 GPU.
3.  **Mixing Models**:
    - **Option 1 (App Level)**: Run your current `safety_model.onnx` and then run the `cubicasa.onnx`. The app combines the results. (Recommended)
    - **Option 2 (Training Level)**: Use Roboflow's **Merge Dataset** feature to create one giant dataset of 5,500 images.

**Done!** Your app now has a custom-trained AI brain. 🧠🚀

