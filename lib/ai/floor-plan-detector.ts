import * as ort from 'onnxruntime-web';

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    confidence: number;
}

export class FloorPlanDetector {
    private session: ort.InferenceSession | null = null;
    private modelPath: string;
    private labels: string[];

    constructor(
        modelPath: string = '/models/yolov11_complex.onnx',
        labels: string[] = []
    ) {
        this.modelPath = modelPath;
        this.labels = labels;

        // Set WASM paths for Next.js to find the .wasm files
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

        // Suppress non-fatal warnings
        ort.env.logLevel = 'error';
    }

    async loadModel() {
        if (this.session) return;

        try {
            console.log(`🧠 Calibrating Advanced AI Engine: ${this.modelPath}...`);
            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
            console.log(`✅ Engine Status: Operational (YOLO Architecture detected)`);

            // Auto-detect class count if tags not provided
            if (this.labels.length === 0) {
                const outputDims = this.session.outputNames.length > 0
                    ? this.session.outputMetadata[this.session.outputNames[0]].dims
                    : [];

                if (outputDims && outputDims.length >= 2) {
                    const classCount = (outputDims[1] as number) - 4;
                    console.log(`ℹ️ Auto-detected ${classCount} classes from model.`);
                    // Initialize with generic labels if none provided
                    this.labels = Array.from({ length: classCount }, (_, i) => `object_${i}`);
                }
            }
        } catch (e) {
            console.error('❌ Model Initialization Failure:', e);
            throw new Error(`Failed to load ONNX model: ${this.modelPath}. Ensure you have exported your YOLOv11 model to /public/models/`);
        }
    }

    async detect(imageSource: string | HTMLImageElement): Promise<Box[]> {
        if (!this.session) await this.loadModel();

        if (!this.session) {
            throw new Error('Model not initialized');
        }

        // Load image if it's a URL/Base64
        let image: HTMLImageElement;
        if (typeof imageSource === 'string') {
            image = await this.loadImage(imageSource);
        } else {
            image = imageSource;
        }

        console.log(`📸 Processing image: ${image.width}x${image.height}`);
        const tensor = this.preprocess(image);

        // Run inference
        const feeds: Record<string, ort.Tensor> = {};
        const inputNames = this.session.inputNames;
        feeds[inputNames[0]] = tensor;

        const startTime = performance.now();
        const results = await this.session.run(feeds);
        const endTime = performance.now();

        const output = results[this.session.outputNames[0]];
        console.log(`⏱️ Inference completed in ${(endTime - startTime).toFixed(1)}ms`);

        const boxes = this.postprocess(output, image.width, image.height);
        console.log(`🎯 Final detections: ${boxes.length}`);
        return boxes;
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    private preprocess(image: HTMLImageElement): ort.Tensor {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context failed');

        // YOLOv8 expected size
        canvas.width = 640;
        canvas.height = 640;
        ctx.drawImage(image, 0, 0, 640, 640);

        const imageData = ctx.getImageData(0, 0, 640, 640);
        const { data } = imageData;

        const input = new Float32Array(1 * 3 * 640 * 640);

        // NCHW format
        for (let i = 0; i < 640 * 640; i++) {
            const r = data[i * 4] / 255.0;
            const g = data[i * 4 + 1] / 255.0;
            const b = data[i * 4 + 2] / 255.0;

            input[i] = r;
            input[i + 640 * 640] = g;
            input[i + 2 * 640 * 640] = b;
        }

        return new ort.Tensor('float32', input, [1, 3, 640, 640]);
    }

    private postprocess(output: ort.Tensor, imgWidth: number, imgHeight: number): Box[] {
        const dims = output.dims;
        const data = output.data as Float32Array;

        const numAnchors = dims[2]; // 8400
        const numChannels = dims[1]; // 4 + N classes
        const numClasses = numChannels - 4;

        console.log(`📊 Model Metadata: Channels=${numChannels} (Classes=${numClasses}), Anchors=${numAnchors}`);
        if (numClasses !== this.labels.length) {
            console.error(`❌ Class Mismatch: Model expects ${numClasses} classes, but code provided ${this.labels.length}.`);
        }

        const boxes: Box[] = [];
        let highestConf = 0;

        for (let i = 0; i < numAnchors; i++) {
            let maxScore = 0;
            let maxClass = -1;

            // Start from index 4 (after x, y, w, h)
            for (let c = 4; c < numChannels; c++) {
                const score = data[c * numAnchors + i];
                if (score > maxScore) {
                    maxScore = score;
                    maxClass = c - 4;
                }
            }

            if (maxScore > highestConf) highestConf = maxScore;

            if (maxScore > 0.15) { // Lowered for debugging
                const x = data[0 * numAnchors + i];
                const y = data[1 * numAnchors + i];
                const w = data[2 * numAnchors + i];
                const h = data[3 * numAnchors + i];

                const x1 = (x - w / 2) / 640 * imgWidth;
                const y1 = (y - h / 2) / 640 * imgHeight;
                const w1 = w / 640 * imgWidth;
                const h1 = h / 640 * imgHeight;

                boxes.push({
                    x: x1,
                    y: y1,
                    w: w1,
                    h: h1,
                    label: this.getClassLabel(maxClass).toLowerCase(),
                    confidence: maxScore
                });
            }
        }

        console.log(`🔦 Post-processing: Highest raw confidence found: ${highestConf.toFixed(4)}`);
        console.log(`🔍 Candidates above threshold (0.15): ${boxes.length}`);

        const filtered = this.nms(boxes);

        if (filtered.length > 0) {
            console.group("🎯 AI DIAGNOSTIC RESULTS");
            console.table(filtered.map(b => ({
                Label: b.label,
                Confidence: `${Math.round(b.confidence * 100)}%`,
                Position: `[${Math.round(b.x)}, ${Math.round(b.y)}]`
            })));
            console.groupEnd();
        }

        return filtered;
    }

    private getClassLabel(classId: number): string {
        return this.labels[classId] || `class_${classId}`;
    }

    private nms(boxes: Box[]): Box[] {
        if (boxes.length === 0) return [];
        boxes.sort((a, b) => b.confidence - a.confidence);
        const result: Box[] = [];
        const visited = new Array(boxes.length).fill(false);

        for (let i = 0; i < boxes.length; i++) {
            if (visited[i]) continue;
            result.push(boxes[i]);
            visited[i] = true;

            for (let j = i + 1; j < boxes.length; j++) {
                if (visited[j]) continue;
                if (this.iou(boxes[i], boxes[j]) > 0.45) visited[j] = true;
            }
        }
        return result;
    }

    private iou(a: Box, b: Box): number {
        const x1 = Math.max(a.x, b.x);
        const y1 = Math.max(a.y, b.y);
        const x2 = Math.min(a.x + a.w, b.x + b.w);
        const y2 = Math.min(a.y + a.h, b.y + b.h);
        if (x2 < x1 || y2 < y1) return 0;
        const intersection = (x2 - x1) * (y2 - y1);
        const areaA = a.w * a.h;
        const areaB = b.w * b.h;
        return intersection / (areaA + areaB - intersection);
    }
}
