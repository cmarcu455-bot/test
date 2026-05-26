# Deploy on GitHub Pages (free)

Your live URL will be:

**https://cmarcu455-bot.github.io/test/app.html**

(Replace `cmarcu455-bot` / `test` if your GitHub user or repo name is different.)

## One-time setup

1. Push this project to GitHub (branch `main`).
2. On GitHub: **Settings → Pages → Build and deployment**
3. Set **Source** to **GitHub Actions** (not “Deploy from branch”).
4. Push again or run the **Deploy to GitHub Pages** workflow manually (**Actions** tab).

After the workflow finishes (about 1–2 minutes), open the URL above.

## Try the app

1. Open **Import/Export**
2. Upload `Apartment_Sales_Test_Data.xlsx` (included in the repo)
3. Click **Import Data**

## Notes

- Works over **HTTPS** (required for service worker / offline cache).
- Excel import uses the **SheetJS CDN** — you need internet the first time.
- Data stays in the **browser** on each device; export Excel to back up or move data.
- Do not commit secrets; this app has no backend.

## Push from your PC

```bash
git add app.html app.js index.html manifest.json sw.js package.json .gitignore .nojekyll .github Apartment_Sales_Test_Data.xlsx scripts/
git commit -m "Add GitHub Pages deployment and app updates"
git push origin main
```
