'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
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
            // Check file type
            if (file.type === 'application/pdf') {
                const images = await convertPdfToImages(file);
                onImagesGenerated(images);
            } else if (file.type.startsWith('image/')) {
                // Handle direct image uploads
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
        <div className={cn("w-full mx-auto", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center",
                    isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
                    loading && "opacity-50 pointer-events-none"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-gray-100">
                        {loading ? (
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        ) : (
                            <Upload className="h-8 w-8 text-blue-500" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {loading ? 'Processing Floor Plan...' : 'Upload Floor Plan'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Drag & drop or click to select
                        </p>
                    </div>

                    <div className="flex gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF</span>
                        <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> JPG, PNG</span>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full flex items-center gap-2">
                            <X className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
