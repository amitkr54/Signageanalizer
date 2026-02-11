'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@/lib/ai/floor-plan-detector';
import { cn } from '@/lib/utils';
import { Layers, Eye, EyeOff, ZoomIn, ZoomOut, Maximize, Move, Shield } from 'lucide-react';

interface FloorPlanViewerProps {
    imageSrc: string;
    detections: Box[];
}

export function FloorPlanViewer({ imageSrc, detections }: FloorPlanViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [showDebug, setShowDebug] = useState(false);

    const [layers, setLayers] = useState({
        safety: true,    // Doors, Exits, Stairs
        structure: true, // Walls, Columns, Windows
        text: true       // Dimensions, Text
    });

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImage(img);
            // Auto-fit on load
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = 600;
                const scale = Math.min(containerWidth / img.naturalWidth, containerHeight / img.naturalHeight);
                setZoom(Math.max(scale, 0.1));
            }
        };
    }, [imageSrc]);

    const draw = useCallback(() => {
        if (!image || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        detections.forEach(box => {
            const label = box.label.toLowerCase();
            const conf = Math.round(box.confidence * 100);

            // Debug mode displays ALL candidates with white outlines
            if (showDebug) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2 / (zoom || 1);
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(box.x, box.y, box.w, box.h);
                ctx.setLineDash([]);

                ctx.fillStyle = 'white';
                ctx.font = `${Math.max(10, 16 / (zoom || 1))}px Inter`;
                ctx.fillText(`${box.label} (${conf}%)`, box.x, box.y - (5 / (zoom || 1)));
            }

            let color = '#3182ce';
            let icon = '';
            let show = false;

            if (['door', 'sliding door', 'exit', 'stair case', 'stairs', 'elevator', 'bathroom'].includes(label)) {
                color = label === 'bathroom' ? '#8b5cf6' : '#22c55e';
                if (label === 'bathroom') icon = '🚻';
                else if (label === 'elevator') icon = '🛗';
                else if (label.includes('stair')) icon = '🪜';
                else icon = '🚪';
                show = layers.safety;
            } else if (['wall', 'curtain wall', 'column', 'window', 'railing'].includes(label)) {
                color = '#3b82f6';
                icon = '🏗️';
                show = layers.structure;
            } else if (['dimension', 'text'].includes(label)) {
                color = '#f59e0b';
                icon = '📝';
                show = layers.text;
            } else {
                show = layers.structure;
            }

            // Normal layer view (only if confidence > 0.35 or if debug is on)
            if (show && (box.confidence > 0.35 || showDebug)) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 4 / (zoom || 1);
                ctx.strokeRect(box.x, box.y, box.w, box.h);

                ctx.fillStyle = color;
                const text = `${icon} ${box.label} ${conf}%`;
                ctx.font = `bold ${Math.max(14, 24 / (zoom || 1))}px Inter, sans-serif`;
                const textWidth = ctx.measureText(text).width;

                ctx.fillRect(box.x, box.y - (32 / (zoom || 1)), textWidth + (12 / (zoom || 1)), (32 / (zoom || 1)));

                ctx.fillStyle = 'white';
                ctx.fillText(text, box.x + (6 / (zoom || 1)), box.y - (8 / (zoom || 1)));
            }
        });
    }, [image, detections, layers, zoom, showDebug]);

    useEffect(() => {
        if (image) {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                draw();
            }
        }
    }, [image, draw]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 5));
    };

    const resetView = () => {
        if (!image || !containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        const scale = containerWidth / image.naturalWidth;
        setZoom(scale);
        setOffset({ x: 0, y: 0 });
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                {/* Layer Controls */}
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">
                        <Layers className="w-3.5 h-3.5 text-hazard-orange" /> Layers:
                    </div>

                    {[
                        { key: 'safety', label: 'Safety', color: 'emerald' },
                        { key: 'structure', label: 'Arch', color: 'sky' },
                        { key: 'text', label: 'Text', color: 'amber' }
                    ].map(layer => (
                        <button
                            key={layer.key}
                            onClick={() => setLayers(prev => ({ ...prev, [layer.key]: !prev[layer.key as keyof typeof layers] }))}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all",
                                layers[layer.key as keyof typeof layers]
                                    ? `bg-${layer.color}-500/20 border-${layer.color}-500/30 text-${layer.color}-400`
                                    : "bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10"
                            )}
                        >
                            {layers[layer.key as keyof typeof layers] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {layer.label}
                        </button>
                    ))}

                    <div className="h-4 w-[1px] bg-white/10 mx-2" />

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all",
                            showDebug
                                ? "bg-red-500/20 border-red-500/30 text-red-400"
                                : "bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10"
                        )}
                    >
                        <Shield className="w-3 h-3" />
                        AI Diagnostics
                    </button>
                </div>

                {/* Navigation Controls... remains same */}

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                        <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors" title="Zoom Out">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <div className="px-2 text-xs font-black text-white w-12 text-center">
                            {Math.round(zoom * 100)}%
                        </div>
                        <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors" title="Zoom In">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                    <button onClick={resetView} className="p-2.5 bg-black/40 hover:bg-white/10 rounded-xl border border-white/10 text-slate-400 transition-colors" title="Reset View">
                        <Maximize className="w-4 h-4" />
                    </button>
                    <div className="flex items-center h-10 px-3 bg-hazard-orange/10 rounded-xl border border-hazard-orange/20">
                        <Move className="w-3.5 h-3.5 text-hazard-orange mr-2" />
                        <span className="text-[10px] font-bold text-hazard-orange uppercase tracking-wider">Drag to Pan</span>
                    </div>
                </div>
            </div>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative w-full h-[600px] overflow-hidden bg-slate-950/80 rounded-2xl border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing group"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="absolute transition-transform duration-75 ease-out origin-top-left"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className="block"
                    />
                </div>

                {/* HUD Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {image ? `${image.naturalWidth}x${image.naturalHeight}` : '--'}
                    </div>
                </div>
            </div>
        </div>
    );
}
