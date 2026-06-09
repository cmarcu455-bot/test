import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'app.html'), 'utf8');
const start = html.indexOf('<script>') + 8;
const end = html.indexOf('</script>', start);
let code = html.slice(start, end).trim();

const boot = `function bootApp() {
    try {
        loadDataFromStorage();
        setupEventListeners();
        updateDataSummary();
        updateSearchStats();
        updateOnlineStatus();
        renderSearchEmptyState();
        initEditUi();
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            navigator.serviceWorker.register('sw.js').catch(function () {});
        }
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    } catch (err) {
        console.error('App startup failed:', err);
        var msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc3545;color:#fff;padding:16px;z-index:9999;font-family:sans-serif;';
        msg.textContent = 'App failed to start: ' + err.message + ' — try Ctrl+Shift+R or clear site data.';
        document.body.appendChild(msg);
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
} else {
    bootApp();
}`;

code = code.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{[\s\S]*?\n        \}\);/,
    boot
);

fs.writeFileSync(path.join(root, 'app.js'), code);
console.log('Wrote app.js', fs.statSync(path.join(root, 'app.js')).size, 'bytes');
