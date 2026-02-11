'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2, Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { convertPdfToImages } from '@/lib/pdf-utils';

interface FloorPlanUploaderProps {
    onImagesGenerated: (images: string[]) => void;
    className?: string;
}

export function FloorPlanUploader({ onImagesGenerated, className }: FloorPlanUploaderProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            if (file.type === 'application/pdf') {
                const images = await convertPdfToImages(file);
                onImagesGenerated(images);
            } else if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result && typeof e.target.result === 'string') {
                        onImagesGenerated([e.target.result]);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                setError('Please upload a PDF or an image file.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to process file. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [onImagesGenerated]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
        },
        maxFiles: 1,
    });

    return (
        <div className={cn("w-full mx-auto group", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative overflow-hidden border-2 border-dashed rounded-[2rem] p-12 transition-all duration-500 cursor-pointer min-h-[300px] flex flex-col items-center justify-center",
                    isDragActive
                        ? "border-hazard-orange bg-hazard-orange/5 shadow-[0_0_30px_rgba(249,115,22,0.1)]"
                        : "border-white/10 bg-slate-900/40 hover:border-hazard-orange/50 hover:bg-slate-900/60",
                    loading && "opacity-50 pointer-events-none"
                )}
            >
                <input {...getInputProps()} />

                {/* Decorative background */}
                <div className="absolute inset-0 blueprint-grid-fine opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/40 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl",
                        isDragActive ? "bg-hazard-orange scale-110" : "bg-slate-800 group-hover:bg-slate-700"
                    )}>
                        {loading ? (
                            <Loader2 className="h-10 w-10 text-hazard-orange animate-spin" />
                        ) : (
                            <Upload className={cn("h-10 w-10 transition-colors", isDragActive ? "text-white" : "text-hazard-orange")} />
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight">
                            {loading ? 'Processing Geometry...' : 'Neural Dropzone'}
                        </h3>
                        <p className="text-slate-400 font-medium text-sm">
                            Initialize analysis by uploading floor plan documentation
                        </p>
                    </div>

                    <div className="flex items-center gap-6 py-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
                            <FileText className="w-3.5 h-3.5 text-hazard-orange" />
                            Architectural PDF
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
                            <ImageIcon className="w-3.5 h-3.5 text-hazard-orange" />
                            IMG (JPG, PNG)
                        </div>
                    </div>

                    {error && (
                        <div className="text-hazard-red text-xs bg-hazard-red/10 border border-hazard-red/20 px-4 py-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex items-center gap-3 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">End-to-End Encrypted Edge Analysis</span>
                    </div>
                </div>

                {/* Animated corner accents */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-hazard-orange/30 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-hazard-orange/30 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-hazard-orange/30 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-hazard-orange/30 rounded-br-lg" />
            </div>
        </div>
    );
}
