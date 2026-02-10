'use client';

import { useState } from 'react';
import { FloorPlanUploader } from './FloorPlanUploader';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FloorPlanDetector, Box } from '@/lib/ai/floor-plan-detector';
import { calculateSignage, AnalysisResult } from '@/lib/fire-safety/calculator';
import { generatePDFReport } from '@/lib/report-generator';
import { FloorPlanViewer } from './FloorPlanViewer';
import { TextRecognizer } from '@/lib/ai/text-recognizer';

export function AnalysisFlow() {
    const [step, setStep] = useState<'upload' | 'preview' | 'analyzing' | 'results'>('upload');
    const [images, setImages] = useState<string[]>([]);
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
    const [buildingType, setBuildingType] = useState<string>('Overview');
    const [pixelsPerMeter, setPixelsPerMeter] = useState<number>(50); // Scale Foundation

    const handleImagesGenerated = (generatedImages: string[]) => {
        setImages(generatedImages);
        setStep('preview');
    };



    // ... class definition ...

    const startAnalysis = async () => {
        setStep('analyzing');

        try {
            // 1. Define Labels for both models
            const masterLabels = [
                'door', 'window', 'stairs', 'elevator', 'column', 'door_swing',
                'wall', 'opening', 'railing', 'floor', 'room', 'area'
            ];

            const safetyLabels = [
                'exit_sign', 'fire_extinguisher', 'fire_alarm',
                'emergency_button', 'fire_hose', 'emergency_exit'
            ];

            // 2. Initialize both specialized brains
            const masterDetector = new FloorPlanDetector('/models/cubicasa_master.onnx', masterLabels);
            const safetyDetector = new FloorPlanDetector('/models/fire_safety_omega.onnx', safetyLabels);
            const textRecognizer = new TextRecognizer();

            const allDetections: Box[] = [];
            const allTexts: string[] = [];

            // Process each page
            for (const imageSrc of images) {
                // Run Master Structure + Safety Features + OCR in parallel!
                const [masterDetections, safetyDetections, texts] = await Promise.all([
                    masterDetector.detect(imageSrc),
                    safetyDetector.detect(imageSrc),
                    textRecognizer.recognize(imageSrc)
                ]);

                allDetections.push(...masterDetections, ...safetyDetections);
                allTexts.push(...texts);
            }

            // Identify room types from text
            const roomNames = textRecognizer.findRoomTypes(allTexts);

            // Calculate signage based on combined detections
            const results = calculateSignage(allDetections, roomNames, images.length, buildingType, pixelsPerMeter);

            setAnalysisResults(results);
            setStep('results');
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analysis failed. See console for details.");
            setStep('preview');
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
            <div className="p-8">
                {/* Progress Steps */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0" />
                    {['Upload', 'Preview', 'Analysis', 'Report'].map((s, i) => {
                        const currentStepIndex = ['upload', 'preview', 'analyzing', 'results'].indexOf(step);
                        const isCompleted = i < currentStepIndex;
                        const isCurrent = i === currentStepIndex;

                        return (
                            <div key={s} className="relative z-10 flex flex-col items-center bg-white px-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                    isCompleted ? "bg-green-500 text-white" :
                                        isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-200 text-gray-500"
                                )}>
                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={cn(
                                    "text-xs mt-2 font-medium",
                                    isCurrent ? "text-blue-600" : "text-gray-500"
                                )}>{s}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="mt-8">
                    {step === 'upload' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">Upload Floor Plan</h2>
                            <p className="text-gray-500 mb-8">Upload a PDF or image of your building layout</p>
                            <FloorPlanUploader onImagesGenerated={handleImagesGenerated} />
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">Review Floor Plan</h2>
                            <p className="text-gray-500 mb-6">We successfully processed {images.length} page(s)</p>

                            <div className="flex justify-center mb-8">
                                <div className="w-64 text-left">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Building Type / Zone</label>
                                    <select
                                        value={buildingType}
                                        onChange={(e) => setBuildingType(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    >
                                        <option value="Overview">Generic / Residential</option>
                                        <option value="Hospital">Hospital / Healthcare</option>
                                        <option value="Mall">Mall / Retail</option>
                                        <option value="Factory">Factory / Industrial</option>
                                        <option value="School">School / Educational</option>
                                    </select>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Scale (pixels per meter)</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="number"
                                                value={pixelsPerMeter}
                                                onChange={(e) => setPixelsPerMeter(Number(e.target.value))}
                                                className="w-24 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            />
                                            <span className="text-xs text-gray-500">Typical values: 50-150. Used for travel distance checks.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-8 max-h-[300px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video bg-white shadow-sm rounded-lg overflow-hidden border">
                                        <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-contain" />
                                        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                                            Page {idx + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={startAnalysis}
                                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                                >
                                    Start Analysis
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className="text-center py-12">
                            <div className="inline-block relative">
                                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    🏗️
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Analyzing Floor Plan...</h2>
                            <p className="text-gray-500">Detecting rooms, exits, and safety equipment</p>
                        </div>
                    )}

                    {step === 'results' && analysisResults && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Analysis Complete!</h2>
                            <p className="text-gray-500 mb-8">
                                We found {analysisResults.rooms} rooms and {analysisResults.exits} exits.
                            </p>

                            {/* Visual Analysis Section */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-semibold mb-3 text-left">Visual Analysis</h3>
                                <div className="max-h-[500px] overflow-auto">
                                    <FloorPlanViewer
                                        imageSrc={images[0]}
                                        detections={analysisResults.detections}
                                    />
                                    {images.length > 1 && (
                                        <p className="text-xs text-gray-400 mt-2">Showing page 1 of {images.length}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-900">Signage Requirements</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Based on NBC regulations, this floor plan requires <strong>{analysisResults.signageRequired} safety signs</strong>.
                                        </p>
                                        <ul className="mt-3 space-y-3">
                                            {analysisResults.requirements.map((req, i) => (
                                                <li key={i} className="text-sm border-b border-yellow-200 pb-2 last:border-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-yellow-900">{req.type}</span>
                                                        <span className="bg-yellow-200 px-2 py-0.5 rounded-full text-xs font-bold text-yellow-900">{req.count}x</span>
                                                    </div>
                                                    <p className="text-xs text-yellow-800 italic mb-1">“{req.reason}”</p>
                                                    <p className="text-[10px] text-yellow-600 font-mono uppercase">Ref: {req.regulation}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Debug / Info Section */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-left text-xs text-gray-500 overflow-hidden">
                                <details>
                                    <summary className="cursor-pointer font-medium hover:text-gray-700 select-none">
                                        View Detected Rooms / Text ({analysisResults.roomNames?.length || 0})
                                    </summary>
                                    <div className="mt-2 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {analysisResults.roomNames?.map((name, i) => (
                                            <div key={i} className="bg-white border rounded px-2 py-1 truncate" title={name}>
                                                {name}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Start New
                                </button>
                                <button
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                    onClick={() => generatePDFReport(analysisResults)}
                                >
                                    Download Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
