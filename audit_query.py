#!/usr/bin/env python3
"""
Audit Report Query & Generator Tool
====================================
Usage:
  python3 audit_query.py search "budget overspending"
  python3 audit_query.py report "Garden Town Campus, Lahore" --category "Fixed Assets"
  python3 audit_query.py generate --query "vendor registration not done" --campus Garden_Town_Lahore
  python3 audit_query.py mis              # Print all campus MIS info
  python3 audit_query.py list-categories  # List all categories
  python3 audit_query.py interactive      # Interactive query mode
"""

import json
import sys
import re
import os
from datetime import date

DATABANK_PATH = os.path.join(os.path.dirname(__file__), "audit_databank.json")

with open(DATABANK_PATH) as f:
    DB = json.load(f)

OBSERVATIONS = DB["observations"]
CAMPUSES = DB["campuses"]


# ── helpers ──────────────────────────────────────────────────────────────────

def score(obs, query_tokens):
    """Simple keyword relevance score."""
    text = " ".join([
        obs["title"], obs["observation"], obs["recommendation"],
        obs.get("audit_view", ""), obs["category"],
        " ".join(obs["keywords"])
    ]).lower()
    return sum(2 if t in obs["keywords"] else 1 for t in query_tokens if t in text)


def search(query, campus_id=None, category=None, obs_type=None, top_n=5):
    tokens = re.sub(r"[^\w\s]", "", query.lower()).split()
    results = []
    for obs in OBSERVATIONS:
        if campus_id and campus_id not in obs["campuses"]:
            continue
        if category and category.lower() not in obs["category"].lower():
            continue
        if obs_type and obs["type"].lower() != obs_type.lower():
            continue
        s = score(obs, tokens)
        if s > 0:
            results.append((s, obs))
    results.sort(key=lambda x: -x[0])
    return [r[1] for r in results[:top_n]]


def campus_name(cid):
    return CAMPUSES.get(cid, {}).get("name", cid)


# ── formatters ───────────────────────────────────────────────────────────────

def format_observation_block(obs, include_campuses=True):
    lines = []
    lines.append(f"\n{'='*70}")
    lines.append(f"[{obs['id']}] {obs['title']}")
    lines.append(f"Category : {obs['category']}  |  Type: {obs['type']}")
    if include_campuses:
        campuses = ", ".join(campus_name(c) for c in obs["campuses"])
        lines.append(f"Campuses : {campuses}")
    lines.append(f"{'─'*70}")
    lines.append(f"\nOBSERVATION:\n{obs['observation']}")
    lines.append(f"\nRECOMMENDATION:\n{obs['recommendation']}")
    if obs.get("audit_view"):
        lines.append(f"\nAUDIT VIEW:\n{obs['audit_view']}")
    lines.append(f"\nTYPICAL AUDITEE RESPONSE:\n{obs['typical_response']}")
    return "\n".join(lines)


def format_mis(campus_id):
    c = CAMPUSES.get(campus_id)
    if not c:
        return f"Campus '{campus_id}' not found."
    lines = [
        f"\n{'='*70}",
        f"CAMPUS MIS INFORMATION",
        f"{'='*70}",
        f"Campus Name    : {c['name']}",
        f"Region         : {c['region']}",
        f"Audit Type     : {c['audit_type']}",
        f"Audit Period   : {c['audit_period']}",
        f"Visit Dates    : {c['visit_dates']}",
        f"Previous Report: {c['previous_report']}",
        f"Framework      : {c['framework']}",
    ]
    return "\n".join(lines)


# ── report builder ───────────────────────────────────────────────────────────

def build_report(campus_id=None, category=None, obs_type=None, query=None, title=None):
    """Generate a structured audit report section."""
    if query:
        obs_list = search(query, campus_id=campus_id, category=category,
                          obs_type=obs_type, top_n=20)
    else:
        obs_list = [o for o in OBSERVATIONS
                    if (not campus_id or campus_id in o["campuses"])
                    and (not category or category.lower() in o["category"].lower())
                    and (not obs_type or o["type"].lower() == obs_type.lower())]

    if not obs_list:
        print("No matching observations found.")
        return

    report_title = title or "AUDIT REPORT EXTRACT"
    if campus_id:
        report_title += f" — {campus_name(campus_id)}"
    if category:
        report_title += f" | {category}"

    print(f"\n{'#'*70}")
    print(f"  {report_title}")
    print(f"  Generated: {date.today()}")
    print(f"  Total Observations: {len(obs_list)}")
    print(f"{'#'*70}")

    if campus_id:
        print(format_mis(campus_id))

    # Group by category
    by_cat = {}
    for obs in obs_list:
        by_cat.setdefault(obs["category"], []).append(obs)

    for cat, items in by_cat.items():
        print(f"\n\n{'★'*70}")
        print(f"  CATEGORY: {cat.upper()}")
        print(f"{'★'*70}")
        for obs in items:
            print(format_observation_block(obs, include_campuses=(campus_id is None)))

    print(f"\n\n{'='*70}")
    print(f"END OF REPORT — {len(obs_list)} observation(s) listed")
    print(f"{'='*70}\n")


# ── interactive mode ─────────────────────────────────────────────────────────

def interactive():
    print("\n" + "="*70)
    print("  BEACONHOUSE AUDIT DATA BANK — INTERACTIVE QUERY TOOL")
    print("="*70)
    print("\nCommands:")
    print("  search   <keywords>")
    print("  mis      <campus_id>")
    print("  report   <campus_id or 'all'>  [category]")
    print("  generate <free-text query>")
    print("  campuses                        — list campus IDs")
    print("  categories                      — list all categories")
    print("  quit")
    print()

    while True:
        try:
            raw = input("audit> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye.")
            break
        if not raw:
            continue
        parts = raw.split(None, 2)
        cmd = parts[0].lower()

        if cmd in ("quit", "exit", "q"):
            print("Bye.")
            break

        elif cmd == "campuses":
            for cid, c in CAMPUSES.items():
                print(f"  {cid:40s}  →  {c['name']}")

        elif cmd == "categories":
            cats = sorted(set(o["category"] for o in OBSERVATIONS))
            for c in cats:
                print(f"  • {c}")

        elif cmd == "mis":
            cid = parts[1] if len(parts) > 1 else None
            if not cid:
                for cid2 in CAMPUSES:
                    print(format_mis(cid2))
            else:
                print(format_mis(cid))

        elif cmd == "search":
            q = " ".join(parts[1:]) if len(parts) > 1 else ""
            results = search(q, top_n=10)
            if not results:
                print("No results found.")
            for obs in results:
                print(format_observation_block(obs))

        elif cmd == "report":
            cid = parts[1] if len(parts) > 1 else None
            cat = parts[2] if len(parts) > 2 else None
            if cid and cid.lower() == "all":
                cid = None
            build_report(campus_id=cid, category=cat)

        elif cmd == "generate":
            q = " ".join(parts[1:]) if len(parts) > 1 else ""
            build_report(query=q)

        else:
            # Treat entire input as a search query
            results = search(raw, top_n=5)
            if not results:
                print("No results. Try 'search <keywords>'.")
            for obs in results:
                print(format_observation_block(obs))


# ── CLI entry ─────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        print(__doc__)
        return

    cmd = args[0].lower()

    if cmd == "interactive":
        interactive()

    elif cmd == "mis":
        cid = args[1] if len(args) > 1 else None
        if cid:
            print(format_mis(cid))
        else:
            for cid2 in CAMPUSES:
                print(format_mis(cid2))

    elif cmd == "list-categories":
        cats = sorted(set(o["category"] for o in OBSERVATIONS))
        print("\nAvailable Categories:")
        for c in cats:
            print(f"  • {c}")

    elif cmd == "search":
        q = " ".join(args[1:])
        results = search(q, top_n=10)
        if not results:
            print("No results found.")
        for obs in results:
            print(format_observation_block(obs))

    elif cmd == "report":
        cid = args[1] if len(args) > 1 else None
        cat = None
        obs_type = None
        for i, a in enumerate(args[2:], 2):
            if a.startswith("--category="):
                cat = a.split("=", 1)[1]
            elif a.startswith("--type="):
                obs_type = a.split("=", 1)[1]
        if cid and cid.lower() == "all":
            cid = None
        build_report(campus_id=cid, category=cat, obs_type=obs_type)

    elif cmd == "generate":
        q = " ".join(args[1:])
        campus_id = None
        category = None
        # parse optional flags
        clean_q = []
        for token in args[1:]:
            if token.startswith("--campus="):
                campus_id = token.split("=", 1)[1]
            elif token.startswith("--category="):
                category = token.split("=", 1)[1]
            else:
                clean_q.append(token)
        build_report(query=" ".join(clean_q), campus_id=campus_id, category=category)

    else:
        # treat as a quick search
        results = search(" ".join(args), top_n=5)
        if not results:
            print("No matching observations. Use: python3 audit_query.py search <keywords>")
        for obs in results:
            print(format_observation_block(obs))


if __name__ == "__main__":
    main()
