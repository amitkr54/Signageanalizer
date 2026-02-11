import sys
import os
import json
import logging
import cv2
import numpy as np
from paddleocr import PaddleOCR

# Suppress logging to keep stdout clean for JSON output
logging.getLogger('ppocr').setLevel(logging.ERROR)

def run_paddle_ocr(image_path):
    try:
        if not os.path.exists(image_path):
            print(json.dumps({"error": f"File not found: {image_path}", "success": False}))
            return

        # Initialize PaddleOCR with lite models
        # use_angle_cls=True helps with rotated text common in floor plans
        ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False, show_log=False)
        
        # Run inference
        result = ocr.ocr(image_path, cls=True)
        
        # Format results
        findings = []
        if result and result[0]:
            for line in result[0]:
                bbox = line[0] # [[x,y], [x,y], [x,y], [x,y]]
                text = line[1][0]
                prob = line[1][1]
                
                findings.append({
                    "text": text,
                    "confidence": round(float(prob), 4),
                    "bbox": [list(map(int, pt)) for pt in bbox]
                })

        # Sort findings by Y then X for logical reading order
        findings.sort(key=lambda x: (x["bbox"][0][1], x["bbox"][0][0]))
        
        output = {
            "engine": "PaddleOCR-Lite",
            "total_detections": len(findings),
            "stream": findings,
            "success": True
        }
        
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided", "success": False}))
    else:
        run_paddle_ocr(sys.argv[1])
