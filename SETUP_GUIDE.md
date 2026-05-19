# 🏢 Apartment Sales Manager - Complete Setup Guide

## Overview

This is a **Progressive Web App (PWA)** that works offline on Android tablets and syncs data with Excel when online.

**Key Features:**
- 📱 Works on any Android device (tablet or phone)
- 🔌 Works offline with local data storage
- 🔄 Auto-sync to Excel when online
- 🔍 Search buyers by name or apartment number
- ✅ Approve/reject with notes
- 📄 Generate PDF contracts
- 💾 Import/export Excel files

---

## Quick Start (5 minutes)

### Option A: Use Online Hosting (Easiest)
1. Upload files to Vercel/Netlify/GitHub Pages
2. Visit on Android tablet browser
3. Add to home screen

### Option B: Local Network (No External Server)
1. Use Python to host locally
2. Access from tablets on same WiFi
3. No internet required

### Option C: Download & Use Locally
1. Download app.html
2. Open in browser on tablet
3. Works 100% offline

---

## Detailed Setup Instructions

### 1. Prepare Your Files

You need these 3 files:
- `app.html` - Main application
- `sw.js` - Service worker (offline support)
- `manifest.json` - App configuration

---

### 2. Deploy to Free Hosting (Recommended)

#### Vercel (Easiest)
1. Go to vercel.com
2. Click "Upload"
3. Drag & drop your files
4. Get instant URL

#### GitHub Pages
1. Create GitHub account
2. Create new repository
3. Upload files to `/docs` folder
4. Enable GitHub Pages in settings

#### Netlify
1. Go to netlify.com
2. Drag & drop files to deploy
3. Get instant URL

---

### 3. Use Locally with Python (No Internet Needed)

Windows:
```bash
python -m http.server 8000
```

Mac/Linux:
```bash
python3 -m http.server 8000
```

Access from Android: `http://[YOUR-COMPUTER-IP]:8000/app.html`

---

### 4. Install on Android Tablet

1. Open browser → go to your app URL
2. Tap Menu (3 dots) → Add to Home screen
3. App appears as icon
4. Works offline!

---

## How to Use the App

### Import Excel Data
1. Go to: Data Management tab
2. Click: Upload Excel File
3. Select: Your Excel file
4. Click: Import Data

### Search for a Buyer
1. Go to: Search Buyer tab
2. Type: Buyer name OR apartment number
3. Click: Search
4. Click on card to select

### Approve/Review a Buyer
1. Select buyer from search
2. Review apartment details
3. See selected options
4. Choose status: Pending/Approved/Rejected
5. Add notes
6. Click: Save Approval

### Generate PDF Contract
1. Go to: Generate PDF tab
2. Search for buyer
3. Click on buyer card
4. Preview appears
5. Click: Download PDF
6. Print or save

### Export Data to Excel
1. Go to: Data Management tab
2. Click: Export Data
3. Excel file downloads with all approvals
4. Open in Excel to verify

---

## Excel File Structure

Your Excel file MUST have 4 sheets:

### Sheet 1: Apartments
```
apartment_number | bedroom_type | base_price | parking_spots | available
101              | 1            | 150000     | 1             | Yes
102              | 1            | 150000     | 1             | Yes
```

### Sheet 2: Styling_Options
```
option_category | option_choice      | upcharge | description
Flooring        | Standard Laminate  | 0        | Included
Flooring        | Premium Wood       | 5000     | Oak hardwood
```

### Sheet 3: Buyers
```
buyer_id | name       | email            | phone       | apartment_number | approval_status
B001     | John Smith | john@example.com | +1-555-0101 | 101              | Pending
```

### Sheet 4: Buyer_Selections
```
buyer_id | option_category | option_choice  | upcharge | selection_date
B001     | Flooring        | Premium Wood   | 5000     | 2025-05-18
```

**Use the provided template!**

---

## Offline Functionality

✅ Works offline:
- Search buyers
- View details
- Approve/reject
- Add notes
- Generate PDF
- Data saves locally

❌ Needs internet:
- Import Excel
- Export Excel
- Cloud sync

---

## Data Backup & Sync

### Regular Exports
- Every end of day: Click "Export Data"
- Save to cloud (OneDrive, Google Drive, Dropbox)
- Automatic backup

### Manual Sync Between Tablets
1. Tablet 1: Export data → Save to cloud
2. Tablet 2: Download file → Import data

---

## Troubleshooting

### Import fails
- Check Excel sheet names match exactly
- Check column headers are correct
- Save as .xlsx again in Excel

### Data not saving
- Clear browser cache
- Try different browser
- Restart tablet

### PDF won't generate
- Make sure buyer has all fields
- Try Chrome browser
- Check printer service available

### Offline not working
- First time must be online (cache app)
- Disable VPN/proxy
- Allow app to home screen

---

## Files Provided

1. **Apartment_Sales_Template.xlsx** - Excel template
2. **app.html** - Complete app
3. **sw.js** - Service worker
4. **manifest.json** - PWA config
5. **SETUP_GUIDE.md** - This guide

---

## Quick Checklist

- [ ] Download all files
- [ ] Fill in Excel template
- [ ] Test on desktop first
- [ ] Deploy to hosting or local server
- [ ] Test on Android tablet
- [ ] Add to home screen
- [ ] Test offline mode
- [ ] Export to verify data
- [ ] Set up backup schedule

---

Happy selling! 🏢
