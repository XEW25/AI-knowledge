#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
vault_lint.py — link-integrity linter for this Obsidian vault.

WHAT IT CHECKS
  1. Broken wikilinks, split into:
       A) target EXISTS under a different filename  -> real bug, fix the link
       B) no matching file at all                   -> intentional future page / dangling
  2. Orphan notes (no inbound wikilinks from any other note)
  3. Duplicate basenames (ambiguous [[link]] resolution)

RESOLUTION MODEL
  Obsidian resolves [[name]] by basename (in any folder) or by relative path.
  This vault uses NO YAML `aliases` (notes are `# Title` + bullet metadata), so a
  link works iff a file of that basename/path exists. Non-note assets
  (svg/png/jpg/pdf/html/...) count as valid targets, so embeds like
  ![[fig-x.svg]] and links like [[foo.pdf]] resolve.

NOISE CONTROL (so the report is actionable)
  - Fenced ``` blocks and inline `code` are stripped before scanning, so
    documentation examples like `[[Some: Title]]` are not counted as links.
  - `90 System/log.md` is append-only history; it is NOT scanned as a source of
    broken links by default (its outbound links still count toward orphan
    detection). Pass --include-log to scan it too.

USAGE
  python "90 System/scripts/vault_lint.py"            # full report
  python "90 System/scripts/vault_lint.py" --orphans  # only orphan notes
  python "90 System/scripts/vault_lint.py" --broken   # only broken links
  python "90 System/scripts/vault_lint.py" --include-log

See "90 System/Vault linting.md" for how to read the output and known benign
findings (the intentional `agents` duplicate, dangling future pages, etc.).
"""
import os, re, sys, collections, argparse

# vault root = two levels up from this script (90 System/scripts/ -> vault root)
HERE = os.path.dirname(os.path.abspath(__file__))
VAULT = os.path.abspath(os.path.join(HERE, "..", ".."))
EXCLUDE_DIRS = {".git", ".obsidian", ".claude", ".trash"}
ASSET_EXTS = {".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp",
              ".pdf", ".html", ".htm", ".mp4", ".mov", ".webm", ".csv", ".json"}
LOG_REL = "90 System/log.md"

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

WIKILINK = re.compile(r"(!?)\[\[([^\]]+?)\]\]")
FENCED = re.compile(r"```.*?```", re.S)
INLINE = re.compile(r"`[^`]*`")


def relp(path):
    return os.path.relpath(path, VAULT).replace("\\", "/")


def link_target(raw):
    """Normalize a wikilink's inner text to a resolvable target string."""
    t = re.split(r"\\?\|", raw, maxsplit=1)[0]  # drop |alias (and \| in tables)
    t = t.split("#", 1)[0].split("^", 1)[0]    # drop #heading / ^block
    return t.rstrip("\\").strip()


def main():
    ap = argparse.ArgumentParser(description="Obsidian vault link linter")
    ap.add_argument("--orphans", action="store_true", help="only orphan notes")
    ap.add_argument("--broken", action="store_true", help="only broken links")
    ap.add_argument("--include-log", action="store_true",
                    help="also scan 90 System/log.md for broken links")
    args = ap.parse_args()
    show_all = not (args.orphans or args.broken)

    md, assets = [], []
    for root, dirs, files in os.walk(VAULT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for fn in files:
            ext = os.path.splitext(fn)[1].lower()
            if ext == ".md":
                md.append(relp(os.path.join(root, fn)))
            elif ext in ASSET_EXTS:
                assets.append(relp(os.path.join(root, fn)))

    # resolution indexes
    note_by_path = {os.path.splitext(r)[0].lower(): r for r in md}
    note_by_base = {}
    for r in md:
        note_by_base.setdefault(os.path.splitext(os.path.basename(r))[0].lower(), r)
    asset_base = {os.path.basename(r).lower() for r in assets}
    asset_rel = {r.lower() for r in assets}

    def resolve_note(t):
        """Return the note relpath a link points to, or None."""
        tl = t.lower()
        if tl in note_by_path:
            return note_by_path[tl]
        return note_by_base.get(os.path.basename(tl))

    def is_asset(t):
        tl = t.lower()
        bl = os.path.basename(tl)
        return bl in asset_base or tl in asset_rel or any(a.endswith(tl) for a in asset_rel)

    def norm(s):
        return re.sub(r"[^a-z0-9]", "", s.lower())

    md_norm = [(norm(os.path.splitext(os.path.basename(r))[0]), r) for r in md]

    def candidate(t):
        nt = norm(t)
        if len(nt) < 8:
            return None
        for n, r in md_norm:
            if n.endswith(nt) or nt in n:
                return r
        return None

    broken = collections.defaultdict(list)     # target -> [source relpaths]
    inbound = collections.defaultdict(set)      # note relpath -> {source relpaths}

    for r in md:
        with open(os.path.join(VAULT, r), encoding="utf-8") as f:
            text = INLINE.sub("", FENCED.sub("", f.read()))   # strip code first
        scan_broken = args.include_log or r != LOG_REL
        for m in WIKILINK.finditer(text):
            t = link_target(m.group(2))
            if not t:
                continue                        # same-file heading
            note = resolve_note(t)
            if note:
                if note != r:
                    inbound[note].add(r)
            elif is_asset(t):
                continue
            elif scan_broken:
                broken[t].append(r)

    if show_all or args.broken:
        cat_a = {t: (s, candidate(t)) for t, s in broken.items() if candidate(t)}
        cat_b = {t: s for t, s in broken.items() if not candidate(t)}
        print(f"BROKEN LINKS — A) exists under a different filename ({len(cat_a)}):")
        for t, (s, c) in sorted(cat_a.items(), key=lambda kv: -len(kv[1][0])):
            print(f"  [[{t}]] ({len(s)}x)  -> did you mean: {c}")
            for src in sorted(set(s)):
                print(f"       from: {src}")
        print(f"\nBROKEN LINKS — B) no matching file / dangling ({len(cat_b)}):")
        for t, s in sorted(cat_b.items(), key=lambda kv: -len(kv[1])):
            srcs = sorted(set(s))
            print(f"  [[{t}]] ({len(s)}x)  from: {srcs[0]}" + (" ..." if len(srcs) > 1 else ""))

    if show_all or args.orphans:
        orphans = [r for r in sorted(md) if r not in inbound]
        print(f"\nORPHAN NOTES (no inbound wikilinks): {len(orphans)}")
        for r in orphans:
            print(f"  {r}")

    if show_all:
        dupes = collections.defaultdict(list)
        for r in md:
            dupes[os.path.splitext(os.path.basename(r))[0].lower()].append(r)
        dupes = {b: ps for b, ps in dupes.items() if len(ps) > 1}
        print(f"\nDUPLICATE BASENAMES (ambiguous [[link]]): {len(dupes)}")
        for b, ps in sorted(dupes.items()):
            print(f"  '{b}': " + " | ".join(ps))
        print(f"\nSCANNED {len(md)} notes, {len(assets)} assets"
              f"  (log.md {'included' if args.include_log else 'excluded'} from broken-link scan)")


if __name__ == "__main__":
    main()
