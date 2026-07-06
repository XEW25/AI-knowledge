# Vault linting

Operating note for `90 System/scripts/vault_lint.py` — the link-integrity self-check for this vault. Plain Python 3, no dependencies.

## What it checks
- **Broken wikilinks**, split into two kinds:
  - **A) exists under a different filename** — a *real bug*: the target note exists but the link text doesn't match its filename. Fix the link (usually add the `Author - ` prefix, or write `[[Full filename|alias]]`). This is the failure mode that once floated the entire quantization cluster off the graph — see the 2026-07-06 log entries.
  - **B) no matching file / dangling** — usually *intentional*: a future page not yet written, or a name variant. Create the page or correct the name.
- **Orphan notes** — notes with no inbound wikilink from any other note.
- **Duplicate basenames** — two files share a basename, so `[[name]]` is ambiguous.

## How to run
From the vault root (the script auto-locates the vault, so it also runs from anywhere):
```
python "90 System/scripts/vault_lint.py"               # full report
python "90 System/scripts/vault_lint.py" --broken      # broken links only
python "90 System/scripts/vault_lint.py" --orphans     # orphans only
python "90 System/scripts/vault_lint.py" --include-log # also scan 90 System/log.md
```

## Resolution model (why links break)
Obsidian resolves `[[name]]` by **basename or relative path**. This vault has **no YAML `aliases`** (notes are `# Title` + bullet metadata), so a link works **iff a file of that basename exists**. Consequences:
- A clean paper title with a colon — `` `[[QuantVLA: Scale-Calibrated ...]]` `` — does **not** resolve: the file is `Zhang et al. - QuantVLA ...` and `:` is illegal in Windows filenames. **Link source notes by their full `Author - Title` filename** with a `|short alias` (see the naming guidance in [[90 System/AGENTS]]).
- Non-note assets (svg / png / jpg / pdf / html) count as valid targets, so `` `![[fig.svg]]` `` and `` `[[paper.pdf]]` `` resolve.

## Noise control (why the report is clean)
- Fenced ``` blocks and inline `` `code` `` are stripped before scanning, so documentation examples (like those above) are not miscounted as links.
- `90 System/log.md` is **append-only history**; it is excluded from the broken-link scan by default (its outbound links still count toward orphan detection). Use `--include-log` to inspect its historical/example danglers.

## Known-benign findings (baseline)
A clean run reads **0 broken-A / 0 broken-B / 1 orphan / 1 duplicate**:
- **Orphan `AGENTS.md`** (repo root) — the entry-point pointer file; being inbound-less is expected.
- **Duplicate basename `agents`** — root `AGENTS.md` vs `90 System/AGENTS.md`; links use the explicit path `` `[[90 System/AGENTS]]` ``, so there is no real ambiguity.
- With `--include-log`, a few folder/prose fragments (`` `[[00 Inbox]]` ``, `` `[[01 Raw]]` ``, …) inside old log entries — left as-is by the append-only convention.

Anything beyond this baseline is worth acting on: **Category A always, Category B as a to-do list** of pages to create.

## When to run
Part of the [[90 System/AGENTS|Lint workflow]]: after ingesting sources or renaming / moving notes, and periodically. Link health is *not* reliably eyeballable — unresolved links still render (just greyed), and the graph shows placeholder nodes — so use the linter, not inspection.

## Related
- [[90 System/AGENTS]] — operating guide (Lint workflow + naming guidance)
- [[90 System/index]] — the catalog this keeps honest

## tags
#system #tooling #lint #maintenance
