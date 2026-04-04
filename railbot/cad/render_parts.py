#!/usr/bin/env python3
"""Render RailBot STL files as preview images."""
import numpy as np
from stl import mesh
from mpl_toolkits import mplot3d
import matplotlib.pyplot as plt
import os

STL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stl")
IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "renders")
os.makedirs(IMG_DIR, exist_ok=True)

files = sorted([f for f in os.listdir(STL_DIR) if f.endswith('.stl')])

for stl_file in files:
    name = stl_file.replace('.stl', '')
    print(f"Rendering {name}...")
    
    m = mesh.Mesh.from_file(os.path.join(STL_DIR, stl_file))
    
    fig = plt.figure(figsize=(8, 6), facecolor='#1a1a2e')
    ax = fig.add_subplot(111, projection='3d')
    ax.set_facecolor('#1a1a2e')
    
    poly = mplot3d.art3d.Poly3DCollection(m.vectors, alpha=0.85)
    poly.set_facecolor('#7c3aed')
    poly.set_edgecolor('#a78bfa')
    poly.set_linewidth(0.3)
    ax.add_collection3d(poly)
    
    scale = m.points.flatten()
    ax.auto_scale_xyz(scale, scale, scale)
    
    ax.set_xlabel('X (mm)', color='#666', fontsize=8)
    ax.set_ylabel('Y (mm)', color='#666', fontsize=8)
    ax.set_zlabel('Z (mm)', color='#666', fontsize=8)
    ax.tick_params(colors='#444', labelsize=6)
    
    # Clean title
    title = name.split('_', 1)[1].replace('_', ' ').title()
    ax.set_title(f'RailBot — {title}', color='white', fontsize=14, fontweight='bold', pad=15)
    
    ax.view_init(elev=25, azim=-60)
    
    for spine in ax.xaxis.pane, ax.yaxis.pane, ax.zaxis.pane:
        spine.set_facecolor('#16213e')
        spine.set_edgecolor('#333')
    
    plt.tight_layout()
    out_path = os.path.join(IMG_DIR, f"{name}.png")
    plt.savefig(out_path, dpi=150, bbox_inches='tight', facecolor='#1a1a2e')
    plt.close()
    print(f"  ✅ {name}.png")

print(f"\n🎉 All renders saved to: {IMG_DIR}/")
