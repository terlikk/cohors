#!/usr/bin/env python3
"""Render full RailBot assembly — all parts positioned together."""
import numpy as np
from stl import mesh
from mpl_toolkits import mplot3d
import matplotlib.pyplot as plt
import os

STL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stl")
IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "renders")

fig = plt.figure(figsize=(16, 10), facecolor='#0f172a')
ax = fig.add_subplot(111, projection='3d')
ax.set_facecolor('#0f172a')

def load_and_place(filename, offset=(0,0,0), color='#7c3aed', edge='#a78bfa', alpha=0.8):
    m = mesh.Mesh.from_file(os.path.join(STL_DIR, filename))
    # Apply offset
    m.x += offset[0]
    m.y += offset[1]
    m.z += offset[2]
    poly = mplot3d.art3d.Poly3DCollection(m.vectors, alpha=alpha)
    poly.set_facecolor(color)
    poly.set_edgecolor(edge)
    poly.set_linewidth(0.2)
    ax.add_collection3d(poly)
    return m

# ============ RAIL (2x V-slot profiles as boxes) ============
# Simulated rail profiles (1500mm long)
rail_top = load_and_place.__wrapped__ if hasattr(load_and_place, '__wrapped__') else None

# Draw rails manually
for rail_y in [-70, 70]:
    vertices = np.array([
        [-750, rail_y-10, -10], [750, rail_y-10, -10],
        [750, rail_y+10, -10], [-750, rail_y+10, -10],
        [-750, rail_y-10, 10], [750, rail_y-10, 10],
        [750, rail_y+10, 10], [-750, rail_y+10, 10],
    ])
    faces = [
        [0,3,1],[1,3,2],[0,4,7],[0,7,3],[4,5,6],[4,6,7],
        [5,1,2],[5,2,6],[0,1,5],[0,5,4],[2,3,7],[2,7,6],
    ]
    rail_mesh = mesh.Mesh(np.zeros(12, dtype=mesh.Mesh.dtype))
    for i, f in enumerate(faces):
        for j in range(3):
            rail_mesh.vectors[i][j] = vertices[f[j]]
    poly = mplot3d.art3d.Poly3DCollection(rail_mesh.vectors, alpha=0.4)
    poly.set_facecolor('#334155')
    poly.set_edgecolor('#475569')
    poly.set_linewidth(0.3)
    ax.add_collection3d(poly)

# ============ CARRIAGE (center of rail) ============
load_and_place("01_carriage_base_plate.stl", offset=(0, 0, 20), color='#8b5cf6', edge='#a78bfa')

# Side plates
load_and_place("12_carriage_side_plate_x2.stl", offset=(0, -75, 30), color='#6d28d9', edge='#7c3aed')
load_and_place("12_carriage_side_plate_x2.stl", offset=(0, 75, 30), color='#6d28d9', edge='#7c3aed')

# ============ FORKS (extended position) ============
load_and_place("02_fork_arm_x2.stl", offset=(120, -40, 25), color='#22c55e', edge='#4ade80')
load_and_place("02_fork_arm_x2.stl", offset=(120, 40, 25), color='#22c55e', edge='#4ade80')

# ============ MOTOR MOUNT (left end) ============
load_and_place("03_x_motor_mount.stl", offset=(-720, 0, 20), color='#f97316', edge='#fb923c')

# ============ BELT TENSIONER (right end) ============
load_and_place("04_belt_tensioner.stl", offset=(720, 0, 20), color='#f97316', edge='#fb923c')

# ============ SERVO MOUNT (on carriage) ============
load_and_place("10_servo_mount.stl", offset=(60, 0, 40), color='#ef4444', edge='#f87171')

# ============ Z LIFT ARM ============
load_and_place("11_z_lift_arm.stl", offset=(90, 0, 50), color='#ef4444', edge='#f87171')

# ============ ELECTRONICS (on carriage or rail end) ============
load_and_place("05_electronics_enclosure.stl", offset=(-500, 0, 60), color='#3b82f6', edge='#60a5fa')

# ============ DROPOFF RACK (right end) ============
load_and_place("06_dropoff_rack.stl", offset=(550, 0, 20), color='#eab308', edge='#facc15', alpha=0.6)

# ============ SUPPLY RACK (far right) ============
load_and_place("07_supply_rack.stl", offset=(650, 150, 20), color='#14b8a6', edge='#2dd4bf', alpha=0.6)

# ============ ENDSTOP MOUNTS ============
for x in [-740, 740]:
    load_and_place("08_endstop_mount_x4.stl", offset=(x, -60, 15), color='#f43f5e', edge='#fb7185')

# ============ HALL SENSOR MOUNTS (at printer positions) ============
for x in [-400, -100, 200, 500]:
    load_and_place("09_hall_sensor_mount_x4.stl", offset=(x, -75, 5), color='#a855f7', edge='#c084fc')

# ============ Styling ============
ax.set_xlim(-800, 800)
ax.set_ylim(-250, 250)
ax.set_zlim(-50, 250)

ax.set_xlabel('X — Rail Direction (mm)', color='#64748b', fontsize=9)
ax.set_ylabel('Y (mm)', color='#64748b', fontsize=9)
ax.set_zlabel('Z (mm)', color='#64748b', fontsize=9)
ax.tick_params(colors='#475569', labelsize=6)

ax.set_title('🤖 RailBot — Full Assembly View', color='white', fontsize=18, fontweight='bold', pad=20)

ax.view_init(elev=22, azim=-55)

for pane in [ax.xaxis.pane, ax.yaxis.pane, ax.zaxis.pane]:
    pane.set_facecolor('#1e293b')
    pane.set_edgecolor('#334155')

# Legend
legend_items = [
    ('Rail profiles', '#334155'),
    ('Carriage', '#8b5cf6'),
    ('Forks', '#22c55e'),
    ('Motors/Tensioner', '#f97316'),
    ('Servo + Lift', '#ef4444'),
    ('Electronics', '#3b82f6'),
    ('Dropoff Rack', '#eab308'),
    ('Supply Rack', '#14b8a6'),
    ('Sensors', '#a855f7'),
]

for i, (label, color) in enumerate(legend_items):
    ax.text2D(0.02, 0.95 - i*0.04, f'● {label}', transform=ax.transAxes,
              color=color, fontsize=8, fontweight='bold')

plt.tight_layout()
out = os.path.join(IMG_DIR, "00_FULL_ASSEMBLY.png")
plt.savefig(out, dpi=200, bbox_inches='tight', facecolor='#0f172a')
plt.close()
print(f"✅ Full assembly render saved: {out}")
