import { Box } from '@/lib/ai/floor-plan-detector';

export interface SignageRequirement {
    type: string;
    count: number;
    reason: string;
    regulation: string;
}

export interface AnalysisResult {
    rooms: number;
    exits: number;
    signageRequired: number;
    requirements: SignageRequirement[];
    detections: Box[];
    roomNames?: string[]; // Logically identified rooms
    allTexts?: string[]; // Raw OCR text stream
    rawCounts?: Record<string, number>; // Frequency of every label found
    advancedOcr?: {
        engine: string;
        total_detections: number;
        stream: Array<{ text: string; confidence: number; bbox: number[][] }>;
    };
}

export function calculateSignage(
    detections: Box[],
    roomNames: string[] = [],
    pageCount: number,
    buildingType: string = 'Overview',
    pixelsPerMeter: number = 50, // Default fallback
    allTexts: string[] = []
): AnalysisResult {
    const requirements: SignageRequirement[] = [];

    // --- RAW STATISTICS (THE NEW FOCUS) ---
    const rawCounts: Record<string, number> = {};
    detections.forEach(d => {
        rawCounts[d.label] = (rawCounts[d.label] || 0) + 1;
    });

    // 1. Structural Detections
    const doors = detections.filter(d => d.label === 'door');
    const stairs = detections.filter(d => d.label === 'stairs');
    const elevators = detections.filter(d => d.label === 'elevator');
    const electricalPanels = detections.filter(d => d.label === 'electrical_panel');

    // --- NBC 2016 PART 4 GUIDELINES ---
    const totalExitsNeeded = Math.max(stairs.length, 1);

    // Rule 1: Exit Signage
    requirements.push({
        type: 'ISO 7010 Emergency Exit Sign',
        count: totalExitsNeeded,
        reason: stairs.length > 0
            ? `Required for ${stairs.length} detected stairwells.`
            : `Mandatory minimum for egress path.`,
        regulation: `NBC 2016 Part 4`
    });

    // Rule 2: Extinguishers
    const extNeeded = Math.max(2, Math.ceil(doors.length / 1.5));
    requirements.push({
        type: 'ABC Dry Powder Extinguisher',
        count: extNeeded,
        reason: `Coverage for ${doors.length} identified zones within 15m travel distance.`,
        regulation: `NBC Part 4 / IS 2190`
    });

    const totalSignage = requirements.reduce((sum, req) => sum + req.count, 0);

    return {
        rooms: Math.max(1, doors.length),
        exits: totalExitsNeeded,
        signageRequired: totalSignage,
        requirements,
        detections,
        roomNames,
        allTexts,
        rawCounts
    };
}
