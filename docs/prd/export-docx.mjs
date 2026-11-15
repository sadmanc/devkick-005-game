// Builds a .docx from a Markdown file here (default PRD.md): renders each Mermaid diagram to a PNG in headless
// Edge/Chrome, swaps the diagrams for the images, then runs pandoc. Usage: node docs/prd/export-docx.mjs [PITCH.md]
// Needs: pandoc (on PATH or PANDOC=path), Edge or Chrome (or BROWSER=path), internet (Mermaid from a CDN).
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT_IMG = join(DIR, 'img', 'diagrams');
const PANDOC = process.env.PANDOC || 'pandoc';
const BROWSER =
  process.env.BROWSER ||
  ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!BROWSER) throw new Error('No Edge/Chrome found; set BROWSER=/path/to/browser');

const SRC = process.argv[2] || 'PRD.md';
const NAME = SRC.replace(/\.md$/i, '');
const md = readFileSync(join(DIR, SRC), 'utf8').replace(/\r\n/g, '\n');
const diagrams = [...md.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
mkdirSync(OUT_IMG, { recursive: true });

// 1. One HTML page with every diagram
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;width:1100px}
.d{display:inline-block;padding:16px;background:#fff}</style>
${diagrams.map((d, i) => `<div><div class="d" id="d${i}"${/^\s*gantt/.test(d) ? ' style="width:1060px"' : ''}><pre class="mermaid">${esc(d)}</pre></div></div>`).join('\n')}
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
try { await mermaid.run({ querySelector: '.mermaid' }); } catch (e) { window.__err = String(e); }
window.__done = true;
</script>`;
const htmlPath = join(tmpdir(), 'prd-diagrams.html');
writeFileSync(htmlPath, html);

// 2. Render and screenshot each diagram over the DevTools protocol
const profile = join(tmpdir(), 'prd-export-profile');
const browser = spawn(BROWSER, ['--headless=new', '--remote-debugging-port=9334', `--user-data-dir=${profile}`, 'about:blank']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let page;
for (let i = 0; i < 60 && !page; i += 1) {
  try { page = (await (await fetch('http://127.0.0.1:9334/json/list')).json()).find((t) => t.type === 'page'); } catch { /* not up yet */ }
  if (!page) await sleep(250);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); waiting.get(d.id)?.(d); waiting.delete(d.id); };
const send = (method, params = {}) => new Promise((r) => { id += 1; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;

await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 900, deviceScaleFactor: 2, mobile: false });
await send('Page.navigate', { url: pathToFileURL(htmlPath).href });
for (let i = 0; i < 120 && !(await evaluate('window.__done === true')); i += 1) await sleep(250);
const err = await evaluate('window.__err || ""');
if (err) console.warn('Mermaid warning:', err);
for (let i = 0; i < diagrams.length; i += 1) {
  const box = await evaluate(`(() => { const r = document.getElementById('d${i}').getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; })()`);
  const shot = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: box.w, height: box.h, scale: 2 },
  });
  writeFileSync(join(OUT_IMG, `${NAME}-${String(i + 1).padStart(2, '0')}.png`), Buffer.from(shot.result.data, 'base64'));
}
ws.close();
browser.kill();
console.log(`Rendered ${diagrams.length} diagrams`);

// 3. Markdown with images instead of Mermaid, then pandoc
let n = 0;
const forWord = md.replace(/```mermaid\n[\s\S]*?```/g, () => {
  n += 1;
  return `![](img/diagrams/${NAME}-${String(n).padStart(2, '0')}.png)`;
});
const tmpMd = join(DIR, `.${NAME}.word.md`);
writeFileSync(tmpMd, forWord);
try {
  execFileSync(PANDOC, [tmpMd, '-f', 'markdown+emoji', '-t', 'docx', ...(NAME === 'PRD' ? ['--toc', '--toc-depth=2'] : []), `--resource-path=${DIR}`, '-o', join(DIR, `${NAME}.docx`)], { stdio: 'inherit' });
} finally {
  rmSync(tmpMd, { force: true });
}
console.log(`Wrote docs/prd/${NAME}.docx`);
