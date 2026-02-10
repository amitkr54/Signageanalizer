# Fire Safety Signage Requirement Analyzer - Task Breakdown

## Project Overview
Build a web application that accepts floor plan PDFs and generates detailed signage requirements based on fire safety regulations.

## Phase 1: Research & Planning
- [x] Research fire safety signage regulations (NBC, local codes)
- [x] Define signage requirement rules (exit signs, fire extinguisher signs, etc.)
- [x] Design system architecture and data flow
- [x] Create comprehensive implementation plan
- [x] Select AI models for floor plan analysis

## Phase 1.5: AI Model Setup (Current)
- [x] Download pretrained floor plan models (YOLOv8/CubiCasa5K)
- [x] Convert PyTorch models to ONNX format
- [x] Verify ONNX models work in browser
- [x] **Enhancement**: Swap `yolov8n.onnx` with specialized Floor Plan Model (e.g., Roboflow) to improve accuracy beyond minimums.
- [x] Test detection accuracy on sample floor plans
- [ ] Optimize models for web deployment

## Phase 1.6: Master Model Development (Professional Upgrade)
- [x] **Skeletal Model Ready**: 50 Epochs complete (mAP50: 0.711)
- [/] **Omega Merge**: Performing "Workshop" (Merging CubiCasa + Fire-ART)
- [/] Integrate "Master Brain" ONNX model into application
- [ ] Implement multi-model orchestration logic in `floor-plan-detector.ts`

## Phase 2: Core Technology Setup
- [x] Set up Next.js 14 project with TypeScript
- [x] Configure Supabase database and storage
- [x] Implement PDF to image conversion (PDF.js)
- [/] Integrate WASM-based AI models for floor plan analysis (Mock integration complete)
- [/] Set up object detection (doors, exits, stairs, rooms) (Mock data)
- [ ] Implement room segmentation and classification
- [x] Create database schema and seed regulations

## Phase 3: Semantic Analysis Engine (CPU Efficient)
- [x] Build PDF upload and preprocessing pipeline (Using pdfjs-dist)
- [/] **Pivoted Architecture**: Using **Semantic Inferencing** instead of heavy OCR math.
- [ ] Determine Room Types by Object Detection (e.g., `toilet` -> Washroom, `bed` -> Bedroom).
- [ ] Implement Visual Signature Recognition for labels (EXIT, STAIR as icons).
- [ ] **Performance Goal**: 10x faster by keeping analysis inside the GPU/WASM model.
- [ ] Implement "Surgical OCR" only for unique room numbers if detected.

## Phase 4: Fire Safety Rules Engine
- [x] Create fire safety regulation database (Supabase + Local logic)
- [x] **Logic Defined**: Reasoning Engine (Architectural justifications)
- [/] Implement exit sign placement logic (Basic calculator)
- [/] Add fire extinguisher signage rules (Basic calculator)

## Phase 5: Advanced Architectural Intelligence (The "Better" System)
- [ ] Implement **Auto-Scaling** (Detect Scale/Legend for real-meter math)
- [ ] Build **Sightline Analysis** (Wall-aware Raycasting for sign visibility)
- [ ] Add **Occupancy Load** calculations (Suggesting exits based on Room Area)
- [ ] Implement **Regulatory Versioning** (Switching between NBC, NFPA, etc.)
- [ ] Build emergency evacuation route analysis
- [ ] Implement occupancy-based calculations
- [ ] Add assembly point detection logic

## Phase 5: Signage Requirement Generator
- [/] Calculate required signage based on detected elements (Integrated in Rules Engine)
- [ ] Generate placement recommendations
- [ ] Create compliance checklist
- [ ] Build signage specification sheets
- [ ] Implement cost estimation

## Phase 6: Report Generation
- [x] Design report template (PDF/HTML) (jsPDF)
- [ ] Create visual floor plan with annotated signage locations
- [x] Generate detailed signage list with specifications
- [x] Add compliance summary and recommendations
- [x] Implement export functionality (PDF, Excel)

## Phase 7: UI/UX Development
- [/] Design landing page and upload interface (Basic Upload Flow Done)
- [x] Build drag-and-drop PDF upload
- [x] Create analysis progress indicator
- [x] Design results dashboard
- [ ] Implement interactive floor plan viewer
- [ ] Add report download and sharing features

## Phase 8: Testing & Optimization
- [ ] Test with various floor plan formats
- [ ] Validate against actual fire safety codes
- [ ] Optimize WASM model performance
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

## Phase 9: Deployment
- [ ] Set up hosting infrastructure
- [ ] Configure domain and SSL
- [ ] Deploy application
- [ ] Set up analytics and monitoring
