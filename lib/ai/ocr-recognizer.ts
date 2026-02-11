import * as ort from 'onnxruntime-web';

/**
 * OCRRecognizer handles character recognition for small text crops.
 * It is designed to work in tandem with YOLOv11 text detection.
 */
export class OCRRecognizer {
    private session: ort.InferenceSession | null = null;
    private modelPath: string;

    // Default alphabet for standard English OCR models (CRNN/SVTR)
    private characters: string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_=+[]{}|;:',.<>?/\" ";
    private charList: string[];

    constructor(modelPath: string = '/models/ocr_recognizer.onnx') {
        this.modelPath = modelPath;
        // The alphabet usually starts with a blank character for CTC decoding
        this.charList = ["", ...this.characters.split("")];
    }

    async loadModel() {
        if (this.session) return;
        try {
            console.log(`🔡 Loading Mini-OCR Recognizer: ${this.modelPath}...`);
            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
            console.log("✅ OCR Engine: Operational");
        } catch (e) {
            console.error("❌ OCR Model Load Failed:", e);
        }
    }

    /**
     * Recognizes text from a base64 image or HTMLImageElement
     */
    async recognize(imageSource: string | HTMLCanvasElement): Promise<string> {
        if (!this.session) await this.loadModel();
        if (!this.session) return "";

        const tensor = await this.preprocess(imageSource);

        const feeds: Record<string, ort.Tensor> = {};
        feeds[this.session.inputNames[0]] = tensor;

        const results = await this.session.run(feeds);
        const output = results[this.session.outputNames[0]];

        return this.decodeCTC(output);
    }

    /**
     * OCR Models typically expect Grayscale 32x100 or 48x128 images
     */
    private async preprocess(source: string | HTMLCanvasElement): Promise<ort.Tensor> {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas fail');

        // Standard OCR input size
        canvas.width = 100;
        canvas.height = 32;

        if (typeof source === 'string') {
            const img = new Image();
            img.src = source;
            await new Promise((r) => (img.onload = r));
            ctx.drawImage(img, 0, 0, 100, 32);
        } else {
            ctx.drawImage(source, 0, 0, 100, 32);
        }

        const imageData = ctx.getImageData(0, 0, 100, 32);
        const { data } = imageData;
        const input = new Float32Array(1 * 1 * 32 * 100);

        // Convert to Grayscale and Normalize
        for (let i = 0; i < 32 * 100; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            // Gray = 0.299R + 0.587G + 0.114B
            const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
            input[i] = (gray - 0.5) / 0.5; // Simple normalization
        }

        return new ort.Tensor('float32', input, [1, 1, 32, 100]);
    }

    /**
     * Decodes the raw model output using Connectionist Temporal Classification (CTC)
     */
    private decodeCTC(output: ort.Tensor): string {
        const data = output.data as Float32Array;
        const dims = output.dims; // [1, sequence_length, num_classes]

        const seqLen = dims[1] as number;
        const numClasses = dims[2] as number;

        let lastCharIndex = 0;
        let text = "";

        for (let i = 0; i < seqLen; i++) {
            let maxProb = -1;
            let maxIdx = 0;

            for (let c = 0; c < numClasses; c++) {
                const prob = data[i * numClasses + c];
                if (prob > maxProb) {
                    maxProb = prob;
                    maxIdx = c;
                }
            }

            // CTC Logic: Skip blanks (0) and repeated characters
            if (maxIdx !== 0 && maxIdx !== lastCharIndex) {
                text += this.charList[maxIdx] || "";
            }
            lastCharIndex = maxIdx;
        }

        return text;
    }
}
