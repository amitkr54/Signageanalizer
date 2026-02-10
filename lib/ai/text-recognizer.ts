import { createWorker } from 'tesseract.js';

export class TextRecognizer {
    async recognize(imageSrc: string): Promise<string[]> {
        const worker = await createWorker('eng');

        // Preprocess
        let processedImage = imageSrc;
        try {
            processedImage = await this.preprocessImage(imageSrc);
        } catch (e) {
            console.error("Preprocessing failed", e);
        }

        const allResults: string[][] = [];

        // 1. Normal Scan (Horizontal Text)
        const { data: data0 } = await worker.recognize(processedImage);
        allResults.push(this.spatiallyMerge(data0.words));

        // 2. Rotated Scan (Vertical Text - 90 degrees)
        const rotatedImage90 = await this.rotateImage(processedImage, 90);
        const { data: data90 } = await worker.recognize(rotatedImage90);
        allResults.push(this.spatiallyMerge(data90.words));

        // 3. Rotated Scan (Vertical Text - 270 degrees)
        const rotatedImage270 = await this.rotateImage(processedImage, 270);
        const { data: data270 } = await worker.recognize(rotatedImage270);
        allResults.push(this.spatiallyMerge(data270.words));

        await worker.terminate();

        // Flatten all results and remove duplicates
        const uniqueLines = Array.from(new Set(allResults.flat()));
        return uniqueLines;
    }

    private spatiallyMerge(words: any[]): string[] {
        if (!words || words.length === 0) return [];

        // 1. Sort by Y (top to bottom) then X (left to right)
        const sorted = [...words].sort((a, b) => {
            const yDiff = a.bbox.y0 - b.bbox.y0;
            if (Math.abs(yDiff) > 15) return yDiff;
            return a.bbox.x0 - b.bbox.x0;
        });

        const lines: string[] = [];
        let currentLineText = "";
        let lastWord: any = null;

        sorted.forEach(word => {
            if (!lastWord) {
                currentLineText = word.text;
            } else {
                const yDiff = Math.abs(word.bbox.y0 - lastWord.bbox.y0);
                const xGap = word.bbox.x0 - lastWord.bbox.x1;

                // Dynamic Threshold: Calculate average character width
                const charWidth = (word.bbox.x1 - word.bbox.x0) / (word.text.length || 1);

                // If on same vertical level and relatively close
                if (yDiff < 20 && xGap < 60) {
                    // IF gap is tiny (shorter than half a character letter), merge WITHOUT space
                    if (xGap < charWidth * 0.5) {
                        currentLineText += word.text;
                    } else {
                        // Regular space for words
                        currentLineText += " " + word.text;
                    }
                } else {
                    if (currentLineText.trim().length > 2) {
                        lines.push(currentLineText.trim().replace(/\s+/g, ' '));
                    }
                    currentLineText = word.text;
                }
            }
            lastWord = word;
        });

        if (currentLineText.trim().length > 2) {
            lines.push(currentLineText.trim().replace(/\s+/g, ' '));
        }

        return lines;
    }

    private preprocessImage(src: string): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(src); return; }

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Simple Binarization (Thresholding)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const avg = (r + g + b) / 3;
                    // Threshold at 160 (light gray becomes white, dark gray becomes black)
                    const output = avg > 160 ? 255 : 0;
                    data[i] = output;
                    data[i + 1] = output;
                    data[i + 2] = output;
                }
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL());
            };
            img.onerror = () => resolve(src);
            img.crossOrigin = 'Anonymous';
            img.src = src;
        });
    }

    private rotateImage(src: string, degrees: number): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Swap dimensions for 90/270 degrees
                if (degrees === 90 || degrees === 270) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(src); return; }

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                resolve(canvas.toDataURL());
            };
            img.onerror = () => resolve(src);
            img.crossOrigin = 'Anonymous';
            img.src = src;
        });
    }

    findRoomTypes(texts: string[]): string[] {
        const roomKeywords = [
            'bedroom', 'kitchen', 'bathroom', 'toilet', 'living', 'dining',
            'office', 'storage', 'utility', 'garage', 'balcony', 'hall',
            'entry', 'foyer', 'lobby', 'corridor', 'pantry', 'laundry',
            'stair', 'staircase', 'stairwell', 'lift', 'elevator', 'exit', 'exe',
            'x-ray', 'mri', 'ultra', 'sound', 'er', 'emergency', 'waiting', 'patient', 'clinic', 'exam', 'consult'
        ];

        const identifiedRooms: string[] = [];

        texts.forEach(t => {
            const lower = t.toLowerCase();
            if (roomKeywords.some(k => lower.includes(k))) {
                identifiedRooms.push(t);
            }
        });

        return identifiedRooms;
    }
}
