import os
import base64
import gzip

def build_level():
    # ── Level Header Settings ──────────────────────────────────────────────
    # Defines the custom color channels matching the shipyard palette:
    # Color 1: Yellow/Orange (255, 170, 30)
    # Color 2: Bright Blue (30, 100, 230)
    # Color 3: Pure White (255, 255, 255)
    # Color 4: Vibrant Pink (240, 100, 190)
    # Color 5: Dark Outline/Girders (30, 30, 45)
    # Background (BG) is set to a bright, light cyan sky (150, 230, 250)
    header = (
        "kS38,"
        "1_255_1_170_1_30_2_30_2_100_2_230_3_255_3_255_3_255_4_240_4_100_4_190_5_30_5_30_5_45,"
        "kA13,0,kA15,0,kA16,0,kA14,0,kA6,0,kA7,0,kA17,1,kA18,0,kS39,0,kA2,0,kA3,0,kA8,0,kA4,0,"
        "kA9,30,kA11,0,kA10,0,kA23,0,kA24,0"
    )

    objects = []

    def add_object(obj_id, x, y, extra=""):
        obj_str = f"1,{obj_id},2,{x},3,{y}"
        if extra:
            obj_str += f",{extra}"
        objects.append(obj_str)

    # ── Custom Container Drawing Function ──────────────────────────────────
    def draw_container(start_x, start_y, width, height, color_channel, has_window=False):
        # 1. Inside solid body blocks (Color 5 for dark backing)
        for dx in range(15, width, 30):
            for dy in range(15, height, 30):
                add_object(1, start_x + dx, start_y + dy, "21,5")

        # 2. Corrugated vertical ribs (using line ID 208, rotated 90 degrees)
        for dx in range(10, width, 15):
            for dy in range(0, height, 30):
                add_object(208, start_x + dx, start_y + dy + 15, f"6,90,21,{color_channel}")

        # 3. Outer border outline
        for dx in range(0, width, 30):
            add_object(208, start_x + dx + 15, start_y, "21,5")
            add_object(208, start_x + dx + 15, start_y + height, "21,5")
        for dy in range(0, height, 30):
            add_object(208, start_x, start_y + dy + 15, "6,90,21,5")
            add_object(208, start_x + width, start_y + dy + 15, "6,90,21,5")

        # 4. Corner bracket locks
        add_object(211, start_x, start_y, "21,5")
        add_object(211, start_x + width, start_y, "21,5")
        add_object(211, start_x, start_y + height, "21,5")
        add_object(211, start_x + width, start_y + height, "21,5")

        # 5. Window detail if requested
        if has_window:
            mid_x = start_x + (width // 2)
            mid_y = start_y + (height // 2)
            # Draw a light-colored window frame (Color 3)
            add_object(211, mid_x, mid_y, "21,3")

    # ── Custom Girder/Truss Builder ────────────────────────────────────────
    def draw_girder(start_x, height):
        # Double vertical columns
        for y in range(15, height, 30):
            add_object(208, start_x - 15, y + 15, "6,90,21,5")
            add_object(208, start_x + 15, y + 15, "6,90,21,5")
            # Diagonal cross struts
            add_object(208, start_x, y + 15, "6,45,21,5")
            add_object(208, start_x, y + 15, "6,135,21,5")

    # ── Hanging Crane Hook Container ──────────────────────────────────────
    def draw_hanging_crane(x, container_y):
        # 1. Main vertical wire rope from ceiling
        for y in range(container_y + 80, 255, 30):
            add_object(208, x, y + 15, "6,90,21,5")
        
        # 2. Hook element
        add_object(211, x, container_y + 75, "21,5")
        
        # 3. Diagonal straps holding the container
        add_object(208, x - 20, container_y + 68, "6,60,21,5")
        add_object(208, x + 20, container_y + 68, "6,120,21,5")
        
        # 4. Pink container
        draw_container(x - 60, container_y, 120, 60, 4)

    # ── Compile Shipyard Layout ────────────────────────────────────────────
    # Spans from x=0 to x=3000
    
    # 1. First Platform: Orange Container with a Window
    draw_girder(300, 60)
    add_object(1, 300, 75, "21,5") # Top platform block
    add_object(1, 270, 75, "21,5")
    add_object(1, 330, 75, "21,5")
    draw_container(240, 90, 120, 60, 1, has_window=True) # Yellow/Orange

    # 2. Second Platform (Elevated): Blue Container
    draw_girder(600, 150)
    add_object(1, 600, 165, "21,5")
    add_object(1, 570, 165, "21,5")
    add_object(1, 630, 165, "21,5")
    draw_container(540, 180, 120, 60, 2) # Blue

    # 3. Central Hanging Crane (Pink container)
    # Suspended in mid-air at x=960, y=90
    draw_hanging_crane(960, 90)

    # 4. Green Jump Orb in the gap
    add_object(1331, 1140, 120)

    # 5. Right Platform: Yellow Container on top, Red container on the right
    draw_girder(1350, 120)
    add_object(1, 1350, 135, "21,5")
    add_object(1, 1320, 135, "21,5")
    add_object(1, 1380, 135, "21,5")
    draw_container(1290, 150, 120, 60, 1) # Yellow

    # Base ground blocks
    for x in range(90, 2000, 30):
        add_object(1, x, 15, "21,5")

    # Spikes and finishing pad
    add_object(8, 450, 30, "21,5")
    add_object(8, 780, 30, "21,5")
    
    add_object(36, 1700, 30)

    # Join and return
    level_string = header + ";" + ";".join(objects) + ";"
    return level_string

def compress_level_data(level_str):
    compressed = gzip.compress(level_str.encode('utf-8'))
    b64 = base64.b64encode(compressed).decode('utf-8')
    b64_rob = b64.replace('+', '-').replace('/', '_')
    return b64_rob

def main():
    level_name = "SHIPYARD"
    description = "Custom cargo containers and crane structures!"
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
    output_filename = "SHIPYARD.gmd"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(gmd_xml)
    print(f"Successfully generated {output_filename} containing shipyard level data!")

if __name__ == "__main__":
    main()
