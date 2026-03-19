// Dairy Management System - Main Application
// Data Storage Keys
const STORAGE_KEYS = {
    CUSTOMERS: 'dairy_customers',
    MILK_ENTRIES: 'dairy_milk_entries',
    MILK_RATE: 'dairy_milk_rate'
};

// Application State
let currentView = 'customers';
let currentCustomerId = null;
let editingCustomerId = null;
let storageAvailable = false;

// Check if LocalStorage is available
function checkStorageAvailability() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        storageAvailable = true;
        updateStorageStatus(true);
        return true;
    } catch (e) {
        storageAvailable = false;
        console.error('LocalStorage not available:', e);
        updateStorageStatus(false);
        return false;
    }
}

// Update storage status display
function updateStorageStatus(available) {
    const statusEl = document.getElementById('storage-status');
    if (statusEl) {
        if (available) {
            statusEl.textContent = '✓ சேமிப்பு தயார்';
            statusEl.style.color = '#90EE90';
        } else {
            statusEl.textContent = '⚠ சேமிப்பு கிடைக்கவில்லை';
            statusEl.style.color = '#FFB6C1';
        }
    }
}

// Initialize Application
function startApp() {
    // Check storage first
    checkStorageAvailability();
    
    // Wait a bit for mobile browsers to fully load
    setTimeout(function() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeApp, 200);
            });
        } else {
            // DOM already loaded
            setTimeout(initializeApp, 200);
        }
    }, 100);
}

// Start the app
startApp();

// Initialize all components
function initializeApp() {
    try {
        // Verify storage is still available
        if (!storageAvailable) {
        if (!checkStorageAvailability()) {
            alert('சேமிப்பு கிடைக்கவில்லை. தரவு சேமிக்க முடியாது. உங்கள் உலாவி அமைப்புகளை சரிபார்க்கவும் அல்லது வேறு உலாவியைப் பயன்படுத்தவும்.');
            return;
        }
        }
        
        setupNavigation();
        setupCustomerManagement();
        setupMilkEntry();
        setupReports();
        setupBilling();
        setupSettings();
        loadCustomers();
        loadMilkRate();
        setDefaultDates();
        
        // Make functions available globally for onclick handlers
        window.openCustomerDashboard = openCustomerDashboard;
        window.openCustomerModal = openCustomerModal;
        window.deleteCustomer = deleteCustomer;
        
        console.log('Dairy Management System initialized successfully');
        console.log('Storage available:', storageAvailable);
        
        // Test storage
        if (storageAvailable) {
            try {
                const testKey = '__dairy_test__';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                console.log('Storage test passed');
            } catch (e) {
                console.error('Storage test failed:', e);
                storageAvailable = false;
            }
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('பயன்பாட்டை ஏற்றுவதில் பிழை: ' + error.message + '. பக்கத்தை புதுப்பிக்கவும்.');
    }
}

// Navigation Setup
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const view = this.getAttribute('data-view');
            if (view) {
                switchView(view);
                navButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Switch between views
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
    }
    
    // Refresh data when switching views
    if (viewName === 'customers') {
        loadCustomers();
    } else if (viewName === 'reports') {
        loadReportCustomers();
    } else if (viewName === 'billing') {
        loadBillingCustomers();
    }
}

// Customer Management
let customerListListenerAdded = false;

function setupCustomerManagement() {
    const addBtn = document.getElementById('add-customer-btn');
    if (!addBtn) {
        console.error('Add customer button not found');
        return;
    }
    
    const modal = document.getElementById('customer-modal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const cancelBtn = document.getElementById('cancel-customer-btn');
    const form = document.getElementById('customer-form');
    const backBtn = document.getElementById('back-to-customers');
    const customerList = document.getElementById('customer-list');
    
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCustomerModal();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeCustomerModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeCustomerModal();
        });
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            saveCustomer();
        });
    }
    
    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCustomerModal();
            }
        });
    }
    
    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            switchView('customers');
            currentCustomerId = null;
        });
    }
    
    // Add event delegation for customer list (only once)
    if (customerList && !customerListListenerAdded) {
        customerList.addEventListener('click', function(e) {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.getAttribute('data-action');
            const customerId = button.getAttribute('data-customer-id');
            
            if (!customerId) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (action === 'view-dashboard') {
                openCustomerDashboard(customerId);
            } else if (action === 'edit-customer') {
                openCustomerModal(customerId);
            } else if (action === 'delete-customer') {
                deleteCustomer(customerId);
            }
        });
        customerListListenerAdded = true;
    }
}

// Open customer modal
function openCustomerModal(customerId = null) {
    editingCustomerId = customerId;
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('modal-title');
    const nameInput = document.getElementById('customer-name-input');
    
    if (customerId) {
        const customers = getCustomers();
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            title.textContent = 'வாடிக்கையாளர் திருத்த';
            nameInput.value = customer.name;
        }
    } else {
        title.textContent = 'வாடிக்கையாளர் சேர்';
        nameInput.value = '';
    }
    
    modal.classList.add('active');
    nameInput.focus();
}

// Close customer modal
function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    modal.classList.remove('active');
    document.getElementById('customer-form').reset();
    editingCustomerId = null;
}

// Save customer
function saveCustomer() {
    const nameInput = document.getElementById('customer-name-input');
    const name = nameInput ? nameInput.value.trim() : '';
    
    if (!name) {
        alert('வாடிக்கையாளர் பெயரை உள்ளிடவும்');
        return;
    }
    
    if (!storageAvailable) {
        alert('சேமிப்பு கிடைக்கவில்லை. வாடிக்கையாளரை சேமிக்க முடியாது.');
        return;
    }
    
    let customers = getCustomers();
    
    if (editingCustomerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.id === editingCustomerId);
        if (index !== -1) {
            customers[index].name = name;
            customers[index].updatedAt = new Date().toISOString();
        }
    } else {
        // Add new customer
        const newCustomer = {
            id: generateId(),
            name: name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        customers.push(newCustomer);
    }
    
    if (saveCustomers(customers)) {
        loadCustomers();
        closeCustomerModal();
        // Show success message
        showMessage('வாடிக்கையாளர் வெற்றிகரமாக சேமிக்கப்பட்டார்!', 'success');
    }
}

// Delete customer
function deleteCustomer(customerId) {
    if (!confirm('இந்த வாடிக்கையாளரை நிச்சயமாக நீக்க விரும்புகிறீர்களா? அனைத்து பால் பதிவுகளும் நீக்கப்படும்.')) {
        return;
    }
    
    let customers = getCustomers();
    customers = customers.filter(c => c.id !== customerId);
    saveCustomers(customers);
    
    // Delete all milk entries for this customer
    let entries = getMilkEntries();
    entries = entries.filter(e => e.customerId !== customerId);
    saveMilkEntries(entries);
    
    loadCustomers();
}

// Load and display customers
function loadCustomers() {
    const customers = getCustomers();
    const customerList = document.getElementById('customer-list');
    
    if (!customerList) return;
    
    if (customers.length === 0) {
        customerList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 40px;">இன்னும் வாடிக்கையாளர்கள் இல்லை. தொடங்க "வாடிக்கையாளர் சேர்" என்பதை கிளிக் செய்யவும்.</p>';
        return;
    }
    
    customerList.innerHTML = customers.map(customer => `
        <div class="customer-card" data-customer-id="${customer.id}">
            <h3>${escapeHtml(customer.name)}</h3>
            <div class="customer-actions">
                <button class="btn btn-primary" data-action="view-dashboard" data-customer-id="${customer.id}">டாஷ்போர்டு காண்க</button>
                <button class="btn btn-secondary" data-action="edit-customer" data-customer-id="${customer.id}">திருத்த</button>
                <button class="btn btn-danger" data-action="delete-customer" data-customer-id="${customer.id}">நீக்க</button>
            </div>
        </div>
    `).join('');
}

// Open customer dashboard
function openCustomerDashboard(customerId) {
    currentCustomerId = customerId;
    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        document.getElementById('customer-dashboard-name').textContent = `${customer.name} - டாஷ்போர்டு`;
        switchView('customer-dashboard');
        loadCustomerMilkEntries();
    }
}

// Milk Entry System
function setupMilkEntry() {
    const saveBtn = document.getElementById('save-milk-entry');
    const dateInput = document.getElementById('milk-entry-date');
    
    if (!saveBtn || !dateInput) {
        return;
    }
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        saveMilkEntry();
    });
}

// Save milk entry
function saveMilkEntry() {
    if (!currentCustomerId) {
        alert('முதலில் ஒரு வாடிக்கையாளரைத் தேர்ந்தெடுக்கவும்');
        return;
    }
    
    if (!storageAvailable) {
        alert('சேமிப்பு கிடைக்கவில்லை. பதிவை சேமிக்க முடியாது.');
        return;
    }
    
    const dateInput = document.getElementById('milk-entry-date');
    const quantityInput = document.getElementById('milk-entry-quantity');
    
    if (!dateInput || !quantityInput) {
        alert('படிவ புலங்கள் கிடைக்கவில்லை');
        return;
    }
    
    const date = dateInput.value;
    const quantity = parseFloat(quantityInput.value);
    
    if (!date || !quantity || quantity <= 0) {
        alert('செல்லுபடியாகும் தேதி மற்றும் அளவை உள்ளிடவும்');
        return;
    }
    
    let entries = getMilkEntries();
    
    // Check if entry already exists for this date and customer
    const existingIndex = entries.findIndex(e => 
        e.customerId === currentCustomerId && e.date === date
    );
    
    const entry = {
        customerId: currentCustomerId,
        date: date,
        quantity: quantity,
        timestamp: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
        entries[existingIndex] = entry;
    } else {
        entries.push(entry);
    }
    
    if (saveMilkEntries(entries)) {
        loadCustomerMilkEntries();
        // Reset form
        quantityInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];
        showMessage('பால் பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது!', 'success');
    }
}

// Load customer milk entries
function loadCustomerMilkEntries() {
    if (!currentCustomerId) return;
    
    const entries = getMilkEntries();
    const customerEntries = entries.filter(e => e.customerId === currentCustomerId);
    
    // Sort by date (newest first)
    customerEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const calendarView = document.getElementById('milk-calendar');
    
    if (customerEntries.length === 0) {
        calendarView.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px; grid-column: 1 / -1;">இன்னும் பால் பதிவுகள் இல்லை. மேலே உங்கள் முதல் பதிவைச் சேர்க்கவும்.</p>';
        return;
    }
    
    // Group entries by date
    const entriesByDate = {};
    customerEntries.forEach(entry => {
        entriesByDate[entry.date] = entry.quantity;
    });
    
    // Display last 30 days
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push({
            date: dateStr,
            displayDate: formatDate(date),
            quantity: entriesByDate[dateStr] || null
        });
    }
    
    calendarView.innerHTML = days.map(day => `
        <div class="calendar-day ${day.quantity ? 'has-entry' : ''}">
            <div class="date">${day.displayDate}</div>
            ${day.quantity ? `<div class="quantity">${day.quantity.toFixed(2)} L</div>` : '<div class="quantity" style="color: #6c757d;">-</div>'}
        </div>
    `).join('');
}

// Reports System
function setupReports() {
    const generateBtn = document.getElementById('generate-report-btn');
    const downloadBtn = document.getElementById('download-report-pdf');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            generateReport();
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            downloadReportPDF();
        });
    }
}

// Load customers for report dropdown
function loadReportCustomers() {
    const customers = getCustomers();
    const select = document.getElementById('report-customer-select');
    
    select.innerHTML = '<option value="all">அனைத்து வாடிக்கையாளர்கள்</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

// Generate report
function generateReport() {
    const customerId = document.getElementById('report-customer-select').value;
    const fromDate = document.getElementById('report-from-date').value;
    const toDate = document.getElementById('report-to-date').value;
    
    if (!fromDate || !toDate) {
        alert('இருந்து மற்றும் வரை தேதிகளைத் தேர்ந்தெடுக்கவும்');
        return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
        alert('இருந்து தேதி வரை தேதிக்கு முன் அல்லது சமமாக இருக்க வேண்டும்');
        return;
    }
    
    let entries = getMilkEntries();
    
    // Filter entries
    entries = entries.filter(e => {
        const entryDate = new Date(e.date);
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        const dateMatch = entryDate >= from && entryDate <= to;
        const customerMatch = customerId === 'all' || e.customerId === customerId;
        
        return dateMatch && customerMatch;
    });
    
    // Calculate totals
    const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0);
    const customers = getCustomers();
    
    // Group by customer
    const byCustomer = {};
    entries.forEach(entry => {
        const customer = customers.find(c => c.id === entry.customerId);
        const customerName = customer ? customer.name : 'Unknown';
        if (!byCustomer[customerName]) {
            byCustomer[customerName] = 0;
        }
        byCustomer[customerName] += entry.quantity;
    });
    
    // Display summary
    const summaryDiv = document.getElementById('report-summary');
    summaryDiv.innerHTML = `
        <h3>அறிக்கை சுருக்கம்</h3>
        <p><strong>காலம்:</strong> ${formatDate(new Date(fromDate))} முதல் ${formatDate(new Date(toDate))} வரை</p>
        <p><strong>மொத்த பால்:</strong> ${totalQuantity.toFixed(2)} லிட்டர்</p>
        <p><strong>மொத்த பதிவுகள்:</strong> ${entries.length}</p>
        ${customerId === 'all' ? `<p><strong>வாடிக்கையாளர்கள்:</strong> ${Object.keys(byCustomer).length}</p>` : ''}
    `;
    
    // Display calendar view
    const calendarDiv = document.getElementById('report-calendar');
    const entriesByDate = {};
    entries.forEach(entry => {
        if (!entriesByDate[entry.date]) {
            entriesByDate[entry.date] = 0;
        }
        entriesByDate[entry.date] += entry.quantity;
    });
    
    // Get all dates in range
    const dateRange = [];
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const current = new Date(from);
    
    while (current <= to) {
        const dateStr = current.toISOString().split('T')[0];
        dateRange.push({
            date: dateStr,
            displayDate: formatDate(new Date(current)),
            quantity: entriesByDate[dateStr] || null
        });
        current.setDate(current.getDate() + 1);
    }
    
    calendarDiv.innerHTML = dateRange.map(day => `
        <div class="calendar-day ${day.quantity ? 'has-entry' : ''}">
            <div class="date">${day.displayDate}</div>
            ${day.quantity ? `<div class="quantity">${day.quantity.toFixed(2)} L</div>` : '<div class="quantity" style="color: #6c757d;">-</div>'}
        </div>
    `).join('');
    
    // Show download button
    document.getElementById('download-report-pdf').style.display = 'block';
    
    // Store report data for PDF
    window.currentReportData = {
        customerId,
        fromDate,
        toDate,
        totalQuantity,
        entries,
        byCustomer
    };
}

// Download report PDF
function downloadReportPDF() {
    if (!window.currentReportData) {
        alert('முதலில் ஒரு அறிக்கையை உருவாக்கவும்');
        return;
    }
    
    // Check if jsPDF is available
    if (!window.jspdf) {
        alert('PDF நூலகம் ஏற்றப்படவில்லை. உங்கள் இணைய இணைப்பை சரிபார்க்கவும் மற்றும் பக்கத்தை புதுப்பிக்கவும்.');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
    const data = window.currentReportData;
    const customers = getCustomers();
    
    // Title
    doc.setFontSize(18);
    doc.text('பால் மேலாண்மை அறிக்கை', 105, 20, { align: 'center' });
    
    // Report details
    doc.setFontSize(12);
    let y = 35;
    doc.text(`காலம்: ${formatDate(new Date(data.fromDate))} முதல் ${formatDate(new Date(data.toDate))} வரை`, 20, y);
    y += 8;
    doc.text(`மொத்த பால்: ${data.totalQuantity.toFixed(2)} லிட்டர்`, 20, y);
    y += 8;
    doc.text(`மொத்த பதிவுகள்: ${data.entries.length}`, 20, y);
    y += 15;
    
    // Customer breakdown
    if (data.customerId === 'all') {
        doc.setFontSize(14);
        doc.text('வாடிக்கையாளர் பிரித்தல்:', 20, y);
        y += 10;
        doc.setFontSize(11);
        
        Object.keys(data.byCustomer).forEach(customerName => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(`${customerName}: ${data.byCustomer[customerName].toFixed(2)} L`, 25, y);
            y += 8;
        });
    }
    
    // Daily entries
    y += 10;
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(14);
    doc.text('தினசரி பதிவுகள்:', 20, y);
    y += 10;
    doc.setFontSize(10);
    
    // Group by date
    const byDate = {};
    data.entries.forEach(entry => {
        if (!byDate[entry.date]) {
            byDate[entry.date] = [];
        }
        byDate[entry.date].push(entry);
    });
    
    Object.keys(byDate).sort().forEach(date => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        const dayTotal = byDate[date].reduce((sum, e) => sum + e.quantity, 0);
        const customer = data.customerId === 'all' ? 
            byDate[date].map(e => {
                const c = customers.find(c => c.id === e.customerId);
                return c ? c.name : 'Unknown';
            }).join(', ') : 
            customers.find(c => c.id === data.customerId)?.name || 'Unknown';
        
        doc.text(`${formatDate(new Date(date))}: ${dayTotal.toFixed(2)} L ${data.customerId === 'all' ? `(${customer})` : ''}`, 25, y);
        y += 7;
    });
    
    doc.save(`dairy-report-${data.fromDate}-to-${data.toDate}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again or check your internet connection.');
    }
}

// Billing System
function setupBilling() {
    const generateBtn = document.getElementById('generate-bill-btn');
    const downloadBtn = document.getElementById('download-bill-pdf');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            generateBill();
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            downloadBillPDF();
        });
    }
}

// Load customers for billing dropdown
function loadBillingCustomers() {
    const customers = getCustomers();
    const select = document.getElementById('billing-customer-select');
    
    select.innerHTML = '<option value="">வாடிக்கையாளர் தேர்ந்தெடு</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

// Generate bill (UPDATED FOR DATE RANGE)
function generateBill() {
    const customerId = document.getElementById('billing-customer-select').value;
    const fromDateStr = document.getElementById('billing-from-date').value;
    const toDateStr = document.getElementById('billing-to-date').value;

    // Validation
    if (!customerId || !fromDateStr || !toDateStr) {
        alert('வாடிக்கையாளர் மற்றும் தேதிகளைத் தேர்ந்தெடுக்கவும்');
        return;
    }

    if (new Date(fromDateStr) > new Date(toDateStr)) {
        alert('தொடக்க தேதி முடிவு தேதிக்குப் பிறகு இருக்க முடியாது');
        return;
    }

    const customers = getCustomers();
    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
        alert('வாடிக்கையாளர் கிடைக்கவில்லை');
        return;
    }

    // Get entries in date range
    let entries = getMilkEntries();
    entries = entries.filter(e => 
        e.customerId === customerId &&
        e.date >= fromDateStr &&
        e.date <= toDateStr
    );

    if (entries.length === 0) {
        alert('இந்த தேதிக்குள் எந்த பதிவும் இல்லை');
        return;
    }

    // Calculate totals
    const totalQuantity = entries.reduce((sum, e) => sum + e.quantity, 0);
    const rate = getMilkRate();
    const totalAmount = totalQuantity * rate;

    // Build table rows
    let rows = '';
    entries.forEach(e => {
        const amount = e.quantity * rate;
        rows += `
            <tr>
                <td>${e.date}</td>
                <td>${e.quantity.toFixed(2)}</td>
                <td>₹${rate.toFixed(2)}</td>
                <td>₹${amount.toFixed(2)}</td>
            </tr>
        `;
    });

    // Display bill
    const billContent = document.getElementById('bill-content');
    billContent.innerHTML = `
        <h3>பில் விவரம்</h3>

        <div class="bill-row">
            <span><strong>வாடிக்கையாளர்:</strong></span>
            <span>${escapeHtml(customer.name)}</span>
        </div>

        <div class="bill-row">
            <span><strong>From:</strong></span>
            <span>${fromDateStr}</span>
        </div>

        <div class="bill-row">
            <span><strong>To:</strong></span>
            <span>${toDateStr}</span>
        </div>

        <table border="1" width="100%" cellpadding="5" style="margin-top:10px;">
            <tr>
                <th>தேதி</th>
                <th>அளவு (லிட்டர்)</th>
                <th>விலை</th>
                <th>தொகை</th>
            </tr>
            ${rows}
        </table>

        <div class="bill-row" style="margin-top:10px;">
            <span><strong>மொத்த பால்:</strong></span>
            <span>${totalQuantity.toFixed(2)} லிட்டர்</span>
        </div>

        <div class="bill-row">
            <span><strong>லிட்டருக்கு விகிதம்:</strong></span>
            <span>₹${rate.toFixed(2)}</span>
        </div>

        <div class="bill-row total">
            <span><strong>மொத்த தொகை:</strong></span>
            <span>₹${totalAmount.toFixed(2)}</span>
        </div>
    `;

    document.getElementById('bill-preview').style.display = 'block';

    // Store bill data for PDF
    window.currentBillData = {
        customer,
        fromDate: fromDateStr,
        toDate: toDateStr,
        totalQuantity,
        rate,
        totalAmount,
        entries
    };
}

// Download bill PDF (UPDATED)
function downloadBillPDF() {
    if (!window.currentBillData) {
        alert('முதலில் ஒரு பில்லை உருவாக்கவும்');
        return;
    }

    if (!window.jspdf) {
        alert('PDF library load ஆகவில்லை');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const data = window.currentBillData;

        // Title
        doc.setFontSize(20);
        doc.text('பால் மேலாண்மை பில்', 105, 20, { align: 'center' });

        // Details
        doc.setFontSize(12);
        let y = 40;

        doc.text(`வாடிக்கையாளர்: ${data.customer.name}`, 20, y);
        y += 8;

        doc.text(`From: ${data.fromDate}`, 20, y);
        y += 8;

        doc.text(`To: ${data.toDate}`, 20, y);
        y += 15;

        // Line
        doc.line(20, y, 190, y);
        y += 10;

        // Entries
        doc.setFontSize(10);
        data.entries.forEach(e => {
            const amount = e.quantity * data.rate;
            doc.text(`${e.date} | ${e.quantity}L | ₹${amount.toFixed(2)}`, 20, y);
            y += 6;
        });

        y += 5;
        doc.line(20, y, 190, y);
        y += 10;

        // Total
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`மொத்த தொகை: ₹${data.totalAmount.toFixed(2)}`, 20, y);

        // Footer
        y = 270;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('உருவாக்கப்பட்ட தேதி: ' + formatDate(new Date()), 20, y);

        doc.save(`bill-${data.customer.name.replace(/\s+/g, '-')}.pdf`);

    } catch (error) {
        console.error(error);
        alert('PDF உருவாக்க பிழை');
    }
}

// Settings
function setupSettings() {
    const saveBtn = document.getElementById('save-rate-btn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            saveMilkRate();
        });
    }
}

// Save milk rate
function saveMilkRate() {
    if (!storageAvailable) {
        alert('சேமிப்பு கிடைக்கவில்லை. விகிதத்தை சேமிக்க முடியாது.');
        return;
    }
    
    const rateInput = document.getElementById('milk-rate');
    if (!rateInput) {
        alert('விகித உள்ளீடு கிடைக்கவில்லை');
        return;
    }
    
    const rate = parseFloat(rateInput.value);
    
    if (!rate || rate < 0) {
        alert('செல்லுபடியாகும் பால் விகிதத்தை உள்ளிடவும்');
        return;
    }
    
    try {
        localStorage.setItem(STORAGE_KEYS.MILK_RATE, JSON.stringify(rate));
        loadMilkRate();
        rateInput.value = '';
        showMessage('பால் விகிதம் வெற்றிகரமாக சேமிக்கப்பட்டது!', 'success');
    } catch (e) {
        console.error('Error saving milk rate:', e);
        alert('பால் விகிதத்தை சேமிப்பதில் பிழை. மீண்டும் முயற்சிக்கவும்.');
    }
}

// Load milk rate
function loadMilkRate() {
    const rate = getMilkRate();
    const display = document.getElementById('current-rate-display');
    
    if (rate > 0) {
        display.textContent = `தற்போதைய விகிதம்: ₹${rate.toFixed(2)} லிட்டருக்கு`;
    } else {
        display.textContent = 'விகிதம் அமைக்கப்படவில்லை. பால் விகிதத்தை அமைக்கவும்.';
        display.style.background = '#f8d7da';
        display.style.color = '#721c24';
    }
}

// Set default dates
function setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('report-from-date').value = firstDay.toISOString().split('T')[0];
    document.getElementById('report-to-date').value = lastDay.toISOString().split('T')[0];
    
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('billing-month').value = currentMonth;
}

// Data Storage Functions
function getCustomers() {
    if (!storageAvailable) {
        console.warn('Storage not available');
        return [];
    }
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading customers:', e);
        return [];
    }
}

function saveCustomers(customers) {
    if (!storageAvailable) {
        alert('சேமிப்பு கிடைக்கவில்லை. தரவை சேமிக்க முடியாது.');
        return false;
    }
    try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        console.log('Customers saved:', customers.length);
        return true;
    } catch (e) {
        console.error('Error saving customers:', e);
        alert('தரவை சேமிப்பதில் பிழை. மீண்டும் முயற்சிக்கவும்.');
        return false;
    }
}

function getMilkEntries() {
    if (!storageAvailable) {
        console.warn('Storage not available');
        return [];
    }
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MILK_ENTRIES);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading milk entries:', e);
        return [];
    }
}

function saveMilkEntries(entries) {
    if (!storageAvailable) {
        alert('சேமிப்பு கிடைக்கவில்லை. தரவை சேமிக்க முடியாது.');
        return false;
    }
    try {
        localStorage.setItem(STORAGE_KEYS.MILK_ENTRIES, JSON.stringify(entries));
        console.log('Milk entries saved:', entries.length);
        return true;
    } catch (e) {
        console.error('Error saving milk entries:', e);
        alert('தரவை சேமிப்பதில் பிழை. மீண்டும் முயற்சிக்கவும்.');
        return false;
    }
}

function getMilkRate() {
    if (!storageAvailable) {
        return 0;
    }
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MILK_RATE);
        return data ? parseFloat(JSON.parse(data)) : 0;
    } catch (e) {
        console.error('Error reading milk rate:', e);
        return 0;
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatMonthYear(date) {
    const d = new Date(date);
    const monthNames = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
        'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message to user
function showMessage(message, type) {
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 16px;
        font-weight: 500;
        max-width: 90%;
        text-align: center;
    `;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    
    // Remove after 3 seconds
    setTimeout(function() {
        msgDiv.style.opacity = '0';
        msgDiv.style.transition = 'opacity 0.3s';
        setTimeout(function() {
            if (msgDiv.parentNode) {
                msgDiv.parentNode.removeChild(msgDiv);
            }
        }, 300);
    }, 3000);
}

// Functions are made available globally in initializeApp()

