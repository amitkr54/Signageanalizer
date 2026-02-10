# The Builder's Blueprint: Signage Analyzer "Omega" 🏗️🏛️

This is the architectural master plan for the "Omega" phase of the Signage Analyzer. It moves the project from a simple detector to a professional expert system.

## 1. The Foundation (Data & Architecture)
- **Omega Merge Strategy**: Combine CubiCasa 5K (Structural) + Custom Safety Symbols (Expertise) + Wayfinding Standards (Arrows/Scale).
- **Semantic Inference Engine**: Switch from heavy CPU-OCR math to GPU-efficient object context (Toilets = Washroom, Beds = Bedroom).
- **Model Format**: YOLOv8 exported to ONNX for fast, cross-platform WASM execution.

## 2. The Walls (Reasoning & Rules)
- **Reasoning Engine (signage_guidelines.md)**: Every suggestion must cite a specific fire code (NBC/ISO/NFPA).
- **Spatial Awareness**: Implement Raycasting for sightline detection and Auto-Scaling for meter-based math.
- **Directional Logic**: Junction-point analysis and dead-end detection based on ISO 28564.

## 3. The Front Door (Customer Intake)
- **Consultant Checklist**: Mandatory input fields for Building Type, Scale, and High-Res files.
- **Regulatory Selector**: Allow users to switch between NBC (India) and NFPA (Global) rules.

## 4. Proposed Changes

### [Component: AI Detection Layer]
#### [MODIFY] [floor-plan-detector.ts](file:///C:/Users/Admin/Desktop/signage%20analyzer/lib/ai/floor-plan-detector.ts)
- Refactor to support the "Omega" multi-class model.
- Implement Semantic Inference (calculating room types from contained objects).

### [Component: Rules & Calculation]
#### [MODIFY] [calculator.ts](file:///C:/Users/Admin/Desktop/signage%20analyzer/lib/fire-safety/calculator.ts)
- Integrate "Reasoning Engine" logic (The 'Why' for every sign).
- Implement pixel-to-meter scaling math.

### [Component: UI/Intake]
#### [MODIFY] [AnalysisFlow.tsx](file:///C:/Users/Admin/Desktop/signage%20analyzer/components/AnalysisFlow.tsx)
- Add "Consultant Intake" form (Building Type, Scale Input).

## 5. Verification Plan
- **Mock Model Test**: Run the detector with simulated "Omega" classes to verify Semantic Inference accuracy.
- **Reasoning Audit**: Verify that the generated PDF report correctly cites NBC/ISO codes for every recommendation.
- **Scale Calibration**: Upload a plan with a known scale and verify that travel distances are calculated within 5% accuracy.
