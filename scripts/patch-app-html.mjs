import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'app.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const scriptStart = html.indexOf('    <script>');
const scriptEnd = html.indexOf('    <!-- XLSX Library - Working CDN with fallbacks -->');

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Could not find script boundaries', scriptStart, scriptEnd);
  process.exit(1);
}

const replacement = `    <script src="app.js?v=1.3"></script>

    `;

html = html.slice(0, scriptStart) + replacement + html.slice(scriptEnd);

html = html.replace('Version 1.2', 'Version 1.3');

fs.writeFileSync(htmlPath, html);
console.log('Patched app.html');
