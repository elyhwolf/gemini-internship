import os
import base64
import gzip
import random

def build_level():
    # ── Level Header Settings ──────────────────────────────────────────────
    # Defines standard background colors, channel defaults, etc.
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

    # ── 1. High Density Starfield/Dust background (Atmospheric Layer) ──────
    # Generates ~65,000 tiny stars (ID 1764) scattered across the layout.
    # Uses random seeding to guarantee identical layout compilation.
    random.seed(42)
    for _ in range(65000):
        x = random.randint(0, 36000)
        y = random.randint(0, 1000)
        # Use low opacity / background groups to keep stars subtle
        add_object(1764, x, y, "25,1,21,1") # Layer details

    # ── 2. Parallax Mountain Range (Background Depth) ──────────────────────
    # Generates ~6,000 background blocks layered with decreasing opacity.
    for x in range(0, 36000, 120):
        # Base mountains
        height = int(50 + (100 * (x % 700) / 700))
        for y in range(30, height, 30):
            add_object(1, x, y, "25,2,21,2") # Group 2 for parallax move triggers

    # ── 3. Core Level Path & Layout ─────────────────────────────────────────
    # Active track spans from x=0 to x=35,000 (~1:45 length)
    
    # ── Section 1 (Cube Mode): x=0 to x=5000 ──
    # Theme: Cyan / White Glow on Dark Gray structures.
    for x in range(90, 5000, 30):
        add_object(1, x, 15) # floor
        # Occasional jumps and spikes
        if x % 360 == 0:
            add_object(8, x, 30) # Spike
        elif x % 480 == 0:
            # Platform step
            add_object(1, x, 45)
            add_object(1, x + 30, 45)
            add_object(8, x + 15, 60) # Spike on platform

    # ── Section 2 (Ship Mode): x=5000 to x=10000 ──
    # Portal Transition at x=5000 (ID 13)
    add_object(13, 5000, 90)
    for x in range(5000, 10000, 30):
        # Cave ceiling & floor
        add_object(1, x, 255)
        add_object(1, x, 15)
        # Vertical Pillars to fly around
        if x % 600 == 0:
            # Bottom pillar
            for y in range(15, 120, 30):
                add_object(1, x, y)
        elif x % 600 == 300:
            # Top pillar
            for y in range(150, 255, 30):
                add_object(1, x, y)

    # ── Section 3 (Ball Mode): x=10000 to x=15000 ──
    # Portal Transition at x=10000 (ID 47)
    add_object(47, 10000, 90)
    for x in range(10000, 15000, 30):
        # Alternating floor and ceiling tracks
        if (x // 600) % 2 == 0:
            add_object(1, x, 15)
            if x % 120 == 0:
                add_object(8, x, 30) # Spike
        else:
            add_object(1, x, 165)
            if x % 120 == 0:
                add_object(8, x, 150) # Ceiling spike

    # ── Section 4 (UFO Mode): x=15000 to x=20000 ──
    # Portal Transition at x=15000 (ID 111)
    add_object(111, 15000, 90)
    for x in range(15000, 20000, 30):
        add_object(1, x, 15)
        # Giant block pillars requiring precise UFO jumps
        if x % 500 == 0:
            for y in range(45, 135, 30):
                add_object(1, x, y)
            for y in range(195, 255, 30):
                add_object(1, x, y)

    # ── Section 5 (Wave Mode): x=20000 to x=25000 ──
    # Portal Transition at x=20000 (ID 660)
    add_object(660, 20000, 90)
    for x in range(20000, 25000, 30):
        # Zig-zag track borders
        height = int(90 + 60 * (x % 1000) / 1000)
        add_object(1, x, height + 60)
        add_object(1, x, height - 60)

    # ── Section 6 (Spider & Robot Mode): x=25000 to x=30000 ──
    # Portal Transition at x=25000 (ID 744 for Robot)
    add_object(744, 25000, 90)
    for x in range(25000, 30000, 30):
        add_object(1, x, 15)
        if x % 400 == 0:
            add_object(36, x, 30) # jump pad
            for y in range(45, 105, 30):
                add_object(1, x + 60, y)

    # ── Section 7 (Climactic Finale): x=30000 to x=35000 ──
    # Transition to Purple theme. Speed set to 4x (ID 203)
    add_object(12, 30000, 90) # Cube
    add_object(203, 30050, 90) # 4x speed portal
    for x in range(30000, 35000, 30):
        add_object(1, x, 15)
        if x % 180 == 0:
            add_object(8, x, 30)

    # ── 4. End Screen Signature ("PARALLAX") ────────────────────────────────
    # Draws the level title using blocks at x = 35200
    # Letters height spans from y=90 to y=180
    def draw_letter(matrix, start_x, start_y):
        for row_idx, row in enumerate(matrix):
            for col_idx, cell in enumerate(row):
                if cell == 1:
                    add_object(1, start_x + (col_idx * 30), start_y - (row_idx * 30))

    # P
    draw_letter([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]
    ], 35200, 180)

    # A
    draw_letter([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ], 35320, 180)

    # R
    draw_letter([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ], 35440, 180)

    # A
    draw_letter([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ], 35560, 180)

    # L
    draw_letter([
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
    ], 35680, 180)

    # L
    draw_letter([
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
    ], 35800, 180)

    # A
    draw_letter([
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
    ], 35920, 180)

    # X
    draw_letter([
        [1, 0, 1],
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
        [1, 0, 1]
    ], 36040, 180)

    # Finish pad
    add_object(36, 36200, 30)

    # Final join
    level_string = header + ";" + ";".join(objects) + ";"
    return level_string

def compress_level_data(level_str):
    compressed = gzip.compress(level_str.encode('utf-8'))
    b64 = base64.b64encode(compressed).decode('utf-8')
    b64_rob = b64.replace('+', '-').replace('/', '_')
    return b64_rob

def main():
    level_name = "PARALLAX"
    description = "A cosmic challenge by ChronoCluck. Can you survive the dimensions?"
    creator = "ChronoCluck"

    level_str = build_level()
    k4_data = compress_level_data(level_str)
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
    output_filename = "PARALLAX.gmd"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(gmd_xml)
    print(f"Successfully generated {output_filename} containing PARALLAX level data!")

if __name__ == "__main__":
    main()
