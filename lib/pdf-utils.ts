export async function convertPdfToImages(file: File): Promise<string[]> {
    // Dynamically import pdfjs-dist to avoid server-side issues with DOMMatrix/canvas
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker
    const pdfjsVersion = pdfjsLib.version || '4.0.379';
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    // Loop through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error('Could not create canvas context');

        await page.render({
            canvasContext: context,
            viewport: viewport,
        } as any).promise;

        images.push(canvas.toDataURL('image/png'));
    }

    return images;
}
