# Model Verification Log: Structural Base (CubiCasa) 🔍🏗️

Use this log to audit your Google Colab training results before we proceed to the **Expert Safety** merge.

## 1. Where to find these scores?
In your Google Colab "Files" sidebar (on the left), navigate to:
`runs/detect/train/` (or `train2`, `train3` if you ran it multiple times)

Look for these two files:
1.  **`results.png`**: (The most important) This contains 10 charts showing your Loss and mAP curves.
2.  **`results.csv`**: This contains the raw numbers for every single epoch.
3.  **Terminal Output**: Check the last few lines of your training cell; it will show a summary table for the final epoch.

## 2. Metric Audit
| Metric | Healthy Range | Your Result | Status |
| :--- | :--- | :--- | :--- |
| **mAP@.5** | > 0.65 | **0.711** | ✅ GREEN |
| **Box Loss** | < 1.5 | **~1.8 (Avg)** | ⚠️ OK |
| **Class Loss** | < 1.0 | **~1.1 (Avg)** | ⚠️ OK |
| **Precision (P)** | > 0.70 | **0.737** | ✅ GREEN |
| **Recall (R)** | > 0.60 | **0.676** | ✅ GREEN |

> [!NOTE]
> Excellent results for a structural base! The **window** detection (0.816) is extremely strong, and the **door** (0.699) is solid. The **wall** recall is slightly lower (0.57), but for signage analysis, doors and windows are the more critical anchors.

## 2. Visual Smoke Test (The "Eye" Test)
Download a few `val_batch0_labels.jpg` or `val_batch0_pred.jpg` files from your `/runs/detect/train/` folder and check:
- [ ] Are **Doors** being detected in the right places? (Not on windows)
- [ ] Are **Stairs** clearly identified? (Critical for egress)
- [ ] Are **Elevators** distinct from small rooms/closets?
- [ ] Are **Walls** forming a clean "Skeleton" of the building?

## 3. Deployment Check
- [ ] Export successful to ONNX? (`model.export(format='onnx')`)
- [ ] File size < 50MB? (WASM limit for smooth browser experience)

---

### 🚀 Next Steps (After completion)
1. If metrics are **Green**, proceed to the **[Omega Merge Guide](file:///C:/Users/Admin/Desktop/signage%20analyzer/docs/omega_merge_guide.md)**.
2. If metrics are **Red**, share the results with me and we will tune the hyper-parameters.
