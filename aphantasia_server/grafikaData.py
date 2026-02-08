#!/usr/bin/env python3
"""
Parse a .NET solution file and generate a dependency graph JSON.
Usage: python sln_to_graph.py <path_to_solution.sln>
"""

import sys
import os
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
import hashlib


import hashlib


def get_namespace_parts(project_name):
    """Extract namespace parts from project name."""
    parts = project_name.split('.')
    return parts


def is_interface(project_name):
    """Check if project is an interface based on naming convention."""
    parts = get_namespace_parts(project_name)
    return 'Interface' in parts or 'Interfaces' in parts


def get_vibrant_color(namespace_part):
    """Generate a vibrant color from a namespace part."""
    # Predefined vibrant colors palette
    vibrant_colors = [
        "#FF0E0E",  # Red
        "#0ACBBF",  # Teal
        "#0EBDE4",  # Blue
        "#F15F25",  # Light Salmon
        "#15F7BE",  # Mint
        "#F5C70F",  # Yellow
        "#29C649",  # Green
        "#7D37FF",  # Purple
        "#E72734",  # Pink
        "#2074D4",  # Ocean Blue
        "#F39C12",  # Orange
        "#DA3522",  # Bright Red
        "#941FC2",  # Violet
        "#1BB999",  # Turquoise
        "#3498DB",  # Dodger Blue
        "#D26F18",  # Carrot
        "#2ECC71",  # Emerald
        "#F1C40F",  # Sun Yellow
        "#E91E63",  # Magenta
        "#00BCD4",  # Cyan
    ]
    
    # Hash to get consistent index
    hash_obj = hashlib.md5(namespace_part.encode())
    hash_int = int(hash_obj.hexdigest(), 16)
    color_index = hash_int % len(vibrant_colors)
    
    return vibrant_colors[color_index]


def lighten_color(hex_color, factor=0.4):
    """Lighten a hex color significantly by blending with white."""
    # Remove # if present
    hex_color = hex_color.lstrip('#')
    
    # Convert to RGB
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    
    # Blend more with white for more whitish appearance
    r = int(r + (255 - r) * factor)
    g = int(g + (255 - g) * factor)
    b = int(b + (255 - b) * factor)
    
    return f"#{r:02x}{g:02x}{b:02x}"


def get_node_color(project_name, namespace_colors):
    """Get color for a node based on its namespace and type."""
    parts = get_namespace_parts(project_name)
    
    # Use second part of namespace for color (index 1)
    if len(parts) >= 2:
        namespace_key = parts[1]
    else:
        namespace_key = parts[0] if parts else 'Default'
    
    # Get or create base color for this namespace
    if namespace_key not in namespace_colors:
        namespace_colors[namespace_key] = get_vibrant_color(namespace_key)
    
    base_color = namespace_colors[namespace_key]
    
    # If it's an interface, lighten the color significantly
    if is_interface(project_name):
        return lighten_color(base_color, 0.7)
    
    return base_color


def parse_sln_file(sln_path):
    """Extract project paths from a .sln file."""
    projects = []
    
    with open(sln_path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    # Match project lines like:
    # Project("{...}") = "ProjectName", "Path\To\Project.csproj", "{...}"
    pattern = r'Project\("[^"]+"\)\s*=\s*"([^"]+)"\s*,\s*"([^"]+)"'
    matches = re.findall(pattern, content)
    
    sln_dir = Path(sln_path).parent
    
    for project_name, project_path in matches:
        # Only process .csproj files (skip solution folders and other types)
        if project_path.endswith('.csproj'):
            # Convert Windows backslashes to forward slashes
            project_path = project_path.replace('\\', '/')
            full_path = (sln_dir / project_path).resolve()
            projects.append({
                'name': project_name,
                'path': full_path
            })
    
    return projects


def parse_project_references(csproj_path):
    """Extract ProjectReference items from a .csproj file."""
    references = []
    
    try:
        tree = ET.parse(csproj_path)
        root = tree.getroot()
        
        # Find all ProjectReference elements (namespace-agnostic)
        for ref in root.findall(".//{*}ProjectReference"):
            include = ref.get('Include')
            if include:
                # Convert Windows backslashes to forward slashes
                include = include.replace('\\', '/')
                # Resolve the reference path relative to the project directory
                project_dir = Path(csproj_path).parent
                ref_path = (project_dir / include).resolve()
                references.append(ref_path)
    
    except Exception as e:
        print(f"Warning: Could not parse {csproj_path}: {e}", file=sys.stderr)
    
    return references


def build_dependency_graph(sln_path):
    """Build the dependency graph from a solution file."""
    projects = parse_sln_file(sln_path)
    
    # Create a mapping of project path to project name
    path_to_name = {proj['path']: proj['name'] for proj in projects}
    
    # Track namespace colors for consistency
    namespace_colors = {}
    
    # Build nodes with colors and shapes
    nodes = []
    for proj in projects:
        project_name = proj['name']
        color = get_node_color(project_name, namespace_colors)
        shape = 4 if is_interface(project_name) else 0
        
        nodes.append({
            'id': project_name,
            'color': color,
            'shape': shape
        })
    
    # Build edges with colors matching source node
    edges = []
    node_colors = {node['id']: node['color'] for node in nodes}
    
    for proj in projects:
        references = parse_project_references(proj['path'])
        
        for ref_path in references:
            if ref_path in path_to_name:
                color = node_colors.get(path_to_name[ref_path], '#000000')
                edges.append({
                    'sourceId': proj['name'],
                    'targetId': path_to_name[ref_path],
                    'color': color
                })
    
    return {
        'nodes': nodes,
        'edges': edges
    }


def main():
    if len(sys.argv) != 2:
        print("Usage: python sln_to_graph.py <path_to_solution.sln>", file=sys.stderr)
        sys.exit(1)
    
    sln_path = sys.argv[1]
    
    if not os.path.exists(sln_path):
        print(f"Error: Solution file not found: {sln_path}", file=sys.stderr)
        sys.exit(1)
    
    if not sln_path.endswith('.sln'):
        print(f"Error: File must be a .sln file: {sln_path}", file=sys.stderr)
        sys.exit(1)
    
    graph = build_dependency_graph(sln_path)
    
    # Output JSON
    print(json.dumps(graph, indent=2))


if __name__ == '__main__':
    main()