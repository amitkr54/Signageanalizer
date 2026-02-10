# Fire Safety Signage Guidelines & Reasoning Engine 🏛️⚖️

This document defines the "Reasoning Engine" logic used by the Signage Analyzer to suggest specific safety measures based on architectural floor plan analysis.

## 1. Regulatory Signage Logic (Why & Where)

| Signage Type | Placement Rule | Rationale / Fire Code Justification | AI Detection Strategy |
| :--- | :--- | :--- | :--- |
| **Exit / Fire Exit** | Above doors, lobby exits, stairwell entries. | **NBC Part 4 / NFPA 101**: Continuous path of egress must be visible from any point. | Door + Stair Detection |
| **Fire Extinguisher** | Every 15m (High Risk) or 30m (Low Risk). | **IS 2190**: Equipment must be visible from a distance and easily reachable. | Visual Symbol + Area Density |
| **Manual Call Point** | Near every exit door and staircase landing. | **IS 2189**: Alarm points must be placed on exit routes for immediate notification. | Near Exit Inference |
| **Do Not Use Lift** | Next to every elevator call button. | **NBC 2016**: Lifts are not safe for egress; danger of smoke trapping. | Lift/Elevator Detection |
| **Fire Hose Reel** | Inside corridors, near staircases. | **NBC Clause 4.12**: Accessibility to fire main is mandatory for internal fire fighting. | Hose/Hydrant Symbol |
| **Evacuation Map** | Main entrances, elevator lobbies, stair landings. | **ISO 23601**: People must understand their current location vs. exits in a panic. | Entry/Lobby Detection |
| **Floor Level ID** | Inside every stairwell at the landing. | **NBC 4.7.1**: Ensures firefighters and evacuees know which floor they are on. | Staircase Context |

---

## 2. Advanced Architectural Reasoning

To think like a consultant, the system applies these **"Inference Rules"**:

### A. The "Sightline" Rule
- **Problem**: A long corridor (>15m) without a visible exit.
- **Suggestion**: "Directional Exit Arrow (Wall Mounted)".
- **Reason**: Architects must ensure the "next step" is always visible even in smoke.

### B. The "Vertical Flow" Rule
- **Problem**: A staircase is detected as the primary egress.
- **Suggestion**: "Floor Level Signs" and "Wayfinding Maps".
- **Reason**: Stairs is where people lose their sense of floor number during a chaotic evacuation.

### C. The "Hazard Proximity" Rule
- **Problem**: AI detects a Server Room or Electrical DB Room.
- **Suggestion**: "Electrical Warning" + "DCP/CO2 Extinguisher".
- **Reason**: Standard water-based fire fighting can be fatal in electrical zones.

### D. The "Directional Junction" Rule
- **Problem**: A corridor branches into a T-junction or L-junction.
- **Suggestion**: "Wall Mounted Directional Sign with Arrows".
- **Reason**: **ISO 28564** requires directional help at every "Decision Point" where a user must choose a path.

### E. The "Dead-End" Rule
- **Problem**: A corridor extends >6m beyond an exit door (Dead End).
- **Suggestion**: "No Exit" sign or "Directional Arrow" pointing away from the dead end.
- **Reason**: Prevents people from getting trapped in smoke-filled dead-ends during a fire.

## 4. How to Make the System "Better" (Architectural Pro-Tips)

To move from "Average" to "Expert," the system must implement these capabilities:

### A. Auto-Scaling (The "Meter" Rule)
- **Problem**: AI knows pixels, not meters.
- **Solution**: Detect the `scale_bar` or `dimension_line`. 
- **The "Better" Logic**: Convert pixels to meters automatically. If "Travel Distance" is > 30m, flag with **Reason**: *"Breaks NBC Clause 4.5.1 for maximum egress distance."*

### B. View-Path Geometry (Sightlines)
- **Problem**: A sign is physically close but hidden by a column.
- **Solution**: Use **Raycasting** logic against detected `wall` and `column` objects.
- **The "Better" Logic**: If an Exit Sign is blocked by 40% of a wall segment, suggest: *"Install Suspended Dual-Sided Sign for visibility."*

### C. Occupancy Correlation
- **Problem**: We judge signs purely by room type.
- **Solution**: Calculate "Occupancy Load" based on room area.
- **The "Better" Logic**: If Area of `Office` > 100sqm, auto-suggest: *"Second Exit required per NBC Small Office rules."*

## 5. The "Builder's Final Check" (Planning the Egress)

Before we start "building" the AI, we must plan for these architectural "edge cases":

### A. Door Swing Direction (Egress Law)
- **The Rule**: Fire exit doors must open **outwards** (in the direction of escape).
- **The "Forgot the Room" Logic**: If AI detects a `door_swing` that opens into the room instead of the corridor, the system should flag: *"Compliance Warning: Exit door must swing in the direction of egress (NBC 4.7.2)."*

### B. Obstruction & Sightline Shadowing
- **The Rule**: You cannot place a fire extinguisher behind a column or a high-shelf furniture.
- **The "Forgot the Room" Logic**: Detect furniture and structural columns. If a sign is placed in the "shadow" of a column, suggest: *"Relocate sign to the face of the column for 180° visibility."*

### C. The "Panic Flow" (Bottlenecks)
- **The Rule**: At narrow bottlenecks, directional signage must be doubled up.
- **The "Forgot the Room" Logic**: Identify any corridor area < 1.5m wide where high-occupant rooms converge.

---

### 🛡️ Final Planning Audit:
1. [x] **Occupancy Logic** (Who is in the building?)
2. [x] **Symbol Alphabet** (What are we looking for?)
3. [x] **Mathematical Scale** (How far is it?)
4. [ ] **Multi-Floor Connectivity** (How do the stairs connect 1st Floor to Ground?)
