# 🎯 How to Get Accurate Floor Plan Analysis

The current app uses a **Generic AI Model** (YOLOv8n) which is great for testing the pipeline but poor at detecting specific floor plan elements like doors and windows.

To get professional-grade results, follow these steps to upgrade the "brain" of the application.

## Step 1: Get a Specialized Model (The "Brain")

We recommend using **Roboflow Universe**, which hosts free, community-trained models.

1.  **Go to Roboflow Universe**: [universe.roboflow.com](https://universe.roboflow.com)
2.  **Search**: `floor plan detection`
3.  **Select a Model**: Look for one with:
    *   High "mAP" (accuracy score)
    *   Classes like: `door`, `window`, `stairs`, `text`, `room`
    *   Example: [Floor Plan Object Detection](https://universe.roboflow.com/roboflow/floor-plan-dataset)
4.  **Download**:
    *   Click "Download this Dataset" -> "Model" -> "YOLOv8"
    *   **OR** click "Deploy" -> "Use with Ultralytics" to get the `.pt` weights.
    *   *Ideally, you want the `best.pt` file.*

## Step 2: Convert to ONNX (The Format)

Once you have the `best.pt` file:

1.  Place it in your project folder (e.g., `C:\Users\Admin\Desktop\signage analyzer\`).
2.  Open your terminal.
3.  Run the conversion command:
    ```bash
    # Replace 'best.pt' with your filename
    python -c "from ultralytics import YOLO; model = YOLO('best.pt'); model.export(format='onnx', opset=13, simplify=True, imgsz=640)"
    ```
4.  This creates `best.onnx`.

## Step 3: Deployment (The Swap)

1.  **Rename**: Rename `best.onnx` to `yolov8n.onnx` (or update the path in `lib/ai/floor-plan-detector.ts`).
2.  **Move**: Copy it to `public/models/`, overwriting the old one.
    ```bash
    copy best.onnx "public\models\yolov8n.onnx"
    ```
3.  **Update Classes** (Important!):
    *   Open `lib/ai/floor-plan-detector.ts`.
    *   Update the `getClassLabel` function to match your new model's classes (e.g., 0=Wall, 1=Door, 2=Window).
## The "Gold Standard": CubiCasa5K Strategy

If you want the absolute best accuracy, the **CubiCasa5K** dataset (5000+ professional floor plans) is the industry standard.

### Recommendation: YOLO on CubiCasa
Don't use the raw CubiCasa model (it's a heavy segmentation network designed for servers). Instead:
1.  Go to Roboflow Universe.
2.  Search for `CubiCasa5k` or `Floor Plan Segmentation`.
3.  Look for a **YOLOv8** model trained on this data.
4.  This gives you the **Accuracy of CubiCasa** with the **Speed of YOLO**.

*Note: The model I installed (`sanatladkat`) is trained on key architectural elements similar to those found in CubiCasa.*
