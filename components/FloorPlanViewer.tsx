'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '@/lib/ai/floor-plan-detector';
import { cn } from '@/lib/utils';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface FloorPlanViewerProps {
    imageSrc: string;
    detections: Box[];
}

export function FloorPlanViewer({ imageSrc, detections }: FloorPlanViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [layers, setLayers] = useState({
        safety: true,    // Doors, Exits, Stairs
        structure: true, // Walls, Columns, Windows
        text: true       // Dimensions, Text
    });

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => setImage(img);
    }, [imageSrc]);

    useEffect(() => {
        if (!image || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions to match image natural size
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Draw image
        ctx.drawImage(image, 0, 0);

        // Draw detections based on layers
        detections.forEach(box => {
            const label = box.label.toLowerCase();
            let color = '#3b82f6'; // blue default
            let icon = '';
            let show = false;
            let type = 'structure';

            // SAFETY & FACILITIES LAYER
            if (['door', 'sliding door', 'exit', 'stair case', 'stairs', 'elevator', 'bathroom'].includes(label)) {
                color = label === 'bathroom' ? '#8b5cf6' : '#22c55e'; // purple for bathroom, green for others

                if (label === 'bathroom') icon = '🚻';
                else if (label === 'elevator') icon = '🛗';
                else if (label.includes('stair')) icon = '🪜';
                else icon = '🚪';

                type = 'safety';
                show = layers.safety;
            }
            // STRUCTURE LAYER
            else if (['wall', 'curtain wall', 'column', 'window', 'railing'].includes(label)) {
                color = '#3b82f6'; // blue
                icon = '🏗️';
                type = 'structure';
                show = layers.structure;
            }
            // TEXT LAYER
            else if (['dimension', 'text'].includes(label)) {
                color = '#f59e0b'; // amber
                icon = '📝';
                type = 'text';
                show = layers.text;
            }
            // FALLBACK
            else {
                show = layers.structure;
            }

            if (show) {
                // Box
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.strokeRect(box.x, box.y, box.w, box.h);

                // Label background
                ctx.fillStyle = color;
                const conf = Math.round(box.confidence * 100);
                const text = `${icon} ${box.label} ${conf}%`;
                ctx.font = 'bold 24px Arial';
                const textWidth = ctx.measureText(text).width;

                // Draw label above box
                ctx.fillRect(box.x, box.y - 32, textWidth + 12, 32);

                // Label text
                ctx.fillStyle = 'white';
                ctx.fillText(text, box.x + 6, box.y - 8);
            }
        });
    }, [image, detections, layers]);

    return (
        <div className="space-y-4">
            {/* Layer Controls */}
            <div className="flex flex-wrap gap-4 justify-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mr-2">
                    <Layers className="w-4 h-4" /> Visible Layers:
                </div>

                <label className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition select-none border",
                    layers.safety ? "bg-green-100 border-green-200 text-green-700" : "bg-gray-100 border-transparent text-gray-400"
                )}>
                    <input type="checkbox" className="hidden" checked={layers.safety} onChange={e => setLayers(prev => ({ ...prev, safety: e.target.checked }))} />
                    {layers.safety ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Safety (Doors/Stairs/Lifts)
                </label>

                <label className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition select-none border",
                    layers.structure ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-gray-100 border-transparent text-gray-400"
                )}>
                    <input type="checkbox" className="hidden" checked={layers.structure} onChange={e => setLayers(prev => ({ ...prev, structure: e.target.checked }))} />
                    {layers.structure ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Structure (Walls/Columns)
                </label>

                <label className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition select-none border",
                    layers.text ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-gray-100 border-transparent text-gray-400"
                )}>
                    <input type="checkbox" className="hidden" checked={layers.text} onChange={e => setLayers(prev => ({ ...prev, text: e.target.checked }))} />
                    {layers.text ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    Text/Dimensions
                </label>
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="relative w-full overflow-hidden bg-white/50 rounded-lg border border-gray-200 shadow-inner">
                <canvas
                    ref={canvasRef}
                    className="w-full h-auto block"
                    style={{ maxHeight: '600px', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
}
