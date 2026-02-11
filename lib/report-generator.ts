import jsPDF from 'jspdf';
import { AnalysisResult } from './fire-safety/calculator';

export function generatePDFReport(result: AnalysisResult) {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // --- BRANDING & HEADER ---
    // Hazard Orange Header Block
    doc.setFillColor(249, 115, 22); // Hazard Orange
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRE SAFETY AUDIT', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('ARCHITECTURAL COMPLIANCE REPORT', 20, 33);

    // Metadata
    doc.setTextColor(100, 116, 139); // Slate 400
    doc.setFontSize(9);
    doc.text(`REPORT ID: AD-${Math.random().toString(36).substring(7).toUpperCase()}`, 140, 25);
    doc.text(`GENERATED: ${date}`, 140, 30);
    doc.text('ENGINE: OMEGA MASTER AI v2.0', 140, 35);

    // --- EXECUTIVE SUMMARY SECTION ---
    let y = 55;
    doc.setTextColor(15, 23, 42); // Charcoal 900
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, y);

    doc.setDrawColor(249, 115, 22, 0.5);
    doc.setLineWidth(0.5);
    doc.line(20, y + 3, 60, y + 3);

    y += 15;

    // Stats Grid
    const stats = [
        { label: 'ROOMS DETECTED', value: result.rooms, icon: 'R' },
        { label: 'EGRESS POINTS', value: result.exits, icon: 'E' },
        { label: 'SIGNAGE REQUIRED', value: result.signageRequired, icon: 'S' }
    ];

    stats.forEach((stat, i) => {
        const x = 20 + (i * 60);
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.roundedRect(x, y, 50, 25, 3, 3, 'F');

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(stat.label, x + 5, y + 8);

        doc.setTextColor(249, 115, 22);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value.toString(), x + 5, y + 18);
    });

    // --- DETAILED REQUIREMENTS ---
    y += 45;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Inventory', 20, y);
    doc.line(20, y + 3, 60, y + 3);

    y += 15;

    // Table Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(20, y - 6, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNAGE COMPONENT', 25, y);
    doc.text('QTY', 110, y);
    doc.text('REGULATORY REF', 130, y);

    y += 12;

    // Table Rows
    result.requirements.forEach((req, idx) => {
        // Auto-paging
        if (y > 250) {
            doc.addPage();
            y = 30;
        }

        // Zebra striping
        if (idx % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(20, y - 6, 170, 22, 'F');
        }

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(req.type, 25, y);

        doc.setTextColor(249, 115, 22);
        doc.text(req.count.toString(), 110, y);

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(req.regulation, 130, y);

        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(9);
        const splitReason = doc.splitTextToSize(req.reason, 160);
        doc.text(splitReason, 25, y);

        y += 4 + (splitReason.length * 4);

        // Separator
        doc.setDrawColor(226, 232, 240);
        doc.line(20, y, 190, y);
        y += 10;
    });

    // Save (deferred)
    // doc.save(`Signage_Audit_${date.replace(/\//g, '-')}.pdf`);

    // --- NEW: AI VISION DIAGNOSTICS PAGE ---
    doc.addPage();
    y = 25;

    doc.setFillColor(15, 23, 42); // Charcoal
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AI VISION DIAGNOSTICS', 20, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('RAW MODEL INFERENCE & OCR STREAM', 20, 33);

    y = 55;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Raw AI Inventory (Source of Truth)', 20, y);
    doc.setDrawColor(249, 115, 22);
    doc.line(20, y + 2, 80, y + 2);

    y += 12;
    if (result.rawCounts) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        Object.entries(result.rawCounts).forEach(([label, count]) => {
            doc.setTextColor(100, 116, 139);
            doc.text(`• ${label.toUpperCase()}`, 25, y);
            doc.setTextColor(249, 115, 22);
            doc.setFont('helvetica', 'bold');
            doc.text(`${count} detections`, 80, y);
            doc.setFont('helvetica', 'normal');
            y += 8;
        });
    }

    y += 10;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Raw OCR Stream (Detected Text)', 20, y);
    doc.line(20, y + 2, 80, y + 2);

    y += 12;
    if (result.allTexts) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        result.allTexts.slice(0, 40).forEach((text) => { // Cap to avoid overflow
            if (y > 270) {
                doc.addPage();
                y = 30;
            }
            doc.text(`"${text}"`, 25, y);
            y += 6;
        });
    }

    doc.save(`AI_Vision_Audit_${date.replace(/\//g, '-')}.pdf`);
}

export function generateTextReport(result: AnalysisResult) {
    const timestamp = new Date().toLocaleString();
    const reportId = `AD-${Math.random().toString(36).substring(7).toUpperCase()}`;

    let content = `📑 OMEGA MASTER AI: FIRE SAFETY AUDIT REPORT
================================================
REPORT ID: ${reportId}
DATE: ${timestamp}
ENGINE: v2.1 (Neural Engineering)
------------------------------------------------

[1] EXECUTIVE SUMMARY
------------------------------------------------
• Total Rooms Identified: ${result.rooms}
• Egress Points (Stairs/Exits): ${result.exits}
• Total Safety Signage Required: ${result.signageRequired}

[2] COMPLIANCE INVENTORY
------------------------------------------------
`;

    result.requirements.forEach((req, idx) => {
        content += `${idx + 1}. [${req.type.toUpperCase()}]
   Quantity: ${req.count} units
   Regulation: ${req.regulation}
   Compliance Reason: ${req.reason}
   ------------------------------------------------\n`;
    });

    if (result.roomNames) {
        content += `\n[3] IDENTIFIED ROOMS
------------------------------------------------
`;
        if (result.roomNames.length > 0) {
            content += `• ${result.roomNames.join('\n• ')}\n`;
        } else {
            content += "[INFO] No specific room labels identified from OCR stream.\n";
        }
    }

    if (result.rawCounts && Object.keys(result.rawCounts).length > 0) {
        content += `\n[4] RAW AI INVENTORY (SOURCE OF TRUTH)
------------------------------------------------
`;
        Object.entries(result.rawCounts).forEach(([label, count]) => {
            content += `• ${label.toUpperCase()}: ${count} detections\n`;
        });
    }

    if (result.allTexts) {
        content += `\n[5] RAW OCR STREAM (ALL DETECTED STRINGS)
------------------------------------------------
`;
        if (result.allTexts.length > 0) {
            content += result.allTexts.map(t => `"${t}"`).join('\n');
        } else {
            content += "[INFO] No text strings detected by neural engine.";
        }
        content += "\n";
    }

    if (result.advancedOcr) {
        content += `\n[6] ADVANCED AI COMPARISON (PRECISION STREAM)
------------------------------------------------
ENGINE: ${result.advancedOcr.engine}
TOTAL DETECTIONS: ${result.advancedOcr.total_detections}
------------------------------------------------
${result.advancedOcr.stream.map(f => `[${f.confidence.toFixed(2)}] "${f.text}"`).join('\n')}
`;
    }

    content += `\n================================================
PROPRIETARY DATA | AI VISION DIAGNOSTICS
================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Vision_Audit_${reportId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}
