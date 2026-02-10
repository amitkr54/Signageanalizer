# The Omega Merge Guide: Sourcing the Master Brain 🧠🧬

To build a professional-grade Signage Analyzer, we will perform an **Omega Merge** of two world-class datasets. This gives the AI the "Skeletal Sight" of an architect and the "Safety Eyes" of a fire Marshall.

## 1. The Structural Base (CubiCasa 5K)
This dataset provides 5,000 images of walls, doors, stairs, and windows. 
- **Project URL**: [cubicasa5k-2-qpmsa on Roboflow](https://universe.roboflow.com/floorplan-recognition/cubicasa5k-2-qpmsa)
- **What to do**: Use this as your verified structural base. Fork/Download this for the "Skeleton" of your model.

## 2. The Expert Layer (Verified Fire Safety Symbols)
We have found two high-quality, professional datasets that are actively maintained. **Use the VR_AI dataset as your primary source.**

### **A. Primary Source: VR_AI Dataset (University at Albany)**
This is a professional-grade dataset with granular labels.
- **Direct URL**: [VR_AI on Roboflow](https://universe.roboflow.com/university-at-albany-suny/vr_ai/dataset/5)
- **What to do**: Click the purple **"Use this Dataset"** button (top-right) and select **"Clone to Project"** or **"Add to Project"**.
- **Key Classes**: `Exit Sign`, `Fire Extinguisher`, `Fire Alarm`, `Emergency Button`.

### **B. Secondary Source: mmmm safety**
A cleaner, focused dataset for core signs.
- **Direct URL**: [mmmm safety on Roboflow](https://universe.roboflow.com/mmmm-lx3n5/safety-jdxkx/dataset/10)
- **What to do**: Also click the purple **"Use this Dataset"** button and select your `Signage-Omega-Master`.
- **Key Classes**: `fire-extinguisher`, `fire alarm`, `emergency exit sign`.

## 3. The "Omega Merge" Workflow in Roboflow
Now that you have forked the safety datasets, follow these steps to build the Master project:

### **Step 1: Move Safety Data (Brain B)**
1.  Open the **`safety`** project from your dashboard.
2.  Click the **Dataset** tab (left sidebar - the one with 1655 images).
3.  Click the **"Select All"** checkbox (top left above the grid).
4.  Click the **"Add to Project"** button in the top bar.
5.  Search for **`Signage-Omega-Master`** and click **"Add"**.
6.  **Repeat these steps for your `VR_AI` fork.**

### **Step 2: Move Structural Data (Brain A)**
1.  Open your **`cubicasa5k-2-qpmsa`** project.
2.  Click the **Dataset** tab.
3.  Click **"Select All"** -> **"Add to Project"** -> **`Signage-Omega-Master`**.

### **Step 3: Generate the Omega Version**
1.  Go to your **`Signage-Omega-Master`** project.
2.  You will see a banner: *"Unassigned images found"*. Click **"Assign to Training"**.
3.  Click **"Generate Version"**.
4.  **CRITICAL**: In the **Augmentations** step, add:
    - **Grayscale**
    - **Edge Detection**
    *(This helps the 3D photos look like 2D floor plans).*
5.  Click **"Create"**.

---

## 4. The Science of the "Omega Merge" 🧠🔬
You might ask: *"Why use real-world photos for a 2D floor plan app?"*

### **A. Feature Signature Learning**
An AI doesn't see "objects." It sees **features** (colors, edges, shapes). 
- A **Fire Extinguisher** always has a specific "Visual Signature": A solid red rectangle, a black pressure nozzle, and white instruction labels. 

### **B. The "Icon Bridge" (Augmentation)**
In the Roboflow **Generate** step, we will use **Grayscale** and **Edge Detection** augmentations. This "flattens" the 3D photos into 2D edge-maps that perfectly match the look of a technical floor plan.

---

### 🛡️ Why these two?
- **CubiCasa** is the industry standard for floor plan geometry.
- **VR_AI / Safety Symbols** ensures we meet **ISO 7010** visual compliance.
