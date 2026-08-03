#!/usr/bin/env python3
"""
Convert an Obsidian vault to a JSON graph format.

Usage:
    python obsidian_to_json.py <vault_path> <output.json> \
        [--colors '{"Blu": "#3b82f6", "Green": "#22c55e", "Orange": "#f97316", "Red": "#ef4444", "White": "#eeeeee"}']

Default colors are provided for the five known folders: Blu, Green, Orange, Red, White.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime


DEFAULT_COLORS = {
    "Blu":    "#5d52f2",
    "Green":  "#27b909",
    "Orange": "#f5841b",
    "Red":    "#f30b0b",
    "White":  "#cccccc",
}


def slugify(name: str) -> str:
    """Convert a filename (without extension) to a node id."""
    return re.sub(r"\s+", "_", name.strip()).lower()


def convert_obsidian_links(text: str) -> str:
    """
    Replace Obsidian wikilinks with the custom format.
      [[File Name|display text]]  ->  [file_name][display text]
      [[File Name]]               ->  [file_name][File Name]
    """
    def replace(m):
        inner = m.group(1)
        if "|" in inner:
            target, display = inner.split("|", 1)
        else:
            target, display = inner, inner
        return f"[{slugify(target)}][{display}]"

    return re.sub(r"\[\[([^\]]+)\]\]", replace, text)


def extract_links(text: str) -> list[str]:
    """Return list of target node ids linked from this file's content."""
    ids = []
    for m in re.finditer(r"\[\[([^\]]+)\]\]", text):
        inner = m.group(1)
        target = inner.split("|")[0]
        ids.append(slugify(target))
    return ids


def file_date(path: str) -> str:
    return 'ages ago'
    """Return a human-readable modification date."""
    ts = os.path.getmtime(path)
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M")

def build_graph(vault_path: str, colors: dict) -> dict:
    nodes = []
    edges = []
    seen_edges = set()
    for folder in sorted(os.listdir(vault_path)):
        if folder.startswith("."):
            continue
        folder_path = os.path.join(vault_path, folder)
        if not os.path.isdir(folder_path):
            continue
        color = colors.get(folder, "#aaaaaa")
        author = folder
        for root, dirs, files in os.walk(folder_path):
            dirs[:] = [d for d in sorted(dirs) if not d.startswith(".")]
            for filename in sorted(files):
                if not filename.endswith(".md"):
                    continue
                file_path = os.path.join(root, filename)
                name_no_ext = filename[:-3]
                node_id = slugify(name_no_ext)
                with open(file_path, "r", encoding="utf-8") as f:
                    raw = f.read()
                linked_ids = extract_links(raw)
                content = convert_obsidian_links(raw)
                nodes.append({
                    "id": node_id,
                    "text": name_no_ext,
                    "color": color,
                    "content": content,
                    "authorName": author,
                    "date": file_date(file_path),
                })
                for target_id in linked_ids:
                    key = (node_id, target_id)
                    if key not in seen_edges:
                        seen_edges.add(key)
                        edges.append({
                            "targetId": node_id,
                            "sourceId": target_id,
                        })
    return {"nodes": nodes, "edges": edges}

def main():
    parser = argparse.ArgumentParser(description="Convert Obsidian vault to JSON graph.")
    parser.add_argument("vault_path", help="Path to the Obsidian vault root directory.")
    parser.add_argument("output", help="Output JSON file path.")
    parser.add_argument(
        "--colors",
        default=None,
        help='JSON string mapping folder names to hex colors. '
             'Defaults to built-in palette for Blu/Green/Orange/Red/White.',
    )
    args = parser.parse_args()

    if args.colors:
        try:
            colors = json.loads(args.colors)
        except json.JSONDecodeError as e:
            print(f"Error parsing --colors JSON: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        colors = DEFAULT_COLORS

    if not os.path.isdir(args.vault_path):
        print(f"Vault path not found: {args.vault_path}", file=sys.stderr)
        sys.exit(1)

    graph = build_graph(args.vault_path, colors)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)

    print(f"Done. {len(graph['nodes'])} nodes, {len(graph['edges'])} edges -> {args.output}")


if __name__ == "__main__":
    main()
