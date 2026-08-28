import os
import base64
import gzip

def build_level():
    # ── Level Header Settings ──────────────────────────────────────────────
    # Defines the background color, ground color, and custom color channels:
    # Color 1: Sky Blue/Cyan (0, 220, 255)
    # Color 2: Deep Indigo/Purple (50, 30, 90)
    # Color 3: Pure White (255, 255, 255)
    # Color 4: Soft Pastel Pink (255, 180, 240) with Blending enabled (key 5 = 1)
    header = (
        "kS38,"
        "1_0_1_220_1_255_2_50_2_30_2_90_3_255_3_255_3_255_4_255_4_180_4_240_4_1_5_255_5_255_5_255,"
        "kA13,0,kA15,0,kA16,0,kA14,0,kA6,0,kA7,0,kA17,1,kA18,0,kS39,0,kA2,0,kA3,0,kA8,0,kA4,0,"
        "kA9,30,kA11,0,kA10,0,kA23,0,kA24,0"
    )

    objects = []

    def add_object(obj_id, x, y, extra=""):
        obj_str = f"1,{obj_id},2,{x},3,{y}"
        if extra:
            obj_str += f",{extra}"
        objects.append(obj_str)

    # ── Custom Block Builder ───────────────────────────────────────────────
    # Generates the photo-inspired custom blocks:
    # - Solid dark purple body (Color Channel 2)
    # - White top line highlight (Color Channel 3)
    # - Floating pastel pink detail squares (Color Channel 4)
    def build_custom_pillar(start_x, width_blocks, height_blocks):
        for w in range(width_blocks):
            x = start_x + (w * 30)
            for h in range(height_blocks):
                y = 15 + (h * 30)
                # Base solid block (Color 2 for dark purple)
                add_object(1, x, y, "21,2") 
                
                # If top block, add the white top line highlight (using ID 208 line/dash, Color 3)
                if h == height_blocks - 1:
                    add_object(208, x, y + 15, "21,3")
            
            # Add some floating pink squares on the sides (Color 4, blending)
            # Offset slightly to float in the air
            add_object(211, start_x - 15, 30, "21,4")
            add_object(211, start_x + (width_blocks * 30) + 10, 60, "21,4")

    # ── Compile Level Layout ───────────────────────────────────────────────
    # We will build a series of these custom pillars and platforms!
    
    # Pillar 1 (Cube platform)
    build_custom_pillar(300, 4, 3)
    
    # Spike on top of Pillar 1 (standard spike ID 8, colored cyan Color 1)
    add_object(8, 360, 105, "21,1")
    
    # Pillar 2 (Jump platform)
    build_custom_pillar(540, 3, 5)
    
    # Yellow jump ring (orb) in the gap
    add_object(1331, 720, 150)
    
    # Pillar 3 (Double platform steps)
    build_custom_pillar(840, 5, 2)
    build_custom_pillar(990, 4, 4)

    # Transition to Ship Mode (Ship portal ID 13)
    add_object(13, 1200, 90)

    # Cave pillars for the ship section
    build_custom_pillar(1350, 2, 7) # Tall obstacle
    build_custom_pillar(1650, 3, 3) # Low obstacle
    
    # Floating hazards (sawblades ID 85, colored white Color 3)
    add_object(85, 1500, 180, "21,3")
    add_object(85, 1800, 90, "21,3")

    # End wall
    build_custom_pillar(2000, 3, 8)
    
    # Completion pad (ID 36) on a small pedestal
    build_custom_pillar(1940, 2, 1)
    add_object(36, 1970, 45)

    # Join and return
    level_string = header + ";" + ";".join(objects) + ";"
    return level_string

def compress_level_data(level_str):
    compressed = gzip.compress(level_str.encode('utf-8'))
    b64 = base64.b64encode(compressed).decode('utf-8')
    b64_rob = b64.replace('+', '-').replace('/', '_')
    return b64_rob

def main():
    level_name = "INSPIRE"
    description = "Photo-inspired modern level design test!"
    creator = "ChronoCluck"

    level_str = build_level()
    k4_data = compress_level_data(level_str)
    k3_data = base64.b64encode(description.encode('utf-8')).decode('utf-8')

    gmd_xml = f"""<?xml version="1.0"?>
<plist version="1.0" gjver="2.0">
    <dict>
        <k>k2</k>
        <s>{level_name}</s>
        <k>k3</k>
        <s>{k3_data}</s>
        <k>k4</k>
        <s>{k4_data}</s>
        <k>k5</k>
        <s>{creator}</s>
        <k>k16</k>
        <i>22</i>
    </dict>
</plist>
"""
    output_filename = "INSPIRE.gmd"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(gmd_xml)
    print(f"Successfully generated {output_filename} containing photo-inspired level data!")

if __name__ == "__main__":
    main()
