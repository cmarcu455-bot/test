const REQUIRED_SHEETS = ['Apartments', 'Styling_Options', 'Buyers', 'Buyer_Selections'];
const STORAGE_KEY = 'apartmentSalesAppData_v1';

let appData = {
    apartments: [],
    buyers: [],
    stylingOptions: [],
    buyerSelections: [],
    selectedBuyer: null
};

let currentExcelFile = null;
let currentBuyerForPdf = null;
let editTab = 'apartments';
let editIndex = null;

// Global settings
let currentLang = localStorage.getItem('appLanguage') || 'en';
let currentTheme = localStorage.getItem('appTheme') || 'dark';

// Canvas Signature variables
let signatureCanvas = null;
let signatureCtx = null;
let isDrawingSignature = false;
let signatureImage = null; // Store base64 data url

// Translation Dictionary
const TRANSLATIONS = {
    en: {
        appHeaderTitle: "Apartment Sales Manager",
        tabDashboard: "📊 Dashboard",
        tabSearch: "🔍 Search Buyer",
        tabApprove: "✅ Approve/Review",
        tabPdf: "📄 Generate PDF",
        tabEdit: "✏️ Edit Data",
        tabData: "📤 Import/Export",
        
        dashTitle: "Sales Dashboard",
        dashSubtitle: "Overview of apartments, buyer pipeline, and sales value",
        kpiAptsTitle: "Apartments Sold",
        kpiAptsDetail: "{pct}% occupancy rate",
        kpiBuyersTitle: "Active Buyers",
        kpiBuyersDetail: "{count} pending approval",
        kpiContractsTitle: "Signed Contracts",
        kpiContractsDetail: "{pct}% of approved buyers",
        kpiRevenueTitle: "Total Sales Revenue",
        kpiRevenueDetail: "Approved: {val}",
        chartBedsTitle: "Apartments by Bedroom Type",
        chartStatusTitle: "Buyers Pipeline",
        shortcutsTitle: "Quick Actions",
        actionImport: "Import Excel",
        actionSearch: "Search Buyers",
        actionAddBuyer: "Add New Buyer",
        actionExport: "Export Data",

        searchTitle: "Search Buyer or Apartment",
        searchSubtitle: "Instantly look up profiles, selections, and status",
        lblStatusFilter: "Filter by status:",
        optStatusAll: "All statuses",
        optStatusPending: "Pending",
        optStatusApproved: "Approved",
        optStatusRejected: "Rejected",

        approveTitle: "Approve / Review Selections",
        approveSubtitle: "Customize styling choices and record approval decisions",
        panelBuyerTitle: "Buyer Information",
        panelAptTitle: "Apartment Details",
        panelOptionsTitle: "Selected Styling & Pricing",
        panelDecisionTitle: "Approval Decision",
        lblDecisionStatus: "Decision Status",
        lblDecisionNotes: "Decision Notes / Details",
        btnSaveApproval: "💾 Save Approval",
        btnCancel: "Cancel",

        pdfTitle: "Generate Purchase Agreement",
        pdfSubtitle: "Create printable contract PDFs with digital signatures",
        pdfSelectBuyerTitle: "Select Buyer",
        pdfContractPreviewTitle: "Agreement Preview",
        sigTitle: "Client Digital Signature",
        btnClearSig: "🧹 Clear",
        btnApplySig: "✓ Apply Signature",
        btnPrintPdf: "📥 Print / Save PDF",
        btnClosePreview: "Close Preview",

        editTitle: "Edit Local Inventory",
        editSubtitle: "Add, remove, or modify items directly in browser storage",
        tabEditApt: "🏠 Apartments",
        tabEditBuyer: "👤 Buyers",
        tabEditOptions: "🎨 Styling Options",
        tabEditSelections: "📋 Buyer Selections",

        dataTitle: "Data Import / Export",
        dataSubtitle: "Sync local changes back into apartment Excel sheets",
        panelExcelTitle: "Excel File Management",
        dataExcelDesc: "Upload your Excel file to load data, or edit in the app and export back to Excel. Required sheets: Apartments, Styling_Options, Buyers, Buyer_Selections.",
        dataExcelHint: "Required sheets (exact case-sensitive names): Apartments, Styling_Options, Buyers, Buyer_Selections",
        lblExcelUpload: "Upload Excel File (.xlsx)",
        btnImportData: "📤 Import Data",
        btnExportData: "📥 Export Data",
        btnClearAll: "🗑️ Clear All Data",
        panelSummaryTitle: "Database Statistics Summary",
        tblTotalApts: "Total Apartments:",
        tblTotalBuyers: "Total Buyers:",
        tblPendingApp: "Pending Approvals:",
        tblApprovedApp: "Approved Sales:",
        tblRejectedApp: "Rejected Sales:",
        tblSignedApp: "Contracts Signed:",

        footAppName: "Apartment Sales Manager",
        footOfflineHint: "Works offline after first load",
        lblLastUpdated: "Last updated:",
        
        msgSelectBuyerApproval: "Select a buyer from search first",
        msgSelectAptApproval: "Select a buyer from search first",
        msgSelectOptionsApproval: "Select a buyer from search first",
        lblOnline: "Online",
        lblOffline: "Offline — data saved on this device",
        
        toastSaved: "Data saved locally",
        toastErrorSave: "Error saving data — storage may be full",
        toastNoBuyers: "No buyers loaded — import Excel first",
        toastNoResults: "No results found",
        toastSelectFirst: "Select a buyer and preview the contract first",
        toastPopupBlocked: "Allow pop-ups to print or save as PDF",
        toastPrintSaveDialog: "Use \"Save as PDF\" in the print dialog for {name}",
        toastImported: "Imported {apts} apartments, {buyers} buyers",
        toastExcelFailed: "Excel library not loaded. Check connection and refresh.",
        toastNoExcelRows: "No rows loaded. Check headers: apartment_number, buyer_id, etc.",
        toastNothingExport: "Nothing to export — import data first",
        toastExcelDownloaded: "Excel file downloaded",
        toastAllCleared: "All data cleared",
        toastSigSaved: "Signature applied successfully!",
        toastApprovalSaved: "Approval saved for {name}",
        toastAptRequired: "Apartment number is required",
        toastAptExists: "Apartment number already exists",
        toastBuyerFields: "Buyer ID and name are required",
        toastBuyerApt: "Select an apartment",
        toastBuyerExists: "Buyer ID already exists",
        toastOptionFields: "Category and choice are required",
        toastSelectionFields: "Buyer, category, and choice are required",
        
        lblAptNum: "Apartment number *",
        lblBeds: "Bedrooms",
        lblBasePrice: "Base price ($)",
        lblParking: "Parking spots",
        lblAvailable: "Available",
        btnAddApt: "Add apartment",
        btnSaveApt: "Save changes",
        lblBuyerId: "Buyer ID *",
        lblFullName: "Full name *",
        lblAptSelect: "Apartment *",
        lblEmail: "Email",
        lblPhone: "Phone",
        lblAppStatus: "Approval status",
        lblContractSigned: "Contract signed",
        lblAppNotes: "Approval notes",
        btnAddBuyer: "Add buyer",
        lblCategory: "Category *",
        lblChoice: "Choice *",
        lblUpcharge: "Upcharge ($)",
        lblDescription: "Description",
        btnAddOption: "Add option",
        lblBuyerSelect: "Buyer *",
        lblSelDate: "Selection date",
        lblNotes: "Notes",
        btnAddSelection: "Add selection"
    },
    ro: {
        appHeaderTitle: "Manager Vânzări Apartamente",
        tabDashboard: "📊 Dashboard",
        tabSearch: "🔍 Căutare Cumpărător",
        tabApprove: "✅ Aprobare/Recenzie",
        tabPdf: "📄 Generare PDF",
        tabEdit: "✏️ Editare Date",
        tabData: "📤 Import/Export",
        
        dashTitle: "Panou Vânzări",
        dashSubtitle: "Privire de ansamblu asupra apartamentelor, fluxului de cumpărători și valorii vânzărilor",
        kpiAptsTitle: "Apartamente Vândute",
        kpiAptsDetail: "Rată de ocupare {pct}%",
        kpiBuyersTitle: "Cumpărători Activi",
        kpiBuyersDetail: "{count} în așteptare pentru aprobare",
        kpiContractsTitle: "Contracte Semnate",
        kpiContractsDetail: "{pct}% din cumpărătorii aprobați",
        kpiRevenueTitle: "Venituri Totale Vânzări",
        kpiRevenueDetail: "Aprobate: {val}",
        chartBedsTitle: "Apartamente după Număr Camere",
        chartStatusTitle: "Flux Cumpărători",
        shortcutsTitle: "Acțiuni Rapide",
        actionImport: "Importă Excel",
        actionSearch: "Caută Cumpărători",
        actionAddBuyer: "Adaugă Cumpărător",
        actionExport: "Exportă Date",

        searchTitle: "Caută Cumpărător sau Apartament",
        searchSubtitle: "Căutare rapidă profiluri, opțiuni de stil și status",
        lblStatusFilter: "Filtrare după status:",
        optStatusAll: "Toate statusurile",
        optStatusPending: "În așteptare",
        optStatusApproved: "Aprobat",
        optStatusRejected: "Respins",

        approveTitle: "Aprobare / Recenzie Selecții",
        approveSubtitle: "Personalizare opțiuni stil și înregistrare decizie aprobare",
        panelBuyerTitle: "Informații Cumpărător",
        panelAptTitle: "Detalii Apartament",
        panelOptionsTitle: "Opțiuni Stil & Prețuri Selectate",
        panelDecisionTitle: "Decizie Aprobare",
        lblDecisionStatus: "Status Decizie",
        lblDecisionNotes: "Note Decizie / Detalii",
        btnSaveApproval: "💾 Salvează Aprobarea",
        btnCancel: "Renunță",

        pdfTitle: "Generare Contract Achiziție",
        pdfSubtitle: "Creare contract PDF pentru printare cu semnături digitale",
        pdfSelectBuyerTitle: "Selectare Cumpărător",
        pdfContractPreviewTitle: "Previzualizare Contract",
        sigTitle: "Semnătură Digitală Client",
        btnClearSig: "🧹 Șterge",
        btnApplySig: "✓ Aplică Semnătura",
        btnPrintPdf: "📥 Printează / Salvează PDF",
        btnClosePreview: "Închide Previzualizarea",

        editTitle: "Editare Inventar Local",
        editSubtitle: "Adăugare, ștergere sau modificare elemente direct în stocarea browserului",
        tabEditApt: "🏠 Apartamente",
        tabEditBuyer: "👤 Cumpărători",
        tabEditOptions: "🎨 Opțiuni Stil",
        tabEditSelections: "📋 Selecții Cumpărător",

        dataTitle: "Import / Export Date",
        dataSubtitle: "Sincronizare modificări locale înapoi în fișierele Excel",
        panelExcelTitle: "Administrare Fișier Excel",
        dataExcelDesc: "Încărcați fișierul Excel pentru a citi datele, sau editați în aplicație și exportați înapoi în Excel. Foi necesare: Apartments, Styling_Options, Buyers, Buyer_Selections.",
        dataExcelHint: "Foi necesare (denumiri exacte caz-senzitive): Apartments, Styling_Options, Buyers, Buyer_Selections",
        lblExcelUpload: "Încărcare Fișier Excel (.xlsx)",
        btnImportData: "📤 Importă Date",
        btnExportData: "📥 Exportă Date",
        btnClearAll: "🗑️ Șterge Toate Datele",
        panelSummaryTitle: "Sumar Statistici Bază Date",
        tblTotalApts: "Total Apartamente:",
        tblTotalBuyers: "Total Cumpărători:",
        tblPendingApp: "Aprobări în Așteptare:",
        tblApprovedApp: "Vânzări Aprobate:",
        tblRejectedApp: "Vânzări Respinse:",
        tblSignedApp: "Contracte Semnate:",

        footAppName: "Manager Vânzări Apartamente",
        footOfflineHint: "Funcționează offline după prima încărcare",
        lblLastUpdated: "Ultima actualizare:",
        
        msgSelectBuyerApproval: "Selectați mai întâi un cumpărător din căutare",
        msgSelectAptApproval: "Selectați mai întâi un cumpărător din căutare",
        msgSelectOptionsApproval: "Selectați mai întâi un cumpărător din căutare",
        lblOnline: "Conectat",
        lblOffline: "Deconectat — datele sunt salvate local pe dispozitiv",
        
        toastSaved: "Date salvate local cu succes",
        toastErrorSave: "Eroare la salvarea datelor — stocarea locală ar putea fi plină",
        toastNoBuyers: "Nu există cumpărători încărcați — importă Excel mai întâi",
        toastNoResults: "Nu s-au găsit rezultate",
        toastSelectFirst: "Selectați un cumpărător și previzualizați contractul",
        toastPopupBlocked: "Permiteți ferestrele pop-up pentru a printa sau salva PDF-ul",
        toastPrintSaveDialog: "Folosiți \"Save as PDF\" în fereastra de printare pentru {name}",
        toastImported: "S-au importat {apts} apartamente și {buyers} cumpărători",
        toastExcelFailed: "Librăria Excel nu s-a putut încărca. Verificați conexiunea.",
        toastNoExcelRows: "Nu s-au putut încărca rânduri. Verificați capetele de tabel.",
        toastNothingExport: "Nimic de exportat — importați date mai întâi",
        toastExcelDownloaded: "Fișierul Excel a fost descărcat",
        toastAllCleared: "Toate datele au fost șterse",
        toastSigSaved: "Semnătura a fost aplicată cu succes!",
        toastApprovalSaved: "Decizia de aprobare a fost salvată pentru {name}",
        toastAptRequired: "Numărul apartamentului este obligatoriu",
        toastAptExists: "Acest număr de apartament există deja în bază",
        toastBuyerFields: "ID cumpărător și numele sunt obligatorii",
        toastBuyerApt: "Selectați un apartament",
        toastBuyerExists: "Acest ID cumpărător există deja în bază",
        toastOptionFields: "Categoria și opțiunea de stil sunt obligatorii",
        toastSelectionFields: "Cumpărătorul, categoria și opțiunea sunt obligatorii",
        
        lblAptNum: "Număr apartament *",
        lblBeds: "Camere",
        lblBasePrice: "Preț de bază ($)",
        lblParking: "Locuri parcare",
        lblAvailable: "Disponibil",
        btnAddApt: "Adaugă apartament",
        btnSaveApt: "Salvează modificările",
        lblBuyerId: "ID Cumpărător *",
        lblFullName: "Nume complet *",
        lblAptSelect: "Apartament *",
        lblEmail: "Email",
        lblPhone: "Telefon",
        lblAppStatus: "Status Aprobare",
        lblContractSigned: "Contract semnat",
        lblAppNotes: "Note aprobare",
        btnAddBuyer: "Adaugă cumpărător",
        lblCategory: "Categorie *",
        lblChoice: "Opțiune stil *",
        lblUpcharge: "Cost suplimentar ($)",
        lblDescription: "Descriere",
        btnAddOption: "Adaugă opțiune",
        lblBuyerSelect: "Cumpărător *",
        lblSelDate: "Dată selecție",
        lblNotes: "Note",
        btnAddSelection: "Adaugă selecție"
    }
};

function getTranslation(key, replacements = {}) {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
    let text = langDict[key] || TRANSLATIONS['en'][key] || key;
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}

function translateUI() {
    // Translate textContent for elements with direct matching IDs
    const elementsToTranslate = [
        'appHeaderTitle', 'tabDashboard', 'tabSearch', 'tabApprove', 'tabPdf', 'tabEdit', 'tabData',
        'dashTitle', 'dashSubtitle', 'kpiAptsTitle', 'kpiBuyersTitle', 'kpiContractsTitle', 'kpiRevenueTitle',
        'chartBedsTitle', 'chartStatusTitle', 'shortcutsTitle', 'actionImport', 'actionSearch', 'actionAddBuyer', 'actionExport',
        'searchTitle', 'searchSubtitle', 'lblStatusFilter', 'optStatusAll', 'optStatusPending', 'optStatusApproved', 'optStatusRejected',
        'approveTitle', 'approveSubtitle', 'panelBuyerTitle', 'panelAptTitle', 'panelOptionsTitle', 'panelDecisionTitle',
        'lblDecisionStatus', 'lblDecisionNotes', 'saveApprovalBtn', 'pdfTitle', 'pdfSubtitle', 'pdfSelectBuyerTitle',
        'pdfContractPreviewTitle', 'sigTitle', 'clearSignatureBtn', 'saveSignatureBtn', 'downloadPdfBtn', 'closePdfBtn',
        'editTitle', 'editSubtitle', 'tabEditApt', 'tabEditBuyer', 'tabEditOptions', 'tabEditSelections',
        'dataTitle', 'dataSubtitle', 'panelExcelTitle', 'dataExcelDesc', 'dataExcelHint', 'lblExcelUpload',
        'importExcelBtn', 'exportExcelBtn', 'clearDataBtn', 'panelSummaryTitle', 'tblTotalApts', 'tblTotalBuyers',
        'tblPendingApp', 'tblApprovedApp', 'tblRejectedApp', 'tblSignedApp', 'footAppName', 'footOfflineHint', 'lblLastUpdated'
    ];

    elementsToTranslate.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = getTranslation(id);
    });

    // Translate cancel buttons separately (multiple might exist)
    document.querySelectorAll('#cancelApprovalBtn').forEach(el => {
        el.textContent = getTranslation('btnCancel');
    });

    // Translate placeholders
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = getTranslation('searchSubtitle');
    const pdfSearchInput = document.getElementById('pdfSearchInput');
    if (pdfSearchInput) pdfSearchInput.placeholder = getTranslation('pdfSelectBuyerTitle');
    const approvalNotes = document.getElementById('approvalNotes');
    if (approvalNotes) approvalNotes.placeholder = getTranslation('lblDecisionNotes');

    // Update connection status
    updateOnlineStatus();

    // Check empty messages if no buyer is selected
    if (!appData.selectedBuyer) {
        ['buyerInfo', 'apartmentInfo'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p style="color: var(--text-muted);">${getTranslation('msgSelectBuyerApproval')}</p>`;
        });
        const optEl = document.getElementById('optionsReview');
        if (optEl) optEl.innerHTML = `<p style="color: var(--text-muted);">${getTranslation('msgSelectOptionsApproval')}</p>`;
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
    document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
    document.getElementById('btnLangRo').classList.toggle('active', lang === 'ro');
    translateUI();
    renderDashboard();
    if (editTab && typeof renderEditPanel === 'function') renderEditPanel();
}

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('appTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('btnThemeLight').classList.toggle('active', theme === 'light');
    document.getElementById('btnThemeDark').classList.toggle('active', theme === 'dark');
}

function initThemeAndLanguage() {
    // Set active states on buttons
    document.getElementById('btnLangEn').classList.toggle('active', currentLang === 'en');
    document.getElementById('btnLangRo').classList.toggle('active', currentLang === 'ro');
    document.getElementById('btnThemeLight').classList.toggle('active', currentTheme === 'light');
    document.getElementById('btnThemeDark').classList.toggle('active', currentTheme === 'dark');
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    translateUI();
}

function bootApp() {
    try {
        loadDataFromStorage();
        initThemeAndLanguage();
        setupEventListeners();
        updateDataSummary();
        updateSearchStats();
        initSignaturePad();
        renderDashboard();
        renderSearchEmptyState();
        if (typeof initEditUi === 'function') initEditUi();
        
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
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(section).classList.add('active');
            
            if (section === 'dashboard') renderDashboard();
            if (section === 'edit' && typeof renderEditPanel === 'function') renderEditPanel();
        });
    });

    document.getElementById('searchBtn').addEventListener('click', searchBuyers);
    document.getElementById('clearSearchBtn').addEventListener('click', clearSearch);
    document.getElementById('browseAllBtn').addEventListener('click', () => listBuyers({ showAll: true }));
    document.getElementById('statusFilter').addEventListener('change', searchBuyers);

    document.getElementById('searchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchBuyers();
    });
    document.getElementById('searchInput').addEventListener('input', () => {
        const term = document.getElementById('searchInput').value.trim();
        if (!term) listBuyers({ showAll: true });
    });

    document.getElementById('pdfSearchBtn').addEventListener('click', () => searchForPdf(false));
    document.getElementById('pdfShowAllBtn').addEventListener('click', () => searchForPdf(true));
    document.getElementById('pdfSearchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchForPdf();
    });

    document.getElementById('searchResults').addEventListener('click', onBuyerCardClick);
    document.getElementById('pdfSearchResults').addEventListener('click', onPdfCardClick);

    document.getElementById('saveApprovalBtn').addEventListener('click', saveApproval);
    document.getElementById('cancelApprovalBtn').addEventListener('click', cancelApproval);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('closePdfBtn').addEventListener('click', closePdfPreview);

    document.getElementById('importExcelBtn').addEventListener('click', importExcel);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);

    document.getElementById('excelFile').addEventListener('change', (e) => {
        currentExcelFile = e.target.files[0] || null;
        const nameEl = document.getElementById('excelFileName');
        nameEl.textContent = currentExcelFile ? `${getTranslation('optStatusApproved')}: ${currentExcelFile.name}` : '';
    });
}

// Global router navigation shortcut
function goToTab(tabId, editSubTab = null) {
    const btn = document.querySelector(`[data-section="${tabId}"]`);
    if (btn) {
        if (editSubTab) editTab = editSubTab;
        btn.click();
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function str(val) {
    return val == null ? '' : String(val).trim();
}

function num(val) {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
}

function statusClass(status) {
    const s = str(status).toLowerCase();
    if (s === 'approved' || s === 'rejected' || s === 'pending') return s;
    return 'pending';
}

function normalizeApartment(row) {
    return {
        apartment_number: str(row.apartment_number),
        bedroom_type: row.bedroom_type,
        base_price: num(row.base_price),
        parking_spots: row.parking_spots,
        available: str(row.available) || 'Yes'
    };
}

function normalizeBuyer(row) {
    return {
        buyer_id: str(row.buyer_id),
        name: str(row.name),
        email: str(row.email),
        phone: str(row.phone),
        apartment_number: str(row.apartment_number),
        approval_status: str(row.approval_status) || 'Pending',
        approval_notes: str(row.approval_notes),
        approval_date: str(row.approval_date),
        contract_signed: row.contract_signed === true || str(row.contract_signed).toLowerCase() === 'yes' ? 'Yes' : 'No'
    };
}

function normalizeSelection(row) {
    return {
        buyer_id: str(row.buyer_id),
        option_category: str(row.option_category),
        option_choice: str(row.option_choice),
        upcharge: num(row.upcharge),
        selection_date: str(row.selection_date),
        option_notes: str(row.option_notes)
    };
}

function normalizeStyling(row) {
    return {
        option_category: str(row.option_category),
        option_choice: str(row.option_choice),
        upcharge: num(row.upcharge),
        description: str(row.description)
    };
}

function loadDataFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('appData');
        if (!stored) return;
        const parsed = JSON.parse(stored);
        appData = {
            apartments: (parsed.apartments || []).map(normalizeApartment),
            buyers: (parsed.buyers || []).map(normalizeBuyer),
            stylingOptions: (parsed.stylingOptions || []).map(normalizeStyling),
            buyerSelections: (parsed.buyerSelections || []).map(normalizeSelection),
            selectedBuyer: null
        };
        if (localStorage.getItem('appData') && !localStorage.getItem(STORAGE_KEY)) {
            saveDataToStorage(true);
        }
    } catch (e) {
        console.error('Error loading data:', e);
        showToast(getTranslation('toastErrorSave'), 'error');
    }
}

function saveDataToStorage(silent = false) {
    try {
        const payload = {
            apartments: appData.apartments,
            buyers: appData.buyers,
            stylingOptions: appData.stylingOptions,
            buyerSelections: appData.buyerSelections
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        updateLastSync();
        if (!silent) showToast(getTranslation('toastSaved'), 'success');
    } catch (e) {
        console.error('Error saving data:', e);
        showToast(getTranslation('toastErrorSave'), 'error');
    }
}

function buyerMatchesSearch(buyer, searchTerm) {
    const name = str(buyer.name).toLowerCase();
    const apt = str(buyer.apartment_number).toLowerCase();
    const id = str(buyer.buyer_id).toLowerCase();
    return name.includes(searchTerm) || apt.includes(searchTerm) || id.includes(searchTerm);
}

function listBuyers({ showAll = false } = {}) {
    if (!appData.buyers.length) {
        renderSearchEmptyState();
        return;
    }
    const statusFilter = document.getElementById('statusFilter').value;
    let results = [...appData.buyers];
    if (statusFilter) {
        results = results.filter(b => str(b.approval_status) === statusFilter);
    }
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm && !showAll) {
        results = results.filter(b => buyerMatchesSearch(b, searchTerm));
    }
    displaySearchResults(results);
}

function searchBuyers() {
    if (!appData.buyers.length) {
        showToast(getTranslation('toastNoBuyers'), 'error');
        renderSearchEmptyState();
        return;
    }
    listBuyers();
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');

    if (results.length === 0) {
        container.innerHTML = `<div class="no-results"><p>${getTranslation('toastNoResults')}</p></div>`;
        return;
    }

    container.innerHTML = results.map(buyer => {
        const trReview = currentLang === 'ro' ? 'Revizuiește' : 'Review';
        const trPdf = currentLang === 'ro' ? 'Contract' : 'PDF';
        const statusBadgeLabel = getTranslation('optStatus' + buyer.approval_status) || buyer.approval_status;
        
        return `
        <div class="glass-panel buyer-card ${appData.selectedBuyer && appData.selectedBuyer.buyer_id === buyer.buyer_id ? 'selected' : ''}" data-buyer-id="${escapeHtml(buyer.buyer_id)}">
            <h3>${escapeHtml(buyer.name)}</h3>
            <p><strong>Apt:</strong> ${escapeHtml(buyer.apartment_number)}</p>
            <p><strong>Email:</strong> ${escapeHtml(buyer.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(buyer.phone)}</p>
            <span class="status-badge ${statusClass(buyer.approval_status)}">${escapeHtml(statusBadgeLabel)}</span>
            <div class="buyer-card-actions">
                <button type="button" class="primary" onclick="selectBuyerForApproval('${escapeHtml(buyer.buyer_id)}')">${trReview}</button>
                <button type="button" class="secondary" onclick="previewPdfTab('${escapeHtml(buyer.buyer_id)}')">${trPdf}</button>
            </div>
        </div>
    `}).join('');
}

function renderSearchEmptyState() {
    const container = document.getElementById('searchResults');
    if (appData.buyers.length) return;
    
    const textRO = `<p><strong>Nu există date încărcate.</strong></p><p style="margin-top:8px;">Mergi la <strong>Import/Export</strong> și încarcă fișierul Excel de test, apoi revino aici pentru a căuta.</p>`;
    const textEN = `<p><strong>No data loaded yet</strong></p><p style="margin-top:8px;">Go to <strong>Import/Export</strong> and import the Excel data file, then return here to search.</p>`;

    container.innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px;opacity:0.6;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M21 9H3M21 15H3M12 3v18"/></svg>
            ${currentLang === 'ro' ? textRO : textEN}
        </div>`;
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('searchResults').innerHTML = '';
    renderSearchEmptyState();
}

function onBuyerCardClick(e) {
    const card = e.target.closest('.buyer-card');
    if (!card) return;
    if (e.target.tagName === 'BUTTON') return; // Handled by inline actions
    selectBuyerForApproval(card.dataset.buyerId);
}

function onPdfCardClick(e) {
    const card = e.target.closest('.buyer-card');
    if (!card) return;
    previewPdf(card.dataset.buyerId);
}

function previewPdfTab(buyerId) {
    goToTab('pdf');
    previewPdf(buyerId);
}

function selectBuyerForApproval(buyerId) {
    const buyer = appData.buyers.find(b => b.buyer_id === buyerId);
    if (!buyer) return;

    appData.selectedBuyer = buyer;
    displayBuyerApprovalForm();
    
    // Switch to Approve section
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-section="approve"]').classList.add('active');
    document.getElementById('approve').classList.add('active');
}

function displayBuyerApprovalForm() {
    const buyer = appData.selectedBuyer;
    if (!buyer) return;

    const apartment = appData.apartments.find(a => a.apartment_number === buyer.apartment_number);

    document.getElementById('buyerInfo').innerHTML = `
        <div class="detail-row"><span>Name:</span><span>${escapeHtml(buyer.name)}</span></div>
        <div class="detail-row"><span>ID:</span><span>${escapeHtml(buyer.buyer_id)}</span></div>
        <div class="detail-row"><span>Email:</span><span>${escapeHtml(buyer.email)}</span></div>
        <div class="detail-row"><span>Phone:</span><span>${escapeHtml(buyer.phone)}</span></div>
        <div class="detail-row"><span>Signed Contract:</span><span>${escapeHtml(buyer.contract_signed)}</span></div>`;

    if (apartment) {
        document.getElementById('apartmentInfo').innerHTML = `
            <div class="detail-row"><span>Unit:</span><span>${escapeHtml(apartment.apartment_number)}</span></div>
            <div class="detail-row"><span>Type:</span><span>${escapeHtml(apartment.bedroom_type)} Bedroom</span></div>
            <div class="detail-row"><span>Base Price:</span><span>${formatPrice(apartment.base_price)}</span></div>
            <div class="detail-row"><span>Parking Spots:</span><span>${escapeHtml(apartment.parking_spots)}</span></div>
            <div class="detail-row"><span>Available:</span><span>${escapeHtml(apartment.available)}</span></div>`;
    } else {
        document.getElementById('apartmentInfo').innerHTML =
            `<p style="color:hsl(var(--danger));font-size:13px;font-weight:600;">Apartment ${escapeHtml(buyer.apartment_number)} not found in inventory. Check excel file.</p>`;
    }

    // Render interactive styling selector
    renderInteractiveOptionsSelector(buyer, apartment);

    document.getElementById('approvalStatus').value = buyer.approval_status || 'Pending';
    document.getElementById('approvalNotes').value = buyer.approval_notes || '';
    document.getElementById('approvalForm').style.display = 'block';
    document.getElementById('syncInfo').style.display = 'block';
}

function renderInteractiveOptionsSelector(buyer, apartment) {
    const optionsReviewContainer = document.getElementById('optionsReview');
    if (!appData.stylingOptions.length) {
        optionsReviewContainer.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No styling options catalog loaded.</p>';
        return;
    }

    // Group available options by category
    const categories = stylingCategories();
    const selections = appData.buyerSelections.filter(s => s.buyer_id === buyer.buyer_id);
    
    let html = '<div class="options-accordion">';
    
    categories.forEach((cat, index) => {
        const activeSel = selections.find(s => s.option_category === cat);
        const choices = choicesForCategory(cat);
        const isCollapsedKey = `opt_collapsed_${cat}`;
        const isCollapsed = localStorage.getItem(isCollapsedKey) === 'true';

        html += `
            <div class="option-accordion-item">
                <div class="option-cat-header ${isCollapsed ? 'collapsed' : ''}" onclick="toggleOptionCategoryAccordion('${escapeHtml(cat)}')">
                    <span>${escapeHtml(cat)}</span>
                    <span style="font-size: 12px; opacity:0.8; font-weight:normal;">${activeSel ? activeSel.option_choice + ' (+' + formatPrice(activeSel.upcharge) + ')' : '(Standard)'}</span>
                </div>
                <div class="option-choices-list ${isCollapsed ? 'collapsed' : ''}" id="cat_list_${escapeHtml(cat)}">
                    <!-- Standard Option -->
                    <div class="choice-selection-card ${!activeSel ? 'selected' : ''}" onclick="selectStylingOption('${escapeHtml(buyer.buyer_id)}', '${escapeHtml(cat)}', '', 0)">
                        <input type="radio" name="opt_choice_${index}" class="choice-radio-input" ${!activeSel ? 'checked' : ''}>
                        <div class="choice-info">
                            <div class="choice-title-price">
                                <span>Standard / Included</span>
                                <span class="choice-price">$0.00</span>
                            </div>
                            <div class="choice-desc">Default builder finishes</div>
                        </div>
                    </div>
        `;

        choices.forEach(ch => {
            const isSelected = activeSel && activeSel.option_choice === ch.option_choice;
            html += `
                <div class="choice-selection-card ${isSelected ? 'selected' : ''}" onclick="selectStylingOption('${escapeHtml(buyer.buyer_id)}', '${escapeHtml(cat)}', '${escapeHtml(ch.option_choice)}', ${ch.upcharge})">
                    <input type="radio" name="opt_choice_${index}" class="choice-radio-input" ${isSelected ? 'checked' : ''}>
                    <div class="choice-info">
                        <div class="choice-title-price">
                            <span>${escapeHtml(ch.option_choice)}</span>
                            <span class="choice-price">+${formatPrice(ch.upcharge)}</span>
                        </div>
                        ${ch.description ? `<div class="choice-desc">${escapeHtml(ch.description)}</div>` : ''}
                    </div>
                </div>
            `;
        });

        // Add inline selection notes if option selected
        if (activeSel) {
            html += `
                <div class="option-notes-box">
                    <label style="font-size:11px;font-weight:600;color:var(--text-secondary);">Selection note for ${escapeHtml(cat)}:</label>
                    <input type="text" id="note_input_${escapeHtml(cat)}" value="${escapeHtml(activeSel.option_notes)}" 
                        placeholder="Timeline or delivery note..." style="padding: 6px 10px; margin-top: 4px; font-size:12px;" 
                        onchange="updateSelectionNote('${escapeHtml(buyer.buyer_id)}', '${escapeHtml(cat)}', this.value)">
                </div>
            `;
        }

        html += `</div></div>`;
    });

    // Compute prices
    let totalUpcharge = 0;
    selections.forEach(sel => {
        totalUpcharge += num(sel.upcharge);
    });
    const basePrice = apartment ? num(apartment.base_price) : 0;
    const grandTotal = basePrice + totalUpcharge;

    html += `
        <div class="price-summary-box">
            <div class="sub-total">Base Unit Price: ${formatPrice(basePrice)}</div>
            <div class="sub-total">Total Styling Upcharges: +${formatPrice(totalUpcharge)}</div>
            <div class="grand-total">Total Price: ${formatPrice(grandTotal)}</div>
        </div>
    `;

    html += '</div>';
    optionsReviewContainer.innerHTML = html;
}

function toggleOptionCategoryAccordion(category) {
    const key = `opt_collapsed_${category}`;
    const collapsed = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, (!collapsed).toString());
    
    // Refresh selections layout
    if (appData.selectedBuyer) {
        displayBuyerApprovalForm();
    }
}

function selectStylingOption(buyerId, category, choice, upcharge) {
    // Check if selection exists
    const idx = appData.buyerSelections.findIndex(s => s.buyer_id === buyerId && s.option_category === category);
    
    if (choice === '') {
        // Remove selection (Standard choice selected)
        if (idx >= 0) {
            appData.buyerSelections.splice(idx, 1);
        }
    } else {
        if (idx >= 0) {
            // Update
            appData.buyerSelections[idx].option_choice = choice;
            appData.buyerSelections[idx].upcharge = upcharge;
            appData.buyerSelections[idx].selection_date = new Date().toISOString().split('T')[0];
        } else {
            // Add new row
            appData.buyerSelections.push({
                buyer_id: buyerId,
                option_category: category,
                option_choice: choice,
                upcharge: upcharge,
                selection_date: new Date().toISOString().split('T')[0],
                option_notes: ''
            });
        }
    }
    
    saveDataToStorage(true);
    updateDataSummary();
    updateSearchStats();
    displayBuyerApprovalForm();
}

function updateSelectionNote(buyerId, category, note) {
    const sel = appData.buyerSelections.find(s => s.buyer_id === buyerId && s.option_category === category);
    if (sel) {
        sel.option_notes = note;
        saveDataToStorage(true);
    }
}

function saveApproval() {
    const buyer = appData.selectedBuyer;
    if (!buyer) {
        showToast(getTranslation('toastSelectFirst'), 'error');
        return;
    }

    const idx = appData.buyers.findIndex(b => b.buyer_id === buyer.buyer_id);
    if (idx >= 0) {
        appData.buyers[idx].approval_status = document.getElementById('approvalStatus').value;
        appData.buyers[idx].approval_notes = document.getElementById('approvalNotes').value;
        appData.buyers[idx].approval_date = new Date().toISOString().split('T')[0];
        appData.selectedBuyer = appData.buyers[idx];
    }

    saveDataToStorage(true);
    updateDataSummary();
    updateSearchStats();
    showToast(getTranslation('toastApprovalSaved', { name: buyer.name }), 'success');
}

function cancelApproval() {
    if (appData.selectedBuyer) {
        document.getElementById('approvalStatus').value = appData.selectedBuyer.approval_status || 'Pending';
        document.getElementById('approvalNotes').value = appData.selectedBuyer.approval_notes || '';
    }
}

function searchForPdf(showAll = false) {
    if (!appData.buyers.length) {
        showToast(getTranslation('toastNoBuyers'), 'error');
        return;
    }

    const searchTerm = document.getElementById('pdfSearchInput').value.toLowerCase().trim();
    let results = [...appData.buyers];

    if (!showAll && searchTerm) {
        results = results.filter(b => buyerMatchesSearch(b, searchTerm));
    }
    if (!showAll && !searchTerm) {
        showToast(getTranslation('pdfSelectBuyerTitle'), 'error');
        return;
    }

    const container = document.getElementById('pdfSearchResults');
    if (results.length === 0) {
        container.innerHTML = `<div class="no-results"><p>${getTranslation('toastNoResults')}</p></div>`;
        return;
    }

    container.innerHTML = results.map(buyer => {
        const labelStatus = getTranslation('optStatus' + buyer.approval_status) || buyer.approval_status;
        return `
        <div class="glass-panel buyer-card" data-buyer-id="${escapeHtml(buyer.buyer_id)}" role="button" tabindex="0">
            <h3>${escapeHtml(buyer.name)}</h3>
            <p><strong>Apt:</strong> ${escapeHtml(buyer.apartment_number)}</p>
            <p><strong>Status:</strong> <span class="status-badge ${statusClass(buyer.approval_status)}">${escapeHtml(labelStatus)}</span></p>
        </div>`
    }).join('');
}

function buildContractHtml(buyer) {
    const apartment = appData.apartments.find(a => a.apartment_number === buyer.apartment_number);
    const selections = appData.buyerSelections.filter(s => s.buyer_id === buyer.buyer_id);

    let totalPrice = apartment ? num(apartment.base_price) : 0;
    let optionsHtml = '';

    if (selections.length > 0) {
        optionsHtml = `<h3>${currentLang === 'ro' ? 'Opțiuni de Stil Selectate' : 'Selected Options'}</h3><ul style="margin-left:20px; margin-bottom: 20px;">`;
        selections.forEach(sel => {
            totalPrice += num(sel.upcharge);
            const note = sel.option_notes ? ` — <em>${escapeHtml(sel.option_notes)}</em>` : '';
            optionsHtml += `<li><strong>${escapeHtml(sel.option_category)}:</strong> ${escapeHtml(sel.option_choice)} (+${formatPrice(sel.upcharge)})${note}</li>`;
        });
        optionsHtml += '</ul>';
    }

    const aptBlock = apartment ? `
        <p><strong>${currentLang === 'ro' ? 'Număr Apartament' : 'Apartment Number'}:</strong> ${escapeHtml(apartment.apartment_number)}</p>
        <p><strong>${currentLang === 'ro' ? 'Dormitoare' : 'Bedrooms'}:</strong> ${escapeHtml(apartment.bedroom_type)}</p>
        <p><strong>${currentLang === 'ro' ? 'Locuri de Parcare' : 'Parking Spots'}:</strong> ${escapeHtml(apartment.parking_spots)}</p>
        <p><strong>${currentLang === 'ro' ? 'Preț de Bază' : 'Base Price'}:</strong> ${formatPrice(apartment.base_price)}</p>
    ` : `<p><em>Apartment ${escapeHtml(buyer.apartment_number)} — details not in inventory</em></p>`;

    const titleContract = currentLang === 'ro' ? 'PROMISIUNE DE VÂNZARE-CUMPĂRARE' : 'APARTMENT PURCHASE AGREEMENT';
    const totalLabel = currentLang === 'ro' ? 'Preț Total Tranzacție' : 'Total Contract Value';
    const signatureLabel = currentLang === 'ro' ? 'Semnătură Cumpărător' : 'Buyer Signature';
    
    // Embed signature image if drawn
    const signatureEmbed = signatureImage ? `
        <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: flex-start;">
            <p style="margin-bottom: 5px;"><strong>${signatureLabel}:</strong></p>
            <img src="${signatureImage}" alt="Signature" style="max-height: 80px; border-bottom: 1px solid #333; margin-bottom: 8px;">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString(currentLang === 'ro' ? 'ro-RO' : 'en-US')}</p>
        </div>
    ` : `
        <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #999;">
            <p style="margin-bottom: 40px;">${signatureLabel}: _________________________________</p>
            <p>Date: _________________________________</p>
        </div>
    `;

    return `
        <div class="contract-doc" style="font-family: Georgia, serif; line-height: 1.7; color: #222; max-width: 700px; margin: 0 auto; padding: 20px;">
            <h2 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">${titleContract}</h2>
            <p style="text-align: center; color: #666; font-size: 11px;">Generated ${escapeHtml(new Date().toLocaleString())}</p>
            
            <h3 style="margin-top: 20px;">${currentLang === 'ro' ? 'Cumpărător' : 'Buyer'}</h3>
            <p><strong>Name:</strong> ${escapeHtml(buyer.name)} &nbsp;|&nbsp; <strong>ID:</strong> ${escapeHtml(buyer.buyer_id)}</p>
            <p><strong>Email:</strong> ${escapeHtml(buyer.email)} &nbsp;|&nbsp; <strong>Phone:</strong> ${escapeHtml(buyer.phone)}</p>
            
            <h3 style="margin-top: 20px;">${currentLang === 'ro' ? 'Unitate Locativă' : 'Unit Details'}</h3>
            ${aptBlock}
            
            ${optionsHtml}
            
            <h3 style="border-top: 2px solid #333; padding-top: 12px; margin-top: 24px;">${totalLabel}: ${formatPrice(totalPrice)}</h3>
            
            <h3 style="margin-top: 20px;">${currentLang === 'ro' ? 'Status Aprobare Tranzacție' : 'Approval & Pipeline'}</h3>
            <p><strong>Status:</strong> ${escapeHtml(buyer.approval_status)}</p>
            <p><strong>Notes:</strong> ${escapeHtml(buyer.approval_notes) || '—'}</p>
            <p><strong>Date:</strong> ${escapeHtml(buyer.approval_date) || '—'}</p>
            
            ${signatureEmbed}
        </div>`;
}

function previewPdf(buyerId) {
    const buyer = appData.buyers.find(b => b.buyer_id === buyerId);
    if (!buyer) return;

    currentBuyerForPdf = buyerId;
    signatureImage = null; // Reset current signature block
    
    // Clear canvas
    if (signatureCanvas) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
    
    document.getElementById('contractPreview').innerHTML = buildContractHtml(buyer);
    document.getElementById('pdfPreview').style.display = 'block';
    document.getElementById('pdfPreview').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Canvas signature pad logic
function initSignaturePad() {
    signatureCanvas = document.getElementById('signatureCanvas');
    if (!signatureCanvas) return;

    signatureCtx = signatureCanvas.getContext('2d');
    signatureCtx.strokeStyle = '#222';
    signatureCtx.lineWidth = 2.5;
    signatureCtx.lineJoin = 'round';
    signatureCtx.lineCap = 'round';

    // Touch and mouse draw event listeners
    const getPos = (e) => {
        const rect = signatureCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDraw = (e) => {
        isDrawingSignature = true;
        const pos = getPos(e);
        signatureCtx.beginPath();
        signatureCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
    };

    const draw = (e) => {
        if (!isDrawingSignature) return;
        const pos = getPos(e);
        signatureCtx.lineTo(pos.x, pos.y);
        signatureCtx.stroke();
        e.preventDefault();
    };

    const endDraw = () => {
        isDrawingSignature = false;
    };

    signatureCanvas.addEventListener('mousedown', startDraw);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', endDraw);
    signatureCanvas.addEventListener('mouseleave', endDraw);

    signatureCanvas.addEventListener('touchstart', startDraw, { passive: false });
    signatureCanvas.addEventListener('touchmove', draw, { passive: false });
    signatureCanvas.addEventListener('touchend', endDraw);

    // Signature buttons listeners
    document.getElementById('clearSignatureBtn').addEventListener('click', () => {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        signatureImage = null;
        if (currentBuyerForPdf) {
            const buyer = appData.buyers.find(b => b.buyer_id === currentBuyerForPdf);
            document.getElementById('contractPreview').innerHTML = buildContractHtml(buyer);
        }
    });

    document.getElementById('saveSignatureBtn').addEventListener('click', () => {
        // Convert canvas image to data URL
        signatureImage = signatureCanvas.toDataURL('image/png');
        
        // Mark current buyer's contract as signed
        if (currentBuyerForPdf) {
            const idx = appData.buyers.findIndex(b => b.buyer_id === currentBuyerForPdf);
            if (idx >= 0) {
                appData.buyers[idx].contract_signed = 'Yes';
                saveDataToStorage(true);
                updateDataSummary();
            }
            
            // Re-render
            const buyer = appData.buyers.find(b => b.buyer_id === currentBuyerForPdf);
            document.getElementById('contractPreview').innerHTML = buildContractHtml(buyer);
        }
        showToast(getTranslation('toastSigSaved'), 'success');
    });
}

function downloadPDF() {
    if (!currentBuyerForPdf) {
        showToast(getTranslation('toastSelectFirst'), 'error');
        return;
    }
    const buyer = appData.buyers.find(b => b.buyer_id === currentBuyerForPdf);
    const content = buildContractHtml(buyer);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showToast(getTranslation('toastPopupBlocked'), 'error');
        return;
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contract - ${escapeHtml(buyer.name)}</title>
        <style>body{margin:24px;} @media print{body{margin:0;}}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        showToast(getTranslation('toastPrintSaveDialog', { name: buyer.name }), 'success');
    }, 300);
}

function closePdfPreview() {
    document.getElementById('pdfPreview').style.display = 'none';
    document.getElementById('pdfSearchResults').innerHTML = '';
    document.getElementById('pdfSearchInput').value = '';
    currentBuyerForPdf = null;
    signatureImage = null;
}

async function waitForXLSX(maxMs = 8000) {
    const start = Date.now();
    while (typeof XLSX === 'undefined' && Date.now() - start < maxMs) {
        await new Promise(r => setTimeout(r, 150));
    }
    return typeof XLSX !== 'undefined';
}

async function importExcel() {
    if (!currentExcelFile) {
        showToast(getTranslation('lblExcelUpload'), 'error');
        return;
    }

    if (!(await waitForXLSX())) {
        showToast(getTranslation('toastExcelFailed'), 'error');
        return;
    }

    try {
        const buffer = await currentExcelFile.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', defval: '' });
        const missing = REQUIRED_SHEETS.filter(s => !workbook.SheetNames.includes(s));

        if (missing.length === REQUIRED_SHEETS.length) {
            throw new Error(`No recognized sheets. Found: ${workbook.SheetNames.join(', ')}`);
        }
        if (missing.length) {
            showToast(`Warning: missing sheets: ${missing.join(', ')}`, 'error');
        }

        if (workbook.SheetNames.includes('Apartments')) {
            appData.apartments = XLSX.utils.sheet_to_json(workbook.Sheets['Apartments'])
                .filter(row => str(row.apartment_number))
                .map(normalizeApartment);
        }
        if (workbook.SheetNames.includes('Styling_Options')) {
            appData.stylingOptions = XLSX.utils.sheet_to_json(workbook.Sheets['Styling_Options'])
                .filter(row => str(row.option_category))
                .map(normalizeStyling);
        }
        if (workbook.SheetNames.includes('Buyers')) {
            appData.buyers = XLSX.utils.sheet_to_json(workbook.Sheets['Buyers'])
                .filter(row => str(row.buyer_id))
                .map(normalizeBuyer);
        }
        if (workbook.SheetNames.includes('Buyer_Selections')) {
            appData.buyerSelections = XLSX.utils.sheet_to_json(workbook.Sheets['Buyer_Selections'])
                .filter(row => str(row.buyer_id))
                .map(normalizeSelection);
        }

        if (!appData.apartments.length && !appData.buyers.length) {
            throw new Error(getTranslation('toastNoExcelRows'));
        }

        persistChanges(null);
        showToast(getTranslation('toastImported', { apts: appData.apartments.length, buyers: appData.buyers.length }), 'success');

        document.getElementById('excelFile').value = '';
        document.getElementById('excelFileName').textContent = '';
        currentExcelFile = null;

        // Route to Dashboard tab after successful loading
        goToTab('dashboard');
    } catch (e) {
        console.error('Import error:', e);
        showToast(e.message || 'Import failed', 'error');
    }
}

async function exportToExcel() {
    if (!(await waitForXLSX())) {
        showToast(getTranslation('toastExcelFailed'), 'error');
        return;
    }
    if (!appData.buyers.length && !appData.apartments.length) {
        showToast(getTranslation('toastNothingExport'), 'error');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();
        const emptyRow = [{}];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appData.apartments.length ? appData.apartments : emptyRow), 'Apartments');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appData.stylingOptions.length ? appData.stylingOptions : emptyRow), 'Styling_Options');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appData.buyers.length ? appData.buyers : emptyRow), 'Buyers');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appData.buyerSelections.length ? appData.buyerSelections : emptyRow), 'Buyer_Selections');
        XLSX.writeFile(wb, `apartment_sales_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast(getTranslation('toastExcelDownloaded'), 'success');
    } catch (e) {
        showToast('Export failed: ' + e.message, 'error');
    }
}

function clearAllData() {
    const confirmationMsg = currentLang === 'ro' ? 'Ștergeți toate datele locale? Faceți un export de siguranță mai întâi.' : 'Delete all local data? Export a backup first if needed.';
    if (!confirm(confirmationMsg)) return;

    appData = { apartments: [], buyers: [], stylingOptions: [], buyerSelections: [], selectedBuyer: null };
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('appData');
    editIndex = null;
    updateDataSummary();
    updateSearchStats();
    renderSearchEmptyState();
    resetApprovalPanel();
    renderEditPanel();
    renderDashboard();
    showToast(getTranslation('toastAllCleared'), 'success');
}

function resetApprovalPanel() {
    appData.selectedBuyer = null;
    document.getElementById('buyerInfo').innerHTML = `<p style="color:var(--text-muted);">${getTranslation('msgSelectBuyerApproval')}</p>`;
    document.getElementById('apartmentInfo').innerHTML = `<p style="color:var(--text-muted);">${getTranslation('msgSelectBuyerApproval')}</p>`;
    document.getElementById('optionsReview').innerHTML = `<p style="color:var(--text-muted);">${getTranslation('msgSelectOptionsApproval')}</p>`;
    document.getElementById('approvalForm').style.display = 'none';
    document.getElementById('syncInfo').style.display = 'none';
}

function updateDataSummary() {
    document.getElementById('apartmentCount').textContent = appData.apartments.length;
    document.getElementById('buyerCount').textContent = appData.buyers.length;
    document.getElementById('pendingCount').textContent = appData.buyers.filter(b => str(b.approval_status) === 'Pending').length;
    document.getElementById('approvedCount').textContent = appData.buyers.filter(b => str(b.approval_status) === 'Approved').length;
    document.getElementById('rejectedCount').textContent = appData.buyers.filter(b => str(b.approval_status) === 'Rejected').length;
    document.getElementById('signedCount').textContent = appData.buyers.filter(b => str(b.contract_signed).toLowerCase() === 'yes').length;
}

function updateSearchStats() {
    const el = document.getElementById('searchStats');
    if (!appData.buyers.length) {
        el.innerHTML = '';
        return;
    }
    const aptText = currentLang === 'ro' ? 'apartamente' : 'apartments';
    const buyText = currentLang === 'ro' ? 'cumpărători' : 'buyers';
    const selText = currentLang === 'ro' ? 'selecții' : 'selections';
    el.innerHTML = `
        <span class="stat-chip"><strong>${appData.buyers.length}</strong> ${buyText}</span>
        <span class="stat-chip"><strong>${appData.apartments.length}</strong> ${aptText}</span>
        <span class="stat-chip"><strong>${appData.buyerSelections.length}</strong> ${selText}</span>`;
}

function updateOnlineStatus() {
    const statusEl = document.getElementById('onlineStatus');
    const statusText = document.getElementById('statusText');
    if (!statusEl || !statusText) return;
    if (navigator.onLine) {
        statusEl.classList.remove('offline');
        statusText.textContent = getTranslation('lblOnline');
    } else {
        statusEl.classList.add('offline');
        statusText.textContent = getTranslation('lblOffline');
    }
}

function updateLastSync() {
    document.getElementById('lastSync').textContent = new Date().toLocaleString();
}

function formatPrice(price) {
    const isRo = currentLang === 'ro';
    return new Intl.NumberFormat(isRo ? 'ro-RO' : 'en-US', { 
        style: 'currency', 
        currency: isRo ? 'EUR' : 'USD',
        maximumFractionDigits: 0
    }).format(num(price));
}

function persistChanges(message) {
    saveDataToStorage(true);
    updateDataSummary();
    updateSearchStats();
    renderDashboard();
    if (appData.selectedBuyer) {
        const refreshed = appData.buyers.find(b => b.buyer_id === appData.selectedBuyer.buyer_id);
        if (refreshed) {
            appData.selectedBuyer = refreshed;
            displayBuyerApprovalForm();
        } else {
            resetApprovalPanel();
        }
    }
    if (message) showToast(message, 'success');
}

function apartmentOptionsHtml(selected = '') {
    const opts = appData.apartments.map(a =>
        `<option value="${escapeHtml(a.apartment_number)}"${a.apartment_number === selected ? ' selected' : ''}>${escapeHtml(a.apartment_number)}</option>`
    ).join('');
    return `<option value="">— Select —</option>${opts}`;
}

function buyerOptionsHtml(selected = '') {
    const opts = appData.buyers.map(b =>
        `<option value="${escapeHtml(b.buyer_id)}"${b.buyer_id === selected ? ' selected' : ''}>${escapeHtml(b.buyer_id)} — ${escapeHtml(b.name)}</option>`
    ).join('');
    return `<option value="">— Select —</option>${opts}`;
}

function stylingCategories() {
    return [...new Set(appData.stylingOptions.map(o => o.option_category).filter(Boolean))];
}

function choicesForCategory(category) {
    return appData.stylingOptions.filter(o => o.option_category === category);
}

// ----------------------------------------------------
// DYNAMIC DASHBOARD RENDERER & SVG GRAPH DRAWING
// ----------------------------------------------------
function renderDashboard() {
    if (!appData.apartments.length && !appData.buyers.length) {
        // Set metrics to zero
        document.getElementById('dashTotalApts').textContent = '0 / 0';
        document.getElementById('dashTotalBuyers').textContent = '0';
        document.getElementById('dashSignedContracts').textContent = '0';
        document.getElementById('dashPotentialRevenue').textContent = formatPrice(0);
        document.getElementById('dashApprovedRevenue').textContent = formatPrice(0);
        
        document.getElementById('dashAptsProgress').style.width = '0%';
        document.getElementById('dashSignedProgress').style.width = '0%';
        
        document.getElementById('chartBeds').innerHTML = `<p style="font-size:12px;color:var(--text-secondary);">${getTranslation('msgSelectBuyerApproval')}</p>`;
        document.getElementById('chartStatus').innerHTML = `<p style="font-size:12px;color:var(--text-secondary);">${getTranslation('msgSelectBuyerApproval')}</p>`;
        return;
    }

    const totalApts = appData.apartments.length;
    const occupiedAptNums = new Set(appData.buyers.map(b => b.apartment_number));
    const soldApts = appData.apartments.filter(a => occupiedAptNums.has(a.apartment_number) || a.available === 'No').length;
    const occupiedPct = totalApts ? Math.round((soldApts / totalApts) * 100) : 0;
    
    // KPI elements
    document.getElementById('dashTotalApts').textContent = `${soldApts} / ${totalApts}`;
    document.getElementById('kpiAptsDetail').textContent = getTranslation('kpiAptsDetail', { pct: occupiedPct });
    document.getElementById('dashAptsProgress').style.width = `${occupiedPct}%`;
    
    const activeBuyers = appData.buyers.length;
    const pendingBuyers = appData.buyers.filter(b => b.approval_status === 'Pending').length;
    document.getElementById('dashTotalBuyers').textContent = activeBuyers;
    document.getElementById('kpiBuyersDetail').textContent = getTranslation('kpiBuyersDetail', { count: pendingBuyers });

    const approvedBuyers = appData.buyers.filter(b => b.approval_status === 'Approved');
    const signedCount = appData.buyers.filter(b => b.contract_signed === 'Yes').length;
    const signedPct = approvedBuyers.length ? Math.round((signedCount / approvedBuyers.length) * 100) : 0;
    document.getElementById('dashSignedContracts').textContent = signedCount;
    document.getElementById('kpiContractsDetail').textContent = getTranslation('kpiContractsDetail', { pct: signedPct });
    document.getElementById('dashSignedProgress').style.width = `${signedPct}%`;

    // Compute revenue values
    let totalPotentialVal = 0;
    let totalApprovedVal = 0;
    
    appData.buyers.forEach(b => {
        const apt = appData.apartments.find(a => a.apartment_number === b.apartment_number);
        let buyerPrice = apt ? num(apt.base_price) : 0;
        
        // Add upcharges
        const selections = appData.buyerSelections.filter(s => s.buyer_id === b.buyer_id);
        selections.forEach(sel => {
            buyerPrice += num(sel.upcharge);
        });
        
        totalPotentialVal += buyerPrice;
        if (b.approval_status === 'Approved') {
            totalApprovedVal += buyerPrice;
        }
    });

    document.getElementById('dashPotentialRevenue').textContent = formatPrice(totalPotentialVal);
    document.getElementById('dashApprovedRevenue').textContent = formatPrice(totalApprovedVal);
    
    // Draw SVG charts
    drawBedsBarChart();
    drawStatusDonutChart();
}

function drawBedsBarChart() {
    const bedsContainer = document.getElementById('chartBeds');
    if (!appData.apartments.length) return;

    // Count apartments by bedroom type
    const counts = {};
    appData.apartments.forEach(a => {
        const type = a.bedroom_type != null ? `${a.bedroom_type} Bed` : 'Other';
        counts[type] = (counts[type] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const maxVal = Math.max(...values, 5);

    const width = 320;
    const height = 180;
    const padding = 30;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    
    let barsHtml = '';
    const barWidth = Math.min(45, (chartWidth / labels.length) * 0.6);
    const spacing = (chartWidth - barWidth * labels.length) / (labels.length + 1);

    // Grid lines
    let gridHtml = '';
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight * i) / 4;
        const gridVal = Math.round(maxVal - (maxVal * i) / 4);
        gridHtml += `
            <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--card-border)" stroke-width="1" />
            <text x="${padding - 8}" y="${y + 4}" font-size="9" fill="var(--text-muted)" text-anchor="end">${gridVal}</text>
        `;
    }

    labels.forEach((lbl, idx) => {
        const val = counts[lbl];
        const barHeight = (val / maxVal) * chartHeight;
        const x = padding + spacing + idx * (barWidth + spacing);
        const y = height - padding - barHeight;

        barsHtml += `
            <!-- Glowing gradient definition inside bar elements -->
            <defs>
                <linearGradient id="barGrad_${idx}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="hsl(var(--primary-light))" />
                    <stop offset="100%" stop-color="hsl(var(--primary))" />
                </linearGradient>
            </defs>
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="url(#barGrad_${idx})" filter="drop-shadow(0 2px 4px rgba(79,70,229,0.15))" />
            <text x="${x + barWidth/2}" y="${y - 6}" font-size="10" font-weight="700" fill="var(--text-primary)" text-anchor="middle">${val}</text>
            <text x="${x + barWidth/2}" y="${height - padding + 15}" font-size="10" fill="var(--text-secondary)" text-anchor="middle">${lbl}</text>
        `;
    });

    bedsContainer.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
            ${gridHtml}
            ${barsHtml}
        </svg>
    `;
}

function drawStatusDonutChart() {
    const statusContainer = document.getElementById('chartStatus');
    if (!appData.buyers.length) return;

    // Counts
    const pending = appData.buyers.filter(b => b.approval_status === 'Pending').length;
    const approved = appData.buyers.filter(b => b.approval_status === 'Approved').length;
    const rejected = appData.buyers.filter(b => b.approval_status === 'Rejected').length;
    const total = pending + approved + rejected;

    if (total === 0) return;

    // SVG parameters
    const size = 180;
    const r = 50;
    const circ = 2 * Math.PI * r;
    const center = size / 2;

    const data = [
        { count: approved, color: 'hsl(var(--success))', label: getTranslation('optStatusApproved') },
        { count: pending, color: 'hsl(var(--info))', label: getTranslation('optStatusPending') },
        { count: rejected, color: 'hsl(var(--danger))', label: getTranslation('optStatusRejected') }
    ];

    let segmentsHtml = '';
    let currentOffset = 0;

    data.forEach(item => {
        if (item.count === 0) return;
        const pct = item.count / total;
        const strokeLength = pct * circ;
        const strokeSpace = circ - strokeLength;
        const offset = circ - currentOffset;

        segmentsHtml += `
            <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="${item.color}" 
                stroke-width="12" stroke-dasharray="${strokeLength} ${strokeSpace}" stroke-dashoffset="${offset}" 
                transform="rotate(-90 ${center} ${center})" stroke-linecap="round" />
        `;
        currentOffset += strokeLength;
    });

    // Legend builders
    let legendHtml = '<div style="display:flex; flex-direction:column; gap:6px; margin-left:15px; text-align:left;">';
    data.forEach(item => {
        const pctStr = total ? Math.round((item.count / total) * 100) : 0;
        legendHtml += `
            <div style="display:flex; align-items:center; gap:8px; font-size:11px; color:var(--text-secondary);">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${item.color};"></span>
                <strong>${item.count}</strong> ${item.label} (${pctStr}%)
            </div>
        `;
    });
    legendHtml += '</div>';

    statusContainer.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; width:100%;">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <!-- Outer background circle track -->
                <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--card-border)" stroke-width="12" />
                ${segmentsHtml}
                <!-- Inner text displaying total buyers -->
                <text x="${center}" y="${center - 2}" font-size="11" font-weight="600" fill="var(--text-muted)" text-anchor="middle" style="font-family:var(--font-title);">${currentLang === 'ro' ? 'TOTAL' : 'BUYERS'}</text>
                <text x="${center}" y="${center + 14}" font-size="16" font-weight="800" fill="var(--text-primary)" text-anchor="middle" style="font-family:var(--font-title);">${total}</text>
            </svg>
            ${legendHtml}
        </div>
    `;
}

// ----------------------------------------------------
// EDIT INVENTORY PANEL UI BUILDERS
// ----------------------------------------------------
function renderEditPanel() {
    document.querySelectorAll('#editTabs [data-edit-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.editTab === editTab);
    });

    const panel = document.getElementById('editPanel');
    if (!appData.apartments.length && !appData.buyers.length && editTab !== 'apartments') {
        panel.innerHTML = `<div class="empty-state"><p>${currentLang === 'ro' ? 'Importați mai întâi date, sau adăugați unități sub tab-ul Apartamente.' : 'Import data first, or add apartments under the Apartments tab.'}</p></div>`;
        return;
    }

    switch (editTab) {
        case 'apartments': panel.innerHTML = renderApartmentsEditor(); break;
        case 'buyers': panel.innerHTML = renderBuyersEditor(); break;
        case 'options': panel.innerHTML = renderOptionsEditor(); break;
        case 'selections': panel.innerHTML = renderSelectionsEditor(); break;
    }
}

function renderApartmentsEditor() {
    const rows = appData.apartments.map((a, i) => `
        <tr>
            <td>${escapeHtml(a.apartment_number)}</td>
            <td>${escapeHtml(a.bedroom_type)}</td>
            <td>${formatPrice(a.base_price)}</td>
            <td>${escapeHtml(a.parking_spots)}</td>
            <td>${escapeHtml(a.available)}</td>
            <td style="text-align: right;">
                <button type="button" class="btn-sm secondary" data-edit-row="${i}" style="padding:4px 10px; font-size:12px;">Edit</button>
                <button type="button" class="btn-sm danger" data-delete-row="${i}" style="padding:4px 10px; font-size:12px;">Delete</button>
            </td>
        </tr>`).join('');

    const apt = editIndex != null ? appData.apartments[editIndex] : null;
    const isEdit = apt != null;

    return `
        <div class="table-wrap" style="margin-bottom: 24px;">
            <table class="table">
                <thead><tr><th>Unit</th><th>Beds</th><th>Base price</th><th>Parking</th><th>Available</th><th></th></tr></thead>
                <tbody>${rows || `<tr><td colspan="6" style="text-align:center;">No apartments loaded</td></tr>`}</tbody>
            </table>
        </div>
        <div class="glass-panel edit-form-card" style="padding:24px;">
            <h4 style="margin-bottom:18px;">${isEdit ? 'Edit apartment' : getTranslation('btnAddApt')}</h4>
            <form id="editEntityForm" data-entity="apartments">
                <div class="form-row" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">
                    <div class="form-group">
                        <label>${getTranslation('lblAptNum')}</label>
                        <input name="apartment_number" required value="${escapeHtml(apt?.apartment_number)}" ${isEdit ? 'readonly' : ''}>
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblBeds')}</label>
                        <input name="bedroom_type" type="number" min="0" step="1" value="${escapeHtml(apt?.bedroom_type ?? '')}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblBasePrice')}</label>
                        <input name="base_price" type="number" min="0" step="1000" value="${apt ? apt.base_price : ''}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblParking')}</label>
                        <input name="parking_spots" type="number" min="0" step="1" value="${escapeHtml(apt?.parking_spots ?? '')}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblAvailable')}</label>
                        <select name="available">
                            <option value="Yes" ${(!apt || apt.available === 'Yes') ? 'selected' : ''}>Yes</option>
                            <option value="No" ${apt?.available === 'No' ? 'selected' : ''}>No</option>
                        </select>
                    </div>
                </div>
                <div class="action-buttons" style="margin-top:16px;">
                    <button type="submit" class="success">${isEdit ? getTranslation('btnSaveApt') : getTranslation('btnAddApt')}</button>
                    ${isEdit ? '<button type="button" class="secondary" data-cancel-edit>Cancel edit</button>' : ''}
                </div>
            </form>
        </div>`;
}

function renderBuyersEditor() {
    const rows = appData.buyers.map((b, i) => `
        <tr>
            <td>${escapeHtml(b.buyer_id)}</td>
            <td>${escapeHtml(b.name)}</td>
            <td>${escapeHtml(b.apartment_number)}</td>
            <td>${escapeHtml(b.email)}</td>
            <td><span class="status-badge ${statusClass(b.approval_status)}">${escapeHtml(b.approval_status)}</span></td>
            <td style="text-align: right;">
                <button type="button" class="btn-sm secondary" data-edit-row="${i}" style="padding:4px 10px; font-size:12px;">Edit</button>
                <button type="button" class="btn-sm danger" data-delete-row="${i}" style="padding:4px 10px; font-size:12px;">Delete</button>
            </td>
        </tr>`).join('');

    const b = editIndex != null ? appData.buyers[editIndex] : null;
    const isEdit = b != null;

    return `
        <div class="table-wrap" style="margin-bottom: 24px;">
            <table class="table">
                <thead><tr><th>ID</th><th>Name</th><th>Apartment</th><th>Email</th><th>Status</th><th></th></tr></thead>
                <tbody>${rows || `<tr><td colspan="6" style="text-align:center;">No buyers loaded</td></tr>`}</tbody>
            </table>
        </div>
        <div class="glass-panel edit-form-card" style="padding:24px;">
            <h4 style="margin-bottom:18px;">${isEdit ? 'Edit buyer' : getTranslation('btnAddBuyer')}</h4>
            <form id="editEntityForm" data-entity="buyers">
                <div class="form-row" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">
                    <div class="form-group">
                        <label>${getTranslation('lblBuyerId')}</label>
                        <input name="buyer_id" required value="${escapeHtml(b?.buyer_id)}" ${isEdit ? 'readonly' : ''} placeholder="${isEdit ? '' : suggestNextBuyerId()}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblFullName')}</label>
                        <input name="name" required value="${escapeHtml(b?.name)}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblAptSelect')}</label>
                        <select name="apartment_number" required>${apartmentOptionsHtml(b?.apartment_number)}</select>
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblEmail')}</label>
                        <input name="email" type="email" value="${escapeHtml(b?.email)}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblPhone')}</label>
                        <input name="phone" value="${escapeHtml(b?.phone)}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblAppStatus')}</label>
                        <select name="approval_status">
                            <option value="Pending" ${b?.approval_status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Approved" ${b?.approval_status === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Rejected" ${b?.approval_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblContractSigned')}</label>
                        <select name="contract_signed">
                            <option value="No" ${b?.contract_signed !== 'Yes' ? 'selected' : ''}>No</option>
                            <option value="Yes" ${b?.contract_signed === 'Yes' ? 'selected' : ''}>Yes</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-top: 12px;">
                    <label>${getTranslation('lblAppNotes')}</label>
                    <textarea name="approval_notes" style="min-height: 70px;">${escapeHtml(b?.approval_notes)}</textarea>
                </div>
                <div class="action-buttons">
                    <button type="submit" class="success">${isEdit ? getTranslation('btnSaveApt') : getTranslation('btnAddBuyer')}</button>
                    ${isEdit ? '<button type="button" class="secondary" data-cancel-edit>Cancel edit</button>' : ''}
                </div>
            </form>
        </div>`;
}

function renderOptionsEditor() {
    const rows = appData.stylingOptions.map((o, i) => `
        <tr>
            <td>${escapeHtml(o.option_category)}</td>
            <td>${escapeHtml(o.option_choice)}</td>
            <td>${formatPrice(o.upcharge)}</td>
            <td>${escapeHtml(o.description)}</td>
            <td style="text-align: right;">
                <button type="button" class="btn-sm secondary" data-edit-row="${i}" style="padding:4px 10px; font-size:12px;">Edit</button>
                <button type="button" class="btn-sm danger" data-delete-row="${i}" style="padding:4px 10px; font-size:12px;">Delete</button>
            </td>
        </tr>`).join('');

    const o = editIndex != null ? appData.stylingOptions[editIndex] : null;
    const isEdit = o != null;

    return `
        <div class="table-wrap" style="margin-bottom: 24px;">
            <table class="table">
                <thead><tr><th>Category</th><th>Choice</th><th>Upcharge</th><th>Description</th><th></th></tr></thead>
                <tbody>${rows || `<tr><td colspan="5" style="text-align:center;">No styling options loaded</td></tr>`}</tbody>
            </table>
        </div>
        <div class="glass-panel edit-form-card" style="padding:24px;">
            <h4 style="margin-bottom:18px;">${isEdit ? 'Edit option' : getTranslation('btnAddOption')}</h4>
            <form id="editEntityForm" data-entity="options">
                <div class="form-row" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">
                    <div class="form-group">
                        <label>${getTranslation('lblCategory')}</label>
                        <input name="option_category" required value="${escapeHtml(o?.option_category)}" list="categoryList" placeholder="Flooring, Kitchen…">
                        <datalist id="categoryList">${stylingCategories().map(c => '<option value="' + escapeHtml(c) + '">').join('')}</datalist>
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblChoice')}</label>
                        <input name="option_choice" required value="${escapeHtml(o?.option_choice)}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblUpcharge')}</label>
                        <input name="upcharge" type="number" min="0" step="100" value="${o ? o.upcharge : ''}">
                    </div>
                </div>
                <div class="form-group" style="margin-top: 12px;">
                    <label>${getTranslation('lblDescription')}</label>
                    <input name="description" value="${escapeHtml(o?.description)}">
                </div>
                <div class="action-buttons">
                    <button type="submit" class="success">${isEdit ? getTranslation('btnSaveApt') : getTranslation('btnAddOption')}</button>
                    ${isEdit ? '<button type="button" class="secondary" data-cancel-edit>Cancel edit</button>' : ''}
                </div>
            </form>
        </div>`;
}

function renderSelectionsEditor() {
    const rows = appData.buyerSelections.map((s, i) => {
        const buyer = appData.buyers.find(b => b.buyer_id === s.buyer_id);
        return `
        <tr>
            <td>${escapeHtml(s.buyer_id)}${buyer ? ` (${escapeHtml(buyer.name)})` : ''}</td>
            <td>${escapeHtml(s.option_category)}</td>
            <td>${escapeHtml(s.option_choice)}</td>
            <td>${formatPrice(s.upcharge)}</td>
            <td style="text-align: right;">
                <button type="button" class="btn-sm secondary" data-edit-row="${i}" style="padding:4px 10px; font-size:12px;">Edit</button>
                <button type="button" class="btn-sm danger" data-delete-row="${i}" style="padding:4px 10px; font-size:12px;">Delete</button>
            </td>
        </tr>`;
    }).join('');

    const s = editIndex != null ? appData.buyerSelections[editIndex] : null;
    const isEdit = s != null;
    const cats = stylingCategories();
    const catOptions = cats.map(c =>
        `<option value="${escapeHtml(c)}"${s?.option_category === c ? ' selected' : ''}>${escapeHtml(c)}</option>`
    ).join('');
    const choices = s ? choicesForCategory(s.option_category) : [];
    let choiceOptions = choices.map(c =>
        `<option value="${escapeHtml(c.option_choice)}" data-upcharge="${c.upcharge}"${s?.option_choice === c.option_choice ? ' selected' : ''}>${escapeHtml(c.option_choice)} (${formatPrice(c.upcharge)})</option>`
    ).join('');
    if (s && s.option_choice && !choices.some(c => c.option_choice === s.option_choice)) {
        choiceOptions = `<option value="${escapeHtml(s.option_choice)}" selected>${escapeHtml(s.option_choice)}</option>` + choiceOptions;
    }

    return `
        <div class="table-wrap" style="margin-bottom: 24px;">
            <table class="table">
                <thead><tr><th>Buyer</th><th>Category</th><th>Choice</th><th>Upcharge</th><th></th></tr></thead>
                <tbody>${rows || `<tr><td colspan="5" style="text-align:center;">No buyer selections loaded</td></tr>`}</tbody>
            </table>
        </div>
        <div class="glass-panel edit-form-card" style="padding:24px;">
            <h4 style="margin-bottom:18px;">${isEdit ? 'Edit selection' : getTranslation('btnAddSelection')}</h4>
            <form id="editEntityForm" data-entity="selections">
                <div class="form-row" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:16px;">
                    <div class="form-group">
                        <label>${getTranslation('lblBuyerSelect')}</label>
                        <select name="buyer_id" required>${buyerOptionsHtml(s?.buyer_id)}</select>
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblCategory')}</label>
                        <select name="option_category" id="selCategory" required>
                            <option value="">— Select —</option>
                            ${catOptions}
                            <option value="__custom__">Other (type below)</option>
                        </select>
                        <input name="option_category_custom" id="selCategoryCustom" placeholder="Custom category" style="margin-top:6px;${s && !cats.includes(s.option_category) ? '' : 'display:none;'}" value="${s && !cats.includes(s.option_category) ? escapeHtml(s.option_category) : ''}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblChoice')}</label>
                        <select name="option_choice" id="selChoice">
                            <option value="">— Select or type —</option>
                            ${choiceOptions}
                        </select>
                        <input name="option_choice_custom" id="selChoiceCustom" placeholder="Custom choice" style="margin-top:6px;" value="">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblUpcharge')}</label>
                        <input name="upcharge" type="number" min="0" step="100" value="${s ? s.upcharge : ''}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslation('lblSelDate')}</label>
                        <input name="selection_date" type="date" value="${escapeHtml(s?.selection_date || new Date().toISOString().split('T')[0])}">
                    </div>
                </div>
                <div class="form-group" style="margin-top: 12px;">
                    <label>${getTranslation('lblNotes')}</label>
                    <textarea name="option_notes" style="min-height: 70px;">${escapeHtml(s?.option_notes)}</textarea>
                </div>
                <div class="action-buttons">
                    <button type="submit" class="success">${isEdit ? getTranslation('btnSaveApt') : getTranslation('btnAddSelection')}</button>
                    ${isEdit ? '<button type="button" class="secondary" data-cancel-edit>Cancel edit</button>' : ''}
                </div>
            </form>
        </div>`;
}

function onEditPanelClick(e) {
    const editBtn = e.target.closest('[data-edit-row]');
    const delBtn = e.target.closest('[data-delete-row]');
    const cancelBtn = e.target.closest('[data-cancel-edit]');

    if (cancelBtn) {
        editIndex = null;
        renderEditPanel();
        return;
    }

    if (editBtn) {
        editIndex = parseInt(editBtn.dataset.editRow, 10);
        renderEditPanel();
        return;
    }

    if (delBtn) {
        const idx = parseInt(delBtn.dataset.deleteRow, 10);
        deleteEditRow(idx);
    }
}

function onEditPanelChange(e) {
    if (editTab !== 'selections') return;
    const form = e.target.closest('#editEntityForm');
    if (!form) return;

    if (e.target.name === 'option_category' || e.target.id === 'selCategory') {
        const cat = e.target.value;
        const customEl = form.querySelector('#selCategoryCustom');
        if (customEl) customEl.style.display = cat === '__custom__' ? 'block' : 'none';

        const choiceSelect = form.querySelector('#selChoice');
        if (!choiceSelect || cat === '__custom__' || !cat) return;

        const choices = choicesForCategory(cat);
        choiceSelect.innerHTML = '<option value="">— Select —</option>' +
            choices.map(c => `<option value="${escapeHtml(c.option_choice)}" data-upcharge="${c.upcharge}">${escapeHtml(c.option_choice)} (${formatPrice(c.upcharge)})</option>`).join('') +
            '<option value="__custom__">Other (type below)</option>';

        if (choices.length === 1) {
            choiceSelect.value = choices[0].option_choice;
            const up = form.querySelector('[name="upcharge"]');
            if (up) up.value = choices[0].upcharge;
        }
    }

    if (e.target.name === 'option_choice' || e.target.id === 'selChoice') {
        const opt = e.target.selectedOptions?.[0];
        const customEl = form.querySelector('#selChoiceCustom');
        if (customEl) customEl.style.display = e.target.value === '__custom__' ? 'block' : 'none';
        if (opt?.dataset.upcharge != null) {
            const up = form.querySelector('[name="upcharge"]');
            if (up) up.value = opt.dataset.upcharge;
        }
    }
}

function deleteEditRow(idx) {
    const labels = { apartments: 'apartment', buyers: 'buyer', options: 'styling option', selections: 'selection' };
    const arrays = {
        apartments: appData.apartments,
        buyers: appData.buyers,
        options: appData.stylingOptions,
        selections: appData.buyerSelections
    };
    const arr = arrays[editTab];
    if (!arr || !arr[idx]) return;

    const item = arr[idx];
    let msg = `Delete this ${labels[editTab]}?`;

    if (editTab === 'apartments') {
        const linked = appData.buyers.filter(b => b.apartment_number === item.apartment_number).length;
        if (linked) msg += ` ${linked} buyer(s) still reference unit ${item.apartment_number}.`;
    }
    if (editTab === 'buyers') {
        const selCount = appData.buyerSelections.filter(s => s.buyer_id === item.buyer_id).length;
        if (selCount) msg += ` This will also remove ${selCount} selection(s).`;
    }

    if (!confirm(msg)) return;

    if (editTab === 'buyers') {
        appData.buyerSelections = appData.buyerSelections.filter(s => s.buyer_id !== item.buyer_id);
    }

    arr.splice(idx, 1);
    editIndex = null;
    persistChanges('Deleted');
    renderEditPanel();
}

function onEditFormSubmit(e) {
    if (e.target.id !== 'editEntityForm') return;
    e.preventDefault();

    const entity = e.target.dataset.entity;
    const fd = new FormData(e.target);

    if (entity === 'apartments') {
        const apt = normalizeApartment({
            apartment_number: fd.get('apartment_number'),
            bedroom_type: fd.get('bedroom_type'),
            base_price: fd.get('base_price'),
            parking_spots: fd.get('parking_spots'),
            available: fd.get('available')
        });
        if (!apt.apartment_number) {
            showToast(getTranslation('toastAptRequired'), 'error');
            return;
        }
        if (editIndex != null) {
            const oldNum = appData.apartments[editIndex].apartment_number;
            appData.apartments[editIndex] = apt;
            if (oldNum !== apt.apartment_number) {
                appData.buyers.forEach(b => {
                    if (b.apartment_number === oldNum) b.apartment_number = apt.apartment_number;
                });
            }
        } else {
            if (appData.apartments.some(a => a.apartment_number === apt.apartment_number)) {
                showToast(getTranslation('toastAptExists'), 'error');
                return;
            }
            appData.apartments.push(apt);
        }
    }

    if (entity === 'buyers') {
        const buyer = normalizeBuyer({
            buyer_id: fd.get('buyer_id'),
            name: fd.get('name'),
            email: fd.get('email'),
            phone: fd.get('phone'),
            apartment_number: fd.get('apartment_number'),
            approval_status: fd.get('approval_status'),
            approval_notes: fd.get('approval_notes'),
            contract_signed: fd.get('contract_signed'),
            approval_date: editIndex != null ? appData.buyers[editIndex].approval_date : ''
        });
        if (!buyer.buyer_id || !buyer.name) {
            showToast(getTranslation('toastBuyerFields'), 'error');
            return;
        }
        if (!buyer.apartment_number) {
            showToast(getTranslation('toastBuyerApt'), 'error');
            return;
        }
        if (editIndex != null) {
            appData.buyers[editIndex] = buyer;
        } else {
            if (appData.buyers.some(b => b.buyer_id === buyer.buyer_id)) {
                showToast(getTranslation('toastBuyerExists'), 'error');
                return;
            }
            appData.buyers.push(buyer);
        }
    }

    if (entity === 'options') {
        const opt = normalizeStyling({
            option_category: fd.get('option_category'),
            option_choice: fd.get('option_choice'),
            upcharge: fd.get('upcharge'),
            description: fd.get('description')
        });
        if (!opt.option_category || !opt.option_choice) {
            showToast(getTranslation('toastOptionFields'), 'error');
            return;
        }
        if (editIndex != null) {
            appData.stylingOptions[editIndex] = opt;
        } else {
            appData.stylingOptions.push(opt);
        }
    }

    if (entity === 'selections') {
        let category = fd.get('option_category');
        if (category === '__custom__') category = str(fd.get('option_category_custom'));
        let choice = fd.get('option_choice');
        if (choice === '__custom__' || !choice) choice = str(fd.get('option_choice_custom'));

        const sel = normalizeSelection({
            buyer_id: fd.get('buyer_id'),
            option_category: category,
            option_choice: choice,
            upcharge: fd.get('upcharge'),
            selection_date: fd.get('selection_date'),
            option_notes: fd.get('option_notes')
        });
        if (!sel.buyer_id || !sel.option_category || !sel.option_choice) {
            showToast(getTranslation('toastSelectionFields'), 'error');
            return;
        }
        if (editIndex != null) {
            appData.buyerSelections[editIndex] = sel;
        } else {
            appData.buyerSelections.push(sel);
        }
    }

    editIndex = null;
    persistChanges('Saved');
    renderEditPanel();
}

function suggestNextBuyerId() {
    const nums = appData.buyers
        .map(b => parseInt(String(b.buyer_id).replace(/\D/g, ''), 10))
        .filter(n => Number.isFinite(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return 'B' + String(next).padStart(3, '0');
}

function initEditUi() {
    try {
        const editTabs = document.getElementById('editTabs');
        if (editTabs) {
            editTabs.addEventListener('click', function (e) {
                const tabBtn = e.target.closest('[data-edit-tab]');
                if (!tabBtn) return;
                editTab = tabBtn.dataset.editTab;
                editIndex = null;
                renderEditPanel();
            });
        }
        const panel = document.getElementById('editPanel');
        if (panel) {
            panel.addEventListener('click', function (e) { onEditPanelClick(e); });
            panel.addEventListener('change', function (e) { onEditPanelChange(e); });
            panel.addEventListener('submit', function (e) { onEditFormSubmit(e); });
        }
    } catch (err) {
        console.error('Edit UI init failed:', err);
    }
}

let toastTimer;
function showToast(message, type = 'success') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    clearTimeout(toastTimer);
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.appendChild(toast);
    toastTimer = setTimeout(() => toast.remove(), 3500);
}