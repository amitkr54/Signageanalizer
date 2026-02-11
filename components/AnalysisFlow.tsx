"use client";

import { useState } from 'react';
import { FloorPlanUploader } from './FloorPlanUploader';
import { Loader2, AlertTriangle, ArrowRight, Download, RefreshCcw, Building2, Ruler, Shield, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloorPlanDetector, Box as DetectBox } from '@/lib/ai/floor-plan-detector';
import { calculateSignage, AnalysisResult } from '@/lib/fire-safety/calculator';
import { generatePDFReport, generateTextReport } from '@/lib/report-generator';
import { FloorPlanViewer } from './FloorPlanViewer';
import { identifyRoomTypes } from '@/lib/ai/room-processor';

export function AnalysisFlow() {
    const [step, setStep] = useState<'upload' | 'preview' | 'analyzing' | 'results'>('upload');
    const [images, setImages] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
    const [buildingType, setBuildingType] = useState<string>('Overview');
    const [pixelsPerMeter, setPixelsPerMeter] = useState<number>(50);
    const [selectedModel, setSelectedModel] = useState<string>('/models/omega_model.onnx');

    const MODELS = {
        '/models/omega_model.onnx': [
            'wall', 'door', 'window', 'stairs', 'exit_sign', 'fire_extinguisher',
            'fire_alarm', 'emergency_exit', 'fire_hose_reel', 'fire_hydrant', 'aed'
        ],
        '/models/floorplan.onnx': [
            'Column', 'Curtain Wall', 'Dimension', 'Door', 'Railing', 'Stairs', 'Toilet', 'Wall', 'Window'
        ],
        '/models/fire_safety_omega.onnx': [
            'exit_sign', 'fire_extinguisher', 'fire_alarm', 'emergency_button', 'fire_hose', 'emergency_exit'
        ],
        '/models/yolov11_complex.onnx': [
            'Auto-detected (YOLOv11)'
        ],
        'dual-omega': ['ALL']
    };

    const handleImagesGenerated = (generatedImages: string[]) => {
        setImages(generatedImages);
        setStep('preview');
    };

    const startAnalysis = async () => {
        setStep('analyzing');
        try {
            const allDetections: DetectBox[] = [];
            let allTexts: string[] = [];

            // 1. NEURAL DETECTION (YOLOv11 / v8)
            const detectors: FloorPlanDetector[] = [];
            if (selectedModel === 'dual-omega') {
                detectors.push(new FloorPlanDetector('/models/floorplan.onnx', MODELS['/models/floorplan.onnx']));
                detectors.push(new FloorPlanDetector('/models/fire_safety_omega.onnx', MODELS['/models/fire_safety_omega.onnx']));
            } else {
                detectors.push(new FloorPlanDetector(selectedModel, MODELS[selectedModel as keyof typeof MODELS]));
            }

            for (const imageSrc of images) {
                for (const detector of detectors) {
                    const detections = await detector.detect(imageSrc);
                    allDetections.push(...detections);
                }
            }

            // 2. ADVANCED PADDLEOCR-LITE (Server Side)
            // We use the Python microservice for high-precision architectural OCR
            try {
                const response = await fetch('/api/advanced-ocr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: images[0] }) // Primary page analysis
                });

                if (response.ok) {
                    const ocrData = await response.json();
                    if (ocrData.stream) {
                        allTexts = ocrData.stream.map((item: any) => item.text);
                    }
                }
            } catch (e) {
                console.error("Advanced OCR failed:", e);
            }

            // 3. ARCHITECTURAL IDENTIFICATION
            const roomNames = identifyRoomTypes(allTexts);
            const results = calculateSignage(allDetections, roomNames, images.length, buildingType, pixelsPerMeter, allTexts);

            setAnalysisResults(results);
            setStep('results');
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analysis failed. Please check if the AI models are in /public/models/");
            setStep('preview');
        }
    };

    const steps = [
        { id: 'upload' as const, label: '1. Upload Floor Plan' },
        { id: 'preview' as const, label: '2. Review Layout' },
        { id: 'analyzing' as const, label: '3. AI Analysis' },
        { id: 'results' as const, label: '4. Compliance Report' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === (step === 'analyzing' ? 'analyzing' : step));

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Premium Horizontal Stepper */}
            <div className="flex items-center gap-0 mb-8 px-4">
                {steps.map((s, i) => {
                    const isActive = i === currentStepIndex;
                    const isCompleted = i < currentStepIndex;
                    return (
                        <div
                            key={s.id}
                            className={cn(
                                "flex-1 relative h-12 flex items-center justify-center transition-all duration-500",
                                isActive ? "bg-hazard-orange shadow-[0_0_20px_rgba(249,115,22,0.4)] z-20" :
                                    isCompleted ? "bg-slate-800 z-10" : "bg-white/5 grayscale"
                            )}
                            style={{
                                clipPath: i === steps.length - 1
                                    ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)'
                                    : i === 0
                                        ? 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)'
                                        : 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)',
                                marginLeft: i > 0 ? '-1%' : '0'
                            }}
                        >
                            <span className={cn(
                                "text-[11px] font-bold uppercase tracking-wider transition-colors duration-500 px-6",
                                isActive ? "text-white" : "text-slate-400"
                            )}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Card */}
            <div className="glass-dark rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl min-h-[500px] flex flex-col">
                <div className="p-10 flex-1 flex flex-col">
                    {step === 'upload' && (
                        <div className="animate-in fade-in h-full flex flex-col justify-center items-center">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-extrabold text-white mb-3">Project Initiation</h2>
                                <p className="text-slate-400 max-w-md mx-auto">
                                    Upload your architectural blueprints to begin the neural audit.
                                </p>
                            </div>
                            <div className="w-full max-w-xl">
                                <FloorPlanUploader onImagesGenerated={handleImagesGenerated} />
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-extrabold text-white mb-6">Validation Preview</h2>
                                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 bg-black/40 rounded-3xl border border-white/5 blueprint-grid-fine">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
                                                <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                <div className="absolute bottom-3 left-3 bg-hazard-orange text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase">
                                                    Page {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full md:w-80 space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-hazard-orange">
                                            <Building2 className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Building Context</span>
                                        </div>
                                        <select
                                            value={buildingType}
                                            onChange={(e) => setBuildingType(e.target.value)}
                                            className="w-full bg-slate-900/50 border-white/10 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hazard-orange focus:border-transparent outline-none transition-all appearance-none border"
                                        >
                                            <option value="Overview">Generic / Residential</option>
                                            <option value="Hospital">Hospital / Healthcare</option>
                                            <option value="Mall">Mall / Retail</option>
                                            <option value="Factory">Factory / Industrial</option>
                                            <option value="School">School / Educational</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-hazard-orange">
                                            <Ruler className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Engineering Scale</span>
                                        </div>
                                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                            <input
                                                type="number"
                                                value={pixelsPerMeter}
                                                onChange={(e) => setPixelsPerMeter(Number(e.target.value))}
                                                className="w-20 bg-transparent text-white font-bold text-lg outline-none"
                                            />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Pixels per <br /> meter (px/m)</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-hazard-orange">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Neural Engine</span>
                                        </div>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="w-full bg-slate-900/50 border-white/10 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-hazard-orange focus:border-transparent outline-none transition-all appearance-none border font-medium"
                                        >
                                            <option value="/models/omega_model.onnx">🔥 Omega v11 (Floor + Fire Safety) ⭐</option>
                                            <option value="/models/floorplan.onnx">🏗️ Architectural Base (Stable)</option>
                                            <option value="/models/fire_safety_omega.onnx">🛡️ Fire Safety Symbols Only</option>
                                            <option value="dual-omega">🔮 Integrated (v8) Accuracy Mode</option>
                                            <option value="/models/yolov11_complex.onnx">🏥 YOLOv11 Hospital/Complex Mode</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            onClick={() => setStep('upload')}
                                            className="flex-1 py-4 px-6 rounded-2xl border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCcw className="w-4 h-4" /> Reset
                                        </button>
                                        <button
                                            onClick={startAnalysis}
                                            className="flex-[2] py-4 px-6 rounded-2xl bg-hazard-orange text-white font-extrabold text-sm hover:shadow-[0_8px_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2"
                                        >
                                            Start AI Audit <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-hazard-orange/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative w-32 h-32 border-4 border-dashed border-hazard-orange/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                                    <div className="w-24 h-24 border-4 border-hazard-orange rounded-full flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-hazard-orange animate-spin" />
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-3">Auditing Compliance...</h2>
                            <p className="text-slate-400 font-medium">Neural networks mapping egress paths & room typography</p>
                        </div>
                    )}

                    {step === 'results' && analysisResults && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex flex-col xl:flex-row gap-10">
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-extrabold text-white leading-tight">Neural Audit Results</h2>
                                            <p className="text-slate-400 font-medium mt-1">
                                                Verified {analysisResults.rooms} rooms and {analysisResults.exits} egress points.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => generateTextReport(analysisResults)}
                                                className="px-4 py-4 rounded-2xl bg-slate-800 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-700 transition-all border border-white/5"
                                            >
                                                <Download className="w-4 h-4" /> TXT
                                            </button>
                                            <button
                                                onClick={() => generatePDFReport(analysisResults)}
                                                className="px-6 py-4 rounded-2xl bg-white text-charcoal-900 font-extrabold text-sm flex items-center gap-3 hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
                                            >
                                                <Download className="w-5 h-5" /> Export PDF
                                            </button>
                                        </div>
                                    </div>

                                    {/* Visual Map */}
                                    <div className="bg-black/60 rounded-[2rem] border border-white/5 overflow-hidden shadow-inner blueprint-grid-fine relative">
                                        <div className="p-4">
                                            <FloorPlanViewer
                                                imageSrc={images[0]}
                                                detections={analysisResults.detections}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full xl:w-96">
                                    <div className="glass bg-hazard-orange/10 border-hazard-orange/20 rounded-[2rem] p-8 h-full">
                                        <div className="flex items-start gap-4 mb-8">
                                            <div className="p-3 bg-hazard-orange rounded-2xl shadow-lg shadow-hazard-orange/20 text-white">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-extrabold text-white">Neural Inventory</h4>
                                                <p className="text-sm text-hazard-orange/80 font-bold uppercase tracking-wider">Source of Truth Analysis</p>
                                            </div>
                                        </div>

                                        {/* OCR RESULTS SECTION */}
                                        {analysisResults.roomNames && analysisResults.roomNames.length > 0 && (
                                            <div className="mb-8 bg-black/30 p-4 rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-2 text-sky-400 mb-3">
                                                    <Building2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Identified Room Labels</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysisResults.roomNames.map((name, i) => (
                                                        <span key={i} className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold rounded-lg group hover:bg-sky-500/20 transition-all cursor-default">
                                                            🔍 {name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {analysisResults.requirements.map((req, i) => (
                                                <div key={i} className="bg-charcoal-900/60 border border-white/5 p-5 rounded-2xl group hover:border-hazard-orange/30 transition-all">
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <span className="font-extrabold text-white text-sm leading-tight flex-1 group-hover:text-hazard-orange transition-colors">
                                                            {req.type}
                                                        </span>
                                                        <span className="bg-hazard-orange/20 text-hazard-orange px-2 py-1 rounded-lg text-xs font-black">
                                                            {req.count}x
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start gap-2 mb-3">
                                                        <AlertTriangle className="w-3 h-3 text-slate-500 mt-0.5" />
                                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium capitalize">
                                                            {req.reason}
                                                        </p>
                                                    </div>
                                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.15em] border-t border-white/5 pt-2">
                                                        REF: {req.regulation}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setStep('upload')}
                                            className="w-full mt-8 py-4 px-6 rounded-2xl border border-hazard-orange/20 text-hazard-orange font-extrabold text-sm hover:bg-hazard-orange/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCcw className="w-4 h-4" /> New Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
