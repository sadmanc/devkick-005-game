# Product requirements (PRD)

- `PRD.md`: the product requirements document. Edit this one. Diagrams are Mermaid text blocks; they render
  on GitHub, in VS Code (Markdown Preview Mermaid extension) and in Notion (paste as a code block, language
  Mermaid).
- `PITCH.md` / `PITCH.docx`: the short version for judges and pitches (~5 pages + picture appendix).
- `PRD.docx`: Word copy for sharing. **Generated, don't edit it by hand**; re-export after changing `PRD.md`.
- `img/`: screenshots of the game (`01-…`–`09-…`) and rendered diagrams (`img/diagrams/`, made by the export).
- `sim/`: the seed and report of the synthetic audience simulation.

## Make the Word copy

```bash
node docs/prd/export-docx.mjs           # PRD.docx
node docs/prd/export-docx.mjs PITCH.md  # PITCH.docx
```

Needs [pandoc](https://pandoc.org/installing.html) on your PATH (or `PANDOC=/path/to/pandoc`), Edge or Chrome
(or `BROWSER=/path`), and internet (Mermaid loads from a CDN).
