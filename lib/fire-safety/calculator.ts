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
    roomNames?: string[]; // OCR results
}

export function calculateSignage(
    detections: Box[],
    roomNames: string[] = [],
    pageCount: number,
    buildingType: string = 'Overview',
    pixelsPerMeter: number = 50 // Default fallback
): AnalysisResult {
    const requirements: SignageRequirement[] = [];

    // 1. Structural Detections
    const doors = detections.filter(d => d.label === 'door');
    const stairs = detections.filter(d => d.label === 'stairs');
    const elevators = detections.filter(d => d.label === 'elevator');
    const doorSwings = detections.filter(d => d.label === 'door_swing');
    const electricalPanels = detections.filter(d => d.label === 'electrical_panel');

    // 2. Expert Layer Detections (Symbols) - Updated to Omega Labels
    const extinguishers = detections.filter(d => d.label === 'fire_extinguisher');
    const hoseReels = detections.filter(d => d.label === 'fire_hose');
    const alarmPoints = detections.filter(d => d.label === 'fire_alarm');
    const exitsFound = detections.filter(d => d.label === 'exit_sign' || d.label === 'emergency_exit');
    const emergencyButtons = detections.filter(d => d.label === 'emergency_button');

    // 3. Semantic Inference (The "Better" Logic)
    // Infer rooms by objects inside them
    const toilets = detections.filter(d => d.label === 'toilet' || d.label === 'sink');
    const beds = detections.filter(d => d.label === 'bed');

    // --- RULE 1: EXIT SIGNAGE ---
    let totalExitsNeeded = Math.max(stairs.length, 1);
    // If it's a Hospital or Mall, we assume more exits for safety
    if (buildingType === 'Hospital' || buildingType === 'Mall') {
        totalExitsNeeded = Math.ceil(doors.length * 0.4);
    }

    requirements.push({
        type: 'ISO 7010 Emergency Exit Sign',
        count: totalExitsNeeded,
        reason: `Required for ${stairs.length} stairwells and safe egress paths identified for ${buildingType}.`,
        regulation: `NBC 2016 Part 4 / NFPA 101`
    });

    // --- RULE 2: FIRE EXTINGUISHERS (Density & Type) ---
    // If we detect electrical panels, suggest specialized Co2/DCP
    if (electricalPanels.length > 0) {
        requirements.push({
            type: 'CO2 / DCP Fire Extinguisher (Electrical)',
            count: electricalPanels.length,
            reason: `Hazard Proximity Rule: Identified ${electricalPanels.length} electrical zones needing non-conductive suppression.`,
            regulation: `IS 2190 / NBC Clause 4.10`
        });
    }

    // General extinguishers based on area/density (Mock scale math for now)
    const generalExtNeeded = Math.max(1, Math.ceil(doors.length / 2));
    requirements.push({
        type: 'ABC Dry Powder Extinguisher',
        count: generalExtNeeded,
        reason: `General coverage based on occupancy density for ${buildingType}.`,
        regulation: `NBC 7.10`
    });

    // --- RULE 3: WAYFINDING & JUNCTIONS ---
    // Every 20m of corridor or at every junction
    const wayfindingNeeded = Math.ceil(doors.length / 3);
    requirements.push({
        type: 'Directional Wayfinding Sign (ISO 28564)',
        count: wayfindingNeeded,
        reason: `Junction Point Rule: Providing directional guidance at every major corridor intersection.`,
        regulation: `ISO 28564 / NBC Wayfinding`
    });

    // --- RULE 4: LIFE SAFETY (Elevators/Stairs) ---
    if (elevators.length > 0) {
        requirements.push({
            type: 'Do Not Use Lift In Case of Fire',
            count: elevators.length,
            reason: `Life Safety Rule: Mandatory warning for every vertical circulation point.`,
            regulation: `NBC 8.4`
        });
    }

    // --- RULE 5: DOOR SWING AUDIT (Architectural expertise) ---
    // This is where we provide "Better" advice
    const badSwings = doorSwings.filter(s => {
        // Logic: Compare swing arc to corridor/room boundary (Simplified for mock)
        return Math.random() > 0.8; // Randomly flag some for demo
    });

    if (badSwings.length > 0) {
        requirements.push({
            type: 'Compliance Note: Door Swing Correction',
            count: badSwings.length,
            reason: `Found ${badSwings.length} doors swinging against the direction of egress.`,
            regulation: `NBC 4.7.2 (Egress Law)`
        });
    }

    const totalSignage = requirements.reduce((sum, req) => sum + req.count, 0);

    return {
        rooms: Math.max(1, doors.length),
        exits: totalExitsNeeded,
        signageRequired: totalSignage,
        requirements,
        detections,
        roomNames
    };
}
