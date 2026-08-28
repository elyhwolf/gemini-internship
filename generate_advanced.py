import os
import base64
import gzip

def build_level():
    # ── Level Header Settings ──────────────────────────────────────────────
    header = (
        "kS38,1_40_1_125_1_255_2_101_2_80_2_255_3_255_3_120_3_120_4_255_4_120_4_120_"
        "5_255_5_120_5_120_6_255_6_255_6_255_7_255_7_255_7_255_8_255_8_255_8_255_"
        "9_255_9_255_9_255_10_255_10_255_10_255,kA13,0,kA15,0,kA16,0,kA14,0,kA6,0,"
        "kA7,0,kA17,1,kA18,0,kS39,0,kA2,0,kA3,0,kA8,0,kA4,0,kA9,30,kA11,0,kA10,0,"
        "kA23,0,kA24,0"
    )

    objects = []

    def add_object(obj_id, x, y, extra=""):
        obj_str = f"1,{obj_id},2,{x},3,{y}"
        if extra:
            obj_str += f",{extra}"
        objects.append(obj_str)

    # ── 1. Create a Platform that Rises dynamically (Group 10) ──────────────
    # Place platform blocks at x=360 to x=540, y=75
    # Assign Group ID 10 to these blocks (using key 57 in level string)
    for x in range(360, 540, 30):
        # We start the blocks lower at y=15, and they will rise by 60 units (2 blocks) to y=75!
        # key 57 is Target Group ID array (stored as a string e.g. "10")
        add_object(1, x, 15, "57,10")

    # Place the Move Trigger (ID 901) at x=200, y=90
    # It targets Group 10 (key 77), moves Y by 60 units (key 79), in 0.5s (key 80)
    add_object(901, 200, 90, "77,10,79,60,80,0.5")

    # ── 2. Create Background Color Cycle Triggers (ID 29) ──────────────────
    # Target Channel 1000 (BG).
    # Fade BG to Cyan (0, 255, 255) at x=300
    add_object(29, 300, 90, "7,0,8,255,9,255,10,0.5,23,1000")
    
    # Fade BG to Purple (128, 0, 128) at x=800
    add_object(29, 800, 90, "7,128,8,0,9,128,10,0.5,23,1000")
    
    # Fade BG back to Dark Gray (20, 20, 25) at x=1300
    add_object(29, 1300, 90, "7,20,8,20,9,25,10,0.5,23,1000")

    # ── 3. Base Gameplay Obstacles ─────────────────────────────────────────
    # Floor blocks
    for x in range(90, 1800, 30):
        if not (360 <= x < 540): # Gap for the rising platform!
            add_object(1, x, 15)

    # Spikes and jump pads
    add_object(8, 270, 30) # Spike before the rising platform
    add_object(36, 600, 30) # Yellow pad after platform
    add_object(8, 720, 30) # Spike
    add_object(1331, 960, 90) # Yellow orb in the air
    add_object(8, 1100, 30) # Spike

    # End wall
    for y in range(15, 135, 30):
        add_object(1, 1500, y)

    # Join and return
    level_string = header + ";" + ";".join(objects) + ";"
    return level_string

def compress_level_data(level_str):
    compressed = gzip.compress(level_str.encode('utf-8'))
    b64 = base64.b64encode(compressed).decode('utf-8')
    b64_rob = b64.replace('+', '-').replace('/', '_')
    return b64_rob

def main():
    level_name = "PULSE"
    description = "Dynamic triggers and movements test level!"
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
    output_filename = "PULSE.gmd"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(gmd_xml)
    print(f"Successfully generated {output_filename} containing advanced level data!")

if __name__ == "__main__":
    main()
