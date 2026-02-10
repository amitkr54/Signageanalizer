# 🏗️ Signage Analyzer - Fire Safety Signage Requirements Generator

AI-powered floor plan analysis for automated fire safety signage compliance reporting.

## 🚀 Features (MVP)
- **PDF/Image Upload**: Drag & drop floor plan processing.
- **AI Detection**: Real-time detection of doors, windows, and exits using YOLOv8 (WASM/ONNX).
- **Rules Engine**: automatic calculation of required signage based on NBC (National Building Code) regulations.
- **Report Generation**: Downloadable PDF reports with compliance summaries and itemized signage lists.

## ✅ Implementation Status

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Project Setup** | ✅ Complete | Next.js 14, Tailwind, TypeScript |
| **Backend** | ✅ Complete | Supabase Database & Storage configured |
| **AI Engine** | ✅ Complete | ONNX Runtime Web integrated with YOLOv8 |
| **Upload Pipeline** | ✅ Complete | PDF.js for rendering, drag-and-drop UI |
| **Rules Engine** | ✅ Complete | Calculates Exit Signs, Fire Extinguishers |
| **Reporting** | ✅ Complete | PDF generation using jsPDF |
| **Visual Annotations**| 🚧 Planned | Interactive floor plan viewer (Next Phase) |

## 🛠️ Tech Stack
- **Frontend:** Next.js 14 (App Router), React 19, TailwindCSS
- **AI Inference:** ONNX Runtime Web (WASM)
- **Database:** Supabase (PostgreSQL)
- **PDF Processing:** pdfjs-dist, jsPDF

## 🏃‍♂️ Quick Start

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create `.env.local` with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

4.  **Usage**
    -   Upload a floor plan image or PDF.
    -   Wait for AI analysis (detects doors/exits).
    -   View calculated signage requirements.
    -   Download the PDF Report.

## 📁 Project Structure
```
signage-analyzer/
├── app/                  # Next.js App Router pages
├── components/           # React components (Upload, AnalysisFlow)
├── lib/
│   ├── ai/               # AI Model integration (FloorPlanDetector)
│   ├── fire-safety/      # Rules Engine (Calculator)
│   ├── report-generator.ts # PDF Report logic
│   └── supabase.ts       # Database client
├── public/
│   └── models/           # YOLOv8 ONNX models
└── supabase-schema.sql   # Database setup
```

## 🤖 AI Model
The project uses a YOLOv8 model exported to ONNX format.
-   Location: `public/models/yolov8n.onnx`
-   Execution: Client-side via WebAssembly (No Python backend required for inference).

## 📄 License
MIT
