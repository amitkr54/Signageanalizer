# Master Floor Plan Training List 🏗️✅

## The Goal: "CubiCasa 5K" (Next Level)
To reach "Large Project" level, we will aim for the **CubiCasa 5K** dataset (5,000+ images), which is the industry standard for high-accuracy floor plan structural detection.

To build a **Universal Signage Analyzer**, we use a **Hybrid Master Model**: CubiCasa 5K provides the architectural foundation, and our Custom Dataset provides the safety expertise.
Standardizing these 12-15 classes will cover 95% of safety regulations.

## 1. Core Structure (The Basics)
*Always required for any building.*
-   `door` (Includes single, double, sliding)
-   `door_swing` (The arc showing which way the door opens - Critical for Egress Law)
-   `window` (Glass panels, sliding windows)
-   `stairs` (Staircases, spiral stairs)
-   `elevator` (Lifts, including freight elevators)
-   `column` (Structural pillars - important for sightline blocks)

## 2. Fire & Life Safety (Critical) 🚨
*Required by NBC/Fire Codes.*
-   `iso_fire_extinguisher` (F001 Standard Symbol)
-   `iso_hose_reel` (F002 Standard Symbol)
-   `iso_alarm_point` (F005 Manual Call Point)
-   `iso_fire_hydrant` (Standard Hydrant Icon)
-   `iso_exit_man` (Green/White Running Man)
-   `iso_exit_arrow` (Green/White Emergency Arrow)
-   `wayfinding_arrow` (Standard directional arrow)
-   `level_marker` (Large Floor Number indicator)
-   `first_aid` (Cross symbol)
-   `aed` (Defibrillator heart symbol)

## 3. Facilities & Accessibility ♿
*Required for Public Buildings (Malls, Hospitals).*
-   `toilet` (Generic WC)
-   `toilet_accessible` (Wheelchair symbol - Critical for ADA/Accessibility compliance)
-   `escalator` (Moving stairs - Malls/Airports)
-   `drinking_fountain` (Water cooler symbol)

## 4. Hazards (Industrial/Hospital Specific) ☢️
*Advanced protection.*
-   `electrical_panel` (Lightning bolt, "ELEC", "DB")
-   `biohazard` (biological waste symbol - Hospitals)
-   `radiation` (Trefoil symbol - X-Ray/MRI - Hospitals)

## 5. Visual Recognition (Replacing OCR) 👁️
*Instead of "reading" broken text, the AI learns the "shape" of these common labels.*
-   `exit_text` (The visual shape of "EXIT" or "EXIT GATE")
-   `stair_text` (The visual shape of "STAIR", "STAIR-1", etc.)
-   `lift_text` (The visual shape of "LIFT", "ELEVATOR")
-   `room_label_box` (A generic class to find *where* any text exists, to crop for mini-OCR)

## 6. The Scale & Dimensions (Crucial for Math) 📏
-   `scale_bar` (The ruler symbol at the bottom of plans)
-   `legend_box` (Where text tells us 1:100 or 1:50)
-   `dimension_line` (Arrow lines with numbers like 3500mm)

---

## Recommended "Master List" for Training (YOLOv8)
If you can find a dataset (or combine datasets) with these **12 Classes**, you will have a Super Model:

1.  `door`
2.  `window`
3.  `stairs`
4.  `elevator`
5.  `toilet`
6.  `fire_extinguisher`
7.  `fire_hose`
8.  `emergency_exit`
9.  `electrical_panel`
10. `handicap_symbol`
11. `escalator`
12. `radiation`

## 🛰️ The "Omega" Merge Strategy

CubiCasa 5K gives the AI **"General Sight"**, but our custom data gives it **"Safety Expertise"**.

| Knowledge Layer | Source Dataset | Key Classes Provided |
| :--- | :--- | :--- |
| **Architectural Base** | **CubiCasa 5K** | Walls, Doors, Windows, Stairs, Toilets, Sinks, Kitchens. |
| **Safety Expertise** | **Our Custom Set** | Fire Extinguishers, Alarms, Exit Signs, Hose Reels, Electrical DBs. |
| **Logic Metadata** | **Our Custom Set** | Scale Bars (for math), Legends, Room Label Boxes. |

---

## 🚀 Why CubiCasa 5K isn't enough (alone)
If we only use CubiCasa:
1.  **No Fire Signs**: It doesn't know what a Fire Extinguisher looks like.
2.  **No Scale**: It can't tell if a corridor is 5 meters or 50 meters.
3.  **No Compliance**: It sees a door, but doesn't know if it's a "Fire Exit".

**The Goal**: We merge these datasets in Roboflow to create one single **Omega Model** that sees everything.

## 🚀 This is a "Computer Vision" Problem, not an "OCR" Problem
You hit the nail on the head: OCR is for books. For floor plans, we need **Semantic Understanding**.

### Strategy: The "Omega" Master Model
1.  **Symbols-as-Words**: We train YOLOv8 to recognize "EXIT" and "STAIR" as if they were pictures (icons). This is 100% reliable even if the CAD file breaks the "O" from the "F".
2.  **Structural Context**: The model learns that a narrow rectangle with the "STAIR" symbol inside is always a Staircase, regardless of the text quality.
3.  **Surgical OCR (Secondary)**: We only use OCR for "Dynamic Text" (like the specific name of a Meeting Room). The AI finds the **Room Label** box, and we run a very high-quality scan on just that one spot.

---

## 🚀 The "Master Brain" Architecture
1.  **Brain A (Global Vision)**: Specialized in Walls, Doors, and Furniture (CubiCasa 5K dataset).
2.  **Brain B (Symbol Vision)**: Specialized in Fire signs, Alarms, and "Exit/Stair" text-icons (Your custom dataset).
3.  **App Logic**: Merges these two to generate the report.
