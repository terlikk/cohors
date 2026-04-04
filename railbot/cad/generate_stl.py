#!/usr/bin/env python3
"""
RailBot — Generate all printable parts as STL files using numpy-stl.
Run: python3 generate_stl.py
Output: stl/ directory
"""
import numpy as np
from stl import mesh
import os, math

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stl")
os.makedirs(OUT, exist_ok=True)

def make_box(w, d, h, offset=(0,0,0)):
    """Create a simple box mesh centered at offset."""
    ox, oy, oz = offset
    x, y, z = w/2, d/2, h/2
    
    vertices = np.array([
        [ox-x, oy-y, oz-z], [ox+x, oy-y, oz-z], [ox+x, oy+y, oz-z], [ox-x, oy+y, oz-z],  # bottom
        [ox-x, oy-y, oz+z], [ox+x, oy-y, oz+z], [ox+x, oy+y, oz+z], [ox-x, oy+y, oz+z],  # top
    ])
    
    faces = np.array([
        [0,3,1], [1,3,2],  # bottom
        [0,4,7], [0,7,3],  # left
        [4,5,6], [4,6,7],  # top
        [5,1,2], [5,2,6],  # right
        [0,1,5], [0,5,4],  # front
        [2,3,7], [2,7,6],  # back
    ])
    
    m = mesh.Mesh(np.zeros(len(faces), dtype=mesh.Mesh.dtype))
    for i, f in enumerate(faces):
        for j in range(3):
            m.vectors[i][j] = vertices[f[j]]
    return m

def make_cylinder(r, h, segments=32, offset=(0,0,0)):
    """Create a cylinder along Z axis."""
    ox, oy, oz = offset
    faces = []
    
    for i in range(segments):
        a1 = 2 * math.pi * i / segments
        a2 = 2 * math.pi * (i + 1) / segments
        
        x1, y1 = r * math.cos(a1) + ox, r * math.sin(a1) + oy
        x2, y2 = r * math.cos(a2) + ox, r * math.sin(a2) + oy
        
        # Bottom face
        faces.append([[ox, oy, oz], [x1, y1, oz], [x2, y2, oz]])
        # Top face
        faces.append([[ox, oy, oz+h], [x2, y2, oz+h], [x1, y1, oz+h]])
        # Side faces
        faces.append([[x1, y1, oz], [x1, y1, oz+h], [x2, y2, oz+h]])
        faces.append([[x1, y1, oz], [x2, y2, oz+h], [x2, y2, oz]])
    
    m = mesh.Mesh(np.zeros(len(faces), dtype=mesh.Mesh.dtype))
    for i, f in enumerate(faces):
        m.vectors[i] = np.array(f)
    return m

def combine(*meshes):
    return mesh.Mesh(np.concatenate([m.data for m in meshes]))

def save(m, name):
    path = os.path.join(OUT, f"{name}.stl")
    m.save(path)
    print(f"  ✅ {name}.stl ({len(m.data)} triangles)")

# ============================================================
print("\n🤖 RailBot STL Generator\n")

# PART 1: Carriage Base Plate
print("1️⃣  Carriage Base Plate (200×150×6mm)")
plate = make_box(200, 150, 6)
save(plate, "01_carriage_base_plate")

# PART 2: Fork Arm (L-profile)
print("2️⃣  Fork Arm (180mm, L-profile) — print 2x")
fork_bottom = make_box(180, 20, 3, offset=(0, 0, 1.5))
fork_wall = make_box(180, 3, 12, offset=(0, 8.5, 9))
fork = combine(fork_bottom, fork_wall)
save(fork, "02_fork_arm_x2")

# PART 3: X Motor Mount
print("3️⃣  X Motor Mount (50×50×20mm)")
mount = make_box(50, 50, 20)
save(mount, "03_x_motor_mount")

# PART 4: Belt Tensioner
print("4️⃣  Belt Tensioner (40×30×15mm)")
tensioner = make_box(40, 30, 15)
save(tensioner, "04_belt_tensioner")

# PART 5: Electronics Enclosure
print("5️⃣  Electronics Enclosure (120×90×40mm)")
# Outer box
outer = make_box(120, 90, 40)
# Inner cutout (hollow)
inner = make_box(116, 86, 37, offset=(0, 0, 1.5))
enclosure = combine(outer, inner)  # Note: this is a simplified representation
save(outer, "05_electronics_enclosure")

# Lid
lid = make_box(120, 90, 3)
save(lid, "05b_electronics_lid")

# PART 6: Dropoff Rack
print("6️⃣  Dropoff Rack (280×60×200mm)")
rack_base_part = make_box(280, 60, 4, offset=(0, 0, 2))
rack_left = make_box(4, 60, 196, offset=(-138, 0, 102))
rack_right = make_box(4, 60, 196, offset=(138, 0, 102))
# Plate dividers (every 28mm)
dividers = []
for i in range(9):
    x = -112 + i * 28
    dividers.append(make_box(2, 50, 180, offset=(x, 0, 94)))
rack = combine(rack_base_part, rack_left, rack_right, *dividers)
save(rack, "06_dropoff_rack")

# PART 7: Supply Rack (same as dropoff + spring guide)
print("7️⃣  Supply Rack (280×60×200mm + spring channel)")
spring_channel = make_box(12, 12, 60, offset=(0, -24, 34))
supply_rack = combine(rack_base_part, rack_left, rack_right, *dividers, spring_channel)
save(supply_rack, "07_supply_rack")

# PART 8: Endstop Mount
print("8️⃣  Endstop Mount — print 4x")
endstop = make_box(20, 15, 15)
save(endstop, "08_endstop_mount_x4")

# PART 9: Hall Sensor Mount
print("9️⃣  Hall Sensor Mount — print 4x")
hall = make_box(15, 10, 15)
save(hall, "09_hall_sensor_mount_x4")

# PART 10: Servo Mount
print("🔟 Servo Mount (MG996R)")
servo_body = make_box(45, 25, 25)
# Tabs
tab_left = make_box(8, 25, 3, offset=(-26.5, 0, 11))
tab_right = make_box(8, 25, 3, offset=(26.5, 0, 11))
servo_mount = combine(servo_body, tab_left, tab_right)
save(servo_mount, "10_servo_mount")

# PART 11: Z Lift Arm
print("1️⃣1️⃣ Z Lift Arm (connects servo to forks)")
arm = make_box(60, 15, 5)
save(arm, "11_z_lift_arm")

# PART 12: Carriage Side Plates (roller mounting)
print("1️⃣2️⃣ Carriage Side Plates — print 2x")
side = make_box(150, 6, 40)
save(side, "12_carriage_side_plate_x2")

print(f"\n🎉 All {len(os.listdir(OUT))} STL files saved to: {OUT}/")
print("\n📦 Import into Fusion 360:")
print("   Insert → Insert Mesh → select STL file")
print("   Then: Mesh → Convert Mesh → to BRep (for editing)")
print("\n⚠️  These are starting shapes — add holes, chamfers,")
print("   fillets and precise features in Fusion 360!")
