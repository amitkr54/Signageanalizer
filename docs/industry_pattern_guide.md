# Industry Pattern Guide: Fire Safety Symbols 🏗️🚒

To think like a professional architect or fire safety consultant, the system must recognize the standardized "Visual Alphabet" of safety plans. These symbols are the industry practice globally (ISO/NFPA) and in India (NBC/BIS).

## 1. Fire Protection Equipment (ISO 7010 / IS 12407)
These are the most common "Expert Layer" symbols found on professional Fire Protection Plans (FPP).

| Symbol Type | Class Name (for Training) | Visual Pattern |
| :--- | :--- | :--- |
| **Fire Extinguisher** | `iso_fire_extinguisher` | Red square with a white cylinder and flame icon. |
| **Fire Hose Reel** | `iso_hose_reel` | Red square with a white hose reel icon. |
| **Manual Call Point** | `iso_alarm_point` | Red square with a white circle/hand icon (Pull Station). |
| **Fire Hydrant** | `iso_fire_hydrant` | Red square with a white hydrant icon. |

## 2. Emergency & Exit Signage (NBC / ISO)
Architects use these to mark the "Egress Path" (the way out).

| Symbol Type | Class Name (for Training) | Visual Pattern |
| :--- | :--- | :--- |
| **Emergency Exit** | `iso_exit_man` | Green white "Running Man" leaning toward a door. |
| **Exit (Right/Left)** | `iso_exit_arrow` | Running man + Directional arrow. |
| **Assembly Point** | `iso_assembly_point` | Green square with 4 arrows pointing to a center group. |
| **Fire Door** | `iso_fire_door` | Standard door icon with a "Fire" or "FD" label. |

## 3. High-Expertise "Decision Points"
Professional plans often include these technical markers that typical OCR/AI misses.

- **`fpp_legend_box`**: The table where the architect defines what "FE" (Fire Extinguisher) or "H" (Hydrant) means.
- **`fpp_scale_ruler`**: The graphic scale (0m...5m...10m) used to verify "Travel Distance" compliance.
- **`fpp_zone_boundary`**: Think dashed lines showing "Fire Compartments" (how the fire is contained).

## 4. Directional & Wayfinding (ISO 28564)
Architects place these at "Decision Points" to guide people through the building.

| Symbol Type | Class Name (for Training) | Visual Pattern |
| :--- | :--- | :--- |
| **Directional Arrow** | `wayfinding_arrow` | Solid arrow (Up = Straight, Left/Right = Turn). |
| **Emergency Arrow** | `iso_exit_arrow` | White arrow on green background (ISO 7010). |
| **Level Indicator** | `level_marker` | Large number inside a circle or square (Floor 1, 2, 3). |
| **Decision Point** | `junction_node` | Any T-junction or L-junction in a corridor. |

## 4. How to Source "Professional" Training Data
Industry practice is to use **Standard CAD Blocks**.
- **Tip**: You can find "Fire Safety CAD Blocks" online. One PDF of these blocks contains 100+ perfect examples of `fire_extinguisher`, `alarm_point`, etc. 
- **The "Better" Way**: Train your model on these crisp CAD blocks *first*, then add real floor plan images. This makes your AI 10x more accurate at finding the "symbol" inside a complex drawing.
