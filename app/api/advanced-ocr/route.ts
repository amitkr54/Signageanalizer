import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
    try {
        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
        }

        // 1. Save base64 to temp file
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const tempFilePath = path.join(process.cwd(), 'temp_ocr_upload.png');
        fs.writeFileSync(tempFilePath, buffer);

        // 2. Spawn Python process (PaddleOCR-lite implementation)
        const pythonPath = 'python';
        const scriptPath = path.join(process.cwd(), 'lib', 'ai', 'paddle_ocr_service.py');

        return new Promise((resolve) => {
            const pyProcess = spawn(pythonPath, [scriptPath, tempFilePath]);
            let resultData = '';
            let errorData = '';

            pyProcess.stdout.on('data', (data) => {
                resultData += data.toString();
            });

            pyProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pyProcess.on('close', (code) => {
                // Cleanup temp file
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }

                if (code !== 0) {
                    console.error(`Python process failed with code ${code}. Error: ${errorData}`);
                    resolve(NextResponse.json({
                        error: 'Advanced AI execution failed',
                        details: errorData,
                        success: False
                    }, { status: 500 }));
                    return;
                }

                try {
                    // Find the JSON block in the output (in case of warnings)
                    const jsonStart = resultData.indexOf('{');
                    const jsonEnd = resultData.lastIndexOf('}') + 1;
                    if (jsonStart === -1 || jsonEnd === 0) {
                        throw new Error('No valid JSON output found');
                    }
                    const jsonOutput = JSON.parse(resultData.substring(jsonStart, jsonEnd));
                    resolve(NextResponse.json(jsonOutput));
                } catch (err: any) {
                    console.error('Failed to parse Python output:', err);
                    resolve(NextResponse.json({
                        error: 'Failed to parse AI results',
                        raw: resultData,
                        success: false
                    }, { status: 500 }));
                }
            });
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
