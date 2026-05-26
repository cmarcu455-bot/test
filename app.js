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

        function bootApp() {
    try {
        loadDataFromStorage();
        setupEventListeners();
        updateDataSummary();
        updateSearchStats();
        updateOnlineStatus();
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
                nameEl.textContent = currentExcelFile ? `Selected: ${currentExcelFile.name}` : '';
            });
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
                showToast('Could not load saved data', 'error');
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
                if (!silent) showToast('Data saved locally', 'success');
            } catch (e) {
                console.error('Error saving data:', e);
                showToast('Error saving data — storage may be full', 'error');
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
                showToast('No buyers loaded — import Excel from Data Management', 'error');
                renderSearchEmptyState();
                return;
            }
            listBuyers();
        }

        function displaySearchResults(results) {
            const container = document.getElementById('searchResults');

            if (results.length === 0) {
                container.innerHTML = '<div class="no-results"><p>No buyers match your search</p></div>';
                return;
            }

            container.innerHTML = results.map(buyer => `
                <div class="buyer-card" data-buyer-id="${escapeHtml(buyer.buyer_id)}" role="button" tabindex="0">
                    <h3>${escapeHtml(buyer.name)}</h3>
                    <p><strong>Apartment:</strong> ${escapeHtml(buyer.apartment_number)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(buyer.email)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(buyer.phone)}</p>
                    <span class="status-badge ${statusClass(buyer.approval_status)}">${escapeHtml(buyer.approval_status || 'Pending')}</span>
                </div>
            `).join('');
        }

        function renderSearchEmptyState() {
            const container = document.getElementById('searchResults');
            if (appData.buyers.length) return;
            container.innerHTML = `
                <div class="empty-state">
                    <p><strong>No data loaded yet</strong></p>
                    <p style="margin-top:8px;">Go to <strong>Data Management</strong> and import <strong>Apartment_Sales_Test_Data.xlsx</strong>, then return here to search buyers.</p>
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
            selectBuyerForApproval(card.dataset.buyerId);
        }

        function onPdfCardClick(e) {
            const card = e.target.closest('.buyer-card');
            if (!card) return;
            previewPdf(card.dataset.buyerId);
        }

        function selectBuyerForApproval(buyerId) {
            const buyer = appData.buyers.find(b => b.buyer_id === buyerId);
            if (!buyer) return;

            appData.selectedBuyer = buyer;
            displayBuyerApprovalForm();

            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelector('[data-section="approve"]').classList.add('active');
            document.getElementById('approve').classList.add('active');
        }

        function displayBuyerApprovalForm() {
            const buyer = appData.selectedBuyer;
            if (!buyer) return;

            const apartment = appData.apartments.find(a => a.apartment_number === buyer.apartment_number);
            const selections = appData.buyerSelections.filter(s => s.buyer_id === buyer.buyer_id);

            document.getElementById('buyerInfo').innerHTML = `
                <div class="summary">
                    <div class="summary-row"><span><strong>Name:</strong></span><span>${escapeHtml(buyer.name)}</span></div>
                    <div class="summary-row"><span><strong>ID:</strong></span><span>${escapeHtml(buyer.buyer_id)}</span></div>
                    <div class="summary-row"><span><strong>Email:</strong></span><span>${escapeHtml(buyer.email)}</span></div>
                    <div class="summary-row"><span><strong>Phone:</strong></span><span>${escapeHtml(buyer.phone)}</span></div>
                </div>`;

            if (apartment) {
                document.getElementById('apartmentInfo').innerHTML = `
                    <div class="summary">
                        <div class="summary-row"><span><strong>Apartment:</strong></span><span>${escapeHtml(apartment.apartment_number)}</span></div>
                        <div class="summary-row"><span><strong>Type:</strong></span><span>${escapeHtml(apartment.bedroom_type)} Bedroom</span></div>
                        <div class="summary-row"><span><strong>Base Price:</strong></span><span>${formatPrice(apartment.base_price)}</span></div>
                        <div class="summary-row"><span><strong>Parking:</strong></span><span>${escapeHtml(apartment.parking_spots)}</span></div>
                        <div class="summary-row"><span><strong>Available:</strong></span><span>${escapeHtml(apartment.available)}</span></div>
                    </div>`;
            } else {
                document.getElementById('apartmentInfo').innerHTML =
                    '<p style="color:#c82333;">Apartment not found in inventory. Check apartment number in Excel.</p>';
            }

            let totalUpcharge = 0;
            let optionsHtml = '<div class="summary">';

            if (selections.length === 0) {
                optionsHtml += '<p style="color: #999;">No options selected yet</p>';
            } else {
                selections.forEach((sel, index) => {
                    totalUpcharge += num(sel.upcharge);
                    const noteId = `option-note-${index}`;
                    optionsHtml += `
                        <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                            <div class="summary-row">
                                <span><strong>${escapeHtml(sel.option_category)}:</strong> ${escapeHtml(sel.option_choice)}</span>
                                <span class="option-price">+${formatPrice(sel.upcharge)}</span>
                            </div>
                            <div style="margin-top: 8px;">
                                <label style="font-size: 12px; color: #666;">Notes for this option:</label>
                                <textarea id="${noteId}" placeholder="Delivery timeline, stock, etc."
                                    style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; font-family: inherit; resize: vertical; min-height: 50px;">${escapeHtml(sel.option_notes)}</textarea>
                            </div>
                        </div>`;
                });
                const totalPrice = (apartment ? num(apartment.base_price) : 0) + totalUpcharge;
                optionsHtml += `<div class="total-price">Total Price: ${formatPrice(totalPrice)}</div>`;
            }
            optionsHtml += '</div>';
            document.getElementById('optionsReview').innerHTML = optionsHtml;

            document.getElementById('approvalStatus').value = buyer.approval_status || 'Pending';
            document.getElementById('approvalNotes').value = buyer.approval_notes || '';
            document.getElementById('approvalForm').style.display = 'block';
            document.getElementById('syncInfo').style.display = 'block';
        }

        function saveApproval() {
            const buyer = appData.selectedBuyer;
            if (!buyer) {
                showToast('Select a buyer first', 'error');
                return;
            }

            const selections = appData.buyerSelections.filter(s => s.buyer_id === buyer.buyer_id);
            selections.forEach((sel, index) => {
                const noteEl = document.getElementById(`option-note-${index}`);
                if (noteEl) sel.option_notes = noteEl.value;
            });

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
            showToast(`Approval saved for ${buyer.name}`, 'success');
        }

        function cancelApproval() {
            if (appData.selectedBuyer) {
                document.getElementById('approvalStatus').value = appData.selectedBuyer.approval_status || 'Pending';
                document.getElementById('approvalNotes').value = appData.selectedBuyer.approval_notes || '';
            }
        }

        function searchForPdf(showAll = false) {
            if (!appData.buyers.length) {
                showToast('No buyers loaded — import Excel first', 'error');
                return;
            }

            const searchTerm = document.getElementById('pdfSearchInput').value.toLowerCase().trim();
            let results = [...appData.buyers];

            if (!showAll && searchTerm) {
                results = results.filter(b => buyerMatchesSearch(b, searchTerm));
            }
            if (!showAll && !searchTerm) {
                showToast('Enter a search term or click Show all', 'error');
                return;
            }

            const container = document.getElementById('pdfSearchResults');
            if (results.length === 0) {
                container.innerHTML = '<div class="no-results"><p>No results found</p></div>';
                return;
            }

            container.innerHTML = results.map(buyer => `
                <div class="buyer-card" data-buyer-id="${escapeHtml(buyer.buyer_id)}" role="button" tabindex="0">
                    <h3>${escapeHtml(buyer.name)}</h3>
                    <p><strong>Apartment:</strong> ${escapeHtml(buyer.apartment_number)}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${statusClass(buyer.approval_status)}">${escapeHtml(buyer.approval_status)}</span></p>
                </div>`).join('');
        }

        function buildContractHtml(buyer) {
            const apartment = appData.apartments.find(a => a.apartment_number === buyer.apartment_number);
            const selections = appData.buyerSelections.filter(s => s.buyer_id === buyer.buyer_id);

            let totalPrice = apartment ? num(apartment.base_price) : 0;
            let optionsHtml = '';

            if (selections.length > 0) {
                optionsHtml = '<h3>Selected Options</h3><ul style="margin-left:20px;">';
                selections.forEach(sel => {
                    totalPrice += num(sel.upcharge);
                    const note = sel.option_notes ? ` — <em>${escapeHtml(sel.option_notes)}</em>` : '';
                    optionsHtml += `<li><strong>${escapeHtml(sel.option_category)}:</strong> ${escapeHtml(sel.option_choice)} (+${formatPrice(sel.upcharge)})${note}</li>`;
                });
                optionsHtml += '</ul>';
            }

            const aptBlock = apartment ? `
                <p><strong>Apartment Number:</strong> ${escapeHtml(apartment.apartment_number)}</p>
                <p><strong>Bedrooms:</strong> ${escapeHtml(apartment.bedroom_type)}</p>
                <p><strong>Parking Spots:</strong> ${escapeHtml(apartment.parking_spots)}</p>
                <p><strong>Base Price:</strong> ${formatPrice(apartment.base_price)}</p>
            ` : `<p><em>Apartment ${escapeHtml(buyer.apartment_number)} — details not in inventory</em></p>`;

            return `
                <div class="contract-doc" style="font-family: Georgia, serif; line-height: 1.7; color: #222; max-width: 700px; margin: 0 auto;">
                    <h2 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">APARTMENT PURCHASE AGREEMENT</h2>
                    <p style="text-align: center; color: #666; font-size: 12px;">Generated ${escapeHtml(new Date().toLocaleString())}</p>
                    <h3>Buyer</h3>
                    <p><strong>Name:</strong> ${escapeHtml(buyer.name)} &nbsp;|&nbsp; <strong>ID:</strong> ${escapeHtml(buyer.buyer_id)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(buyer.email)} &nbsp;|&nbsp; <strong>Phone:</strong> ${escapeHtml(buyer.phone)}</p>
                    <h3>Unit</h3>
                    ${aptBlock}
                    ${optionsHtml}
                    <h3 style="border-top: 2px solid #333; padding-top: 12px; margin-top: 24px;">Total: ${formatPrice(totalPrice)}</h3>
                    <h3>Approval</h3>
                    <p><strong>Status:</strong> ${escapeHtml(buyer.approval_status)}</p>
                    <p><strong>Notes:</strong> ${escapeHtml(buyer.approval_notes) || '—'}</p>
                    <p><strong>Date:</strong> ${escapeHtml(buyer.approval_date) || '—'}</p>
                    <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #999;">
                        <p style="margin-bottom: 40px;">Buyer signature: _________________________________</p>
                        <p>Date: _________________________________</p>
                    </div>
                </div>`;
        }

        function previewPdf(buyerId) {
            const buyer = appData.buyers.find(b => b.buyer_id === buyerId);
            if (!buyer) return;

            currentBuyerForPdf = buyerId;
            document.getElementById('contractPreview').innerHTML = buildContractHtml(buyer);
            document.getElementById('pdfPreview').style.display = 'block';
            document.getElementById('pdfPreview').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function downloadPDF() {
            if (!currentBuyerForPdf) {
                showToast('Select a buyer and preview the contract first', 'error');
                return;
            }
            const buyer = appData.buyers.find(b => b.buyer_id === currentBuyerForPdf);
            const content = buildContractHtml(buyer);
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                showToast('Allow pop-ups to print or save as PDF', 'error');
                return;
            }
            printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contract - ${escapeHtml(buyer.name)}</title>
                <style>body{margin:24px;} @media print{body{margin:0;}}</style></head><body>${content}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                showToast(`Use "Save as PDF" in the print dialog for ${buyer.name}`, 'success');
            }, 300);
        }

        function closePdfPreview() {
            document.getElementById('pdfPreview').style.display = 'none';
            document.getElementById('pdfSearchResults').innerHTML = '';
            document.getElementById('pdfSearchInput').value = '';
            currentBuyerForPdf = null;
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
                showToast('Please select an Excel file first', 'error');
                return;
            }

            if (!(await waitForXLSX())) {
                showToast('Excel library not loaded. Check your connection and refresh.', 'error');
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
                    throw new Error('No rows loaded. Check headers: apartment_number, buyer_id, etc.');
                }

                persistChanges(null);
                showToast(`Imported ${appData.apartments.length} apartments, ${appData.buyers.length} buyers`, 'success');

                document.getElementById('excelFile').value = '';
                document.getElementById('excelFileName').textContent = '';
                currentExcelFile = null;

                document.querySelector('[data-section="search"]').click();
                listBuyers({ showAll: true });
            } catch (e) {
                console.error('Import error:', e);
                showToast(e.message || 'Import failed', 'error');
            }
        }

        async function exportToExcel() {
            if (!(await waitForXLSX())) {
                showToast('Excel library not loaded yet', 'error');
                return;
            }
            if (!appData.buyers.length && !appData.apartments.length) {
                showToast('Nothing to export — import data first', 'error');
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
                showToast('Excel file downloaded', 'success');
            } catch (e) {
                showToast('Export failed: ' + e.message, 'error');
            }
        }

        function clearAllData() {
            if (!confirm('Delete all local data? Export a backup first if needed.')) return;

            appData = { apartments: [], buyers: [], stylingOptions: [], buyerSelections: [], selectedBuyer: null };
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('appData');
            editIndex = null;
            updateDataSummary();
            updateSearchStats();
            renderSearchEmptyState();
            resetApprovalPanel();
            renderEditPanel();
            showToast('All data cleared', 'success');
        }

        function resetApprovalPanel() {
            appData.selectedBuyer = null;
            document.getElementById('buyerInfo').innerHTML = '<p style="color:#999;">Select a buyer from search first</p>';
            document.getElementById('apartmentInfo').innerHTML = '<p style="color:#999;">Select a buyer from search first</p>';
            document.getElementById('optionsReview').innerHTML = '<p style="color:#999;">Select a buyer from search first</p>';
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
            el.innerHTML = `
                <span class="stat-chip"><strong>${appData.buyers.length}</strong> buyers</span>
                <span class="stat-chip"><strong>${appData.apartments.length}</strong> apartments</span>
                <span class="stat-chip"><strong>${appData.buyerSelections.length}</strong> selections</span>`;
        }

        function updateOnlineStatus() {
            const statusEl = document.getElementById('onlineStatus');
            const statusText = document.getElementById('statusText');
            if (navigator.onLine) {
                statusEl.classList.remove('offline');
                statusText.textContent = 'Online';
            } else {
                statusEl.classList.add('offline');
                statusText.textContent = 'Offline — data saved on this device';
            }
        }

        function updateLastSync() {
            document.getElementById('lastSync').textContent = new Date().toLocaleString();
        }

        function formatPrice(price) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num(price));
        }

        function persistChanges(message) {
            saveDataToStorage(true);
            updateDataSummary();
            updateSearchStats();
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

        function renderEditPanel() {
            document.querySelectorAll('#editTabs [data-edit-tab]').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.editTab === editTab);
            });

            const panel = document.getElementById('editPanel');
            if (!appData.apartments.length && !appData.buyers.length && editTab !== 'apartments') {
                panel.innerHTML = `<div class="empty-state"><p>Import data first, or add apartments under the <strong>Apartments</strong> tab.</p></div>`;
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
                    <td>
                        <button type="button" class="btn-sm" data-edit-row="${i}">Edit</button>
                        <button type="button" class="btn-sm danger" data-delete-row="${i}">Delete</button>
                    </td>
                </tr>`).join('');

            const apt = editIndex != null ? appData.apartments[editIndex] : null;
            const isEdit = apt != null;

            return `
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>Unit</th><th>Beds</th><th>Base price</th><th>Parking</th><th>Available</th><th></th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="6" class="no-results">No apartments yet</td></tr>'}</tbody>
                    </table>
                </div>
                <div class="edit-form-card">
                    <h4>${isEdit ? 'Edit apartment' : 'Add apartment'}</h4>
                    <form id="editEntityForm" data-entity="apartments">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Apartment number *</label>
                                <input name="apartment_number" required value="${escapeHtml(apt?.apartment_number)}" ${isEdit ? 'readonly' : ''}>
                            </div>
                            <div class="form-group">
                                <label>Bedrooms</label>
                                <input name="bedroom_type" type="number" min="0" step="1" value="${escapeHtml(apt?.bedroom_type ?? '')}">
                            </div>
                            <div class="form-group">
                                <label>Base price ($)</label>
                                <input name="base_price" type="number" min="0" step="1000" value="${apt ? apt.base_price : ''}">
                            </div>
                            <div class="form-group">
                                <label>Parking spots</label>
                                <input name="parking_spots" type="number" min="0" step="1" value="${escapeHtml(apt?.parking_spots ?? '')}">
                            </div>
                            <div class="form-group">
                                <label>Available</label>
                                <select name="available">
                                    <option value="Yes" ${(!apt || apt.available === 'Yes') ? 'selected' : ''}>Yes</option>
                                    <option value="No" ${apt?.available === 'No' ? 'selected' : ''}>No</option>
                                </select>
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button type="submit" class="success">${isEdit ? 'Save changes' : 'Add apartment'}</button>
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
                    <td>
                        <button type="button" class="btn-sm" data-edit-row="${i}">Edit</button>
                        <button type="button" class="btn-sm danger" data-delete-row="${i}">Delete</button>
                    </td>
                </tr>`).join('');

            const b = editIndex != null ? appData.buyers[editIndex] : null;
            const isEdit = b != null;

            return `
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>ID</th><th>Name</th><th>Apartment</th><th>Email</th><th>Status</th><th></th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="6" class="no-results">No buyers yet</td></tr>'}</tbody>
                    </table>
                </div>
                <div class="edit-form-card">
                    <h4>${isEdit ? 'Edit buyer' : 'Add buyer'}</h4>
                    <form id="editEntityForm" data-entity="buyers">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Buyer ID *</label>
                                <input name="buyer_id" required value="${escapeHtml(b?.buyer_id)}" ${isEdit ? 'readonly' : ''} placeholder="${isEdit ? '' : suggestNextBuyerId()}">
                            </div>
                            <div class="form-group">
                                <label>Full name *</label>
                                <input name="name" required value="${escapeHtml(b?.name)}">
                            </div>
                            <div class="form-group">
                                <label>Apartment *</label>
                                <select name="apartment_number" required>${apartmentOptionsHtml(b?.apartment_number)}</select>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input name="email" type="email" value="${escapeHtml(b?.email)}">
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input name="phone" value="${escapeHtml(b?.phone)}">
                            </div>
                            <div class="form-group">
                                <label>Approval status</label>
                                <select name="approval_status">
                                    <option value="Pending" ${b?.approval_status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Approved" ${b?.approval_status === 'Approved' ? 'selected' : ''}>Approved</option>
                                    <option value="Rejected" ${b?.approval_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Contract signed</label>
                                <select name="contract_signed">
                                    <option value="No" ${b?.contract_signed !== 'Yes' ? 'selected' : ''}>No</option>
                                    <option value="Yes" ${b?.contract_signed === 'Yes' ? 'selected' : ''}>Yes</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Approval notes</label>
                            <textarea name="approval_notes">${escapeHtml(b?.approval_notes)}</textarea>
                        </div>
                        <div class="action-buttons">
                            <button type="submit" class="success">${isEdit ? 'Save changes' : 'Add buyer'}</button>
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
                    <td>
                        <button type="button" class="btn-sm" data-edit-row="${i}">Edit</button>
                        <button type="button" class="btn-sm danger" data-delete-row="${i}">Delete</button>
                    </td>
                </tr>`).join('');

            const o = editIndex != null ? appData.stylingOptions[editIndex] : null;
            const isEdit = o != null;

            return `
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>Category</th><th>Choice</th><th>Upcharge</th><th>Description</th><th></th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5" class="no-results">No styling options yet</td></tr>'}</tbody>
                    </table>
                </div>
                <div class="edit-form-card">
                    <h4>${isEdit ? 'Edit option' : 'Add styling option'}</h4>
                    <form id="editEntityForm" data-entity="options">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Category *</label>
                                <input name="option_category" required value="${escapeHtml(o?.option_category)}" list="categoryList" placeholder="Flooring, Kitchen…">
                                <datalist id="categoryList">${stylingCategories().map(c => '<option value="' + escapeHtml(c) + '">').join('')}</datalist>
                            </div>
                            <div class="form-group">
                                <label>Choice *</label>
                                <input name="option_choice" required value="${escapeHtml(o?.option_choice)}">
                            </div>
                            <div class="form-group">
                                <label>Upcharge ($)</label>
                                <input name="upcharge" type="number" min="0" step="100" value="${o ? o.upcharge : ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input name="description" value="${escapeHtml(o?.description)}">
                        </div>
                        <div class="action-buttons">
                            <button type="submit" class="success">${isEdit ? 'Save changes' : 'Add option'}</button>
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
                    <td>
                        <button type="button" class="btn-sm" data-edit-row="${i}">Edit</button>
                        <button type="button" class="btn-sm danger" data-delete-row="${i}">Delete</button>
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
                <div class="table-wrap">
                    <table class="table">
                        <thead><tr><th>Buyer</th><th>Category</th><th>Choice</th><th>Upcharge</th><th></th></tr></thead>
                        <tbody>${rows || '<tr><td colspan="5" class="no-results">No selections yet</td></tr>'}</tbody>
                    </table>
                </div>
                <div class="edit-form-card">
                    <h4>${isEdit ? 'Edit selection' : 'Add buyer selection'}</h4>
                    <form id="editEntityForm" data-entity="selections">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Buyer *</label>
                                <select name="buyer_id" required>${buyerOptionsHtml(s?.buyer_id)}</select>
                            </div>
                            <div class="form-group">
                                <label>Category *</label>
                                <select name="option_category" id="selCategory" required>
                                    <option value="">— Select —</option>
                                    ${catOptions}
                                    <option value="__custom__">Other (type below)</option>
                                </select>
                                <input name="option_category_custom" id="selCategoryCustom" placeholder="Custom category" style="margin-top:6px;${s && !cats.includes(s.option_category) ? '' : 'display:none;'}" value="${s && !cats.includes(s.option_category) ? escapeHtml(s.option_category) : ''}">
                            </div>
                            <div class="form-group">
                                <label>Choice *</label>
                                <select name="option_choice" id="selChoice">
                                    <option value="">— Select or type —</option>
                                    ${choiceOptions}
                                </select>
                                <input name="option_choice_custom" id="selChoiceCustom" placeholder="Custom choice" style="margin-top:6px;" value="">
                            </div>
                            <div class="form-group">
                                <label>Upcharge ($)</label>
                                <input name="upcharge" type="number" min="0" step="100" value="${s ? s.upcharge : ''}">
                            </div>
                            <div class="form-group">
                                <label>Selection date</label>
                                <input name="selection_date" type="date" value="${escapeHtml(s?.selection_date || new Date().toISOString().split('T')[0])}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Notes</label>
                            <textarea name="option_notes">${escapeHtml(s?.option_notes)}</textarea>
                        </div>
                        <div class="action-buttons">
                            <button type="submit" class="success">${isEdit ? 'Save changes' : 'Add selection'}</button>
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
                    showToast('Apartment number is required', 'error');
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
                        showToast('Apartment number already exists', 'error');
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
                    showToast('Buyer ID and name are required', 'error');
                    return;
                }
                if (!buyer.apartment_number) {
                    showToast('Select an apartment', 'error');
                    return;
                }
                if (editIndex != null) {
                    appData.buyers[editIndex] = buyer;
                } else {
                    if (appData.buyers.some(b => b.buyer_id === buyer.buyer_id)) {
                        showToast('Buyer ID already exists', 'error');
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
                    showToast('Category and choice are required', 'error');
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
                    showToast('Buyer, category, and choice are required', 'error');
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
                document.getElementById('editTabs').addEventListener('click', function (e) {
                    const tabBtn = e.target.closest('[data-edit-tab]');
                    if (!tabBtn) return;
                    editTab = tabBtn.dataset.editTab;
                    editIndex = null;
                    renderEditPanel();
                });
                const panel = document.getElementById('editPanel');
                panel.addEventListener('click', function (e) { onEditPanelClick(e); });
                panel.addEventListener('change', function (e) { onEditPanelChange(e); });
                panel.addEventListener('submit', function (e) { onEditFormSubmit(e); });
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