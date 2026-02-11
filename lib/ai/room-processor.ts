/**
 * Identifies architectural room types from OCR text strings.
 */
export function identifyRoomTypes(texts: string[]): string[] {
    const roomKeywords = [
        'bedroom', 'kitchen', 'bathroom', 'toilet', 'living', 'dining',
        'office', 'storage', 'utility', 'garage', 'balcony', 'hall',
        'entry', 'foyer', 'lobby', 'corridor', 'pantry', 'laundry',
        'stair', 'staircase', 'stairwell', 'lift', 'elevator', 'exit', 'exe',
        'v.c.', 'w.c.', 'st-', 'fhc', 'el-',
        'x-ray', 'mri', 'ultra', 'sound', 'er', 'emergency', 'waiting', 'patient', 'clinic', 'exam', 'consult', 'cabin',
        'intensive care', 'icu', 'ward', 'ot', 'operation', 'pharmacy', 'lab'
    ];

    const identifiedRooms: string[] = [];

    texts.forEach(t => {
        const lower = t.toLowerCase().trim();
        // Check if the text contains any keyword, but also filter out very short junk
        if (lower.length >= 2 && roomKeywords.some(k => lower.includes(k))) {
            identifiedRooms.push(t);
        }
    });

    // Remove duplicates
    return [...new Set(identifiedRooms)];
}
