import os
import base64
import gzip

def build_level():
    # Level Header Settings (default colors, background, etc.)
    header = (
        "kS38,1_40_1_125_1_255_2_101_2_80_2_255_3_255_3_120_3_120_4_255_4_120_4_120_"
        "5_255_5_120_5_120_6_255_6_255_6_255_7_255_7_255_7_255_8_255_8_255_8_255_"
        "9_255_9_255_9_255_10_255_10_255_10_255,kA13,0,kA15,0,kA16,0,kA14,0,kA6,0,"
        "kA7,0,kA17,1,kA18,0,kS39,0,kA2,0,kA3,0,kA8,0,kA4,0,kA9,30,kA11,0,kA10,0,"
        "kA23,0,kA24,0"
    )

    objects = []

    # Helper function to add a block
    def add_object(obj_id, x, y, extra=""):
        obj_str = f"1,{obj_id},2,{x},3,{y}"
        if extra:
            obj_str += f",{extra}"
        objects.append(obj_str)

    # 1. Add some initial ground blocks (ID 1)
    for x in range(90, 600, 30):
        # Floor platform at y=15 (just above standard ground)
        add_object(1, x, 15)

    # 2. Add some jumps over spikes (ID 8)
    add_object(8, 240, 30) # Spike on floor
    add_object(8, 420, 30) # Spike on floor

    # 3. Add an elevated platform
    for x in range(510, 750, 30):
        add_object(1, x, 75)
    add_object(8, 630, 90) # Spike on the platform!

    # 4. Add jump rings/orbs (ID 1331 for yellow orb)
    add_object(1331, 840, 120)

    # 5. Add a ship portal (ID 13) to transition to ship mode
    add_object(13, 960, 90)

    # 6. Ship tunnel section (x=990 to 2400)
    for x in range(990, 2400, 30):
        # Tunnel ceiling
        add_object(1, x, 255)
        # Tunnel floor
        add_object(1, x, 15)

    # Pillars inside the ship tunnel
    # Pillar 1 (bottom)
    for y in range(45, 135, 30):
        add_object(1, 1350, y)
    # Pillar 2 (top)
    for y in range(165, 225, 30):
        add_object(1, 1680, y)
    # Pillar 3 (bottom with spike on top)
    for y in range(45, 105, 30):
        add_object(1, 2010, y)
    add_object(8, 2010, 120)

    # 7. Add a cube portal (ID 12) to switch back to cube mode
    add_object(12, 2430, 90)

    # 8. Post-ship floor
    for x in range(2460, 3200, 30):
        add_object(1, x, 15)

    # Final triple spike challenge! (Spikes at 2700, 2730, 2760)
    add_object(8, 2700, 30)
    add_object(8, 2730, 30)
    add_object(8, 2760, 30)

    # 9. Jump pad to finish line (ID 35 for pink pad, ID 36 for yellow pad)
    add_object(36, 2940, 30)

    # End wall with some nice blocks
    for y in range(15, 135, 30):
        add_object(1, 3150, y)

    # Join objects and concatenate with header
    level_string = header + ";" + ";".join(objects) + ";"
    return level_string

def compress_level_data(level_str):
    # Geometry Dash expects gzip-compressed, base64-encoded level string
    # We must compress using gzip, but note:
    # Python's gzip module writes a header with filename and timestamp by default.
    # RobTop's engine accepts raw gzip stream. Let's write standard gzip.
    compressed = gzip.compress(level_str.encode('utf-8'))
    # Encode to base64 (standard or url-safe? standard is used in plist k4)
    # We also need to replace '+' with '-' and '/' with '_' because RobTop uses
    # a modified base64 format (sometimes or standard web-safe base64).
    # Actually, standard base64 is fine for k4, but sometimes we need standard URL-safe base64.
    # Let's check: RobTop's custom base64 replaces '+' with '-' and '/' with '_'.
    # Let's perform that replace.
    b64 = base64.b64encode(compressed).decode('utf-8')
    b64_rob = b64.replace('+', '-').replace('/', '_')
    return b64_rob

def main():
    level_name = "Chicken Run"
    description = "Mascot challenge: Escape the deep fryer!"
    creator = "ChronoCluck"

    level_str = build_level()
    k4_data = compress_level_data(level_str)
    
    # Base64 encode the description for key k3
    k3_data = base64.b64encode(description.encode('utf-8')).decode('utf-8')

    # Construct the .gmd plist file with standard plist/dict tags
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
    output_filename = "Chicken_Run.gmd"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(gmd_xml)
    print(f"Successfully generated {output_filename} containing the level data!")

if __name__ == "__main__":
    main()
