# Code → Image

A small tool that renders pasted code with Prism.js highlighting and exports it as an image using html2canvas.

**How to use locally**
1. Serve the folder (e.g. `python3 -m http.server 8000`) and open `tools/code-to-image/index.html`
2. Paste code, choose language, click "Download PNG"

**Notes**
- Uses CDN for Prism.js and html2canvas to avoid build steps.
- Keep the tool folder structure consistent with the repository's `tools/` layout.
