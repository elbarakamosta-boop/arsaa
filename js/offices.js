// Office management functions
let officeStatuses = {};

// Load office statuses from localStorage
function loadOfficeStatuses() {
    const savedStatuses = localStorage.getItem('officeStatuses');
    if (savedStatuses) {
        officeStatuses = JSON.parse(savedStatuses);
    }
    return officeStatuses;
}

// Save office statuses to localStorage
function saveOfficeStatuses() {
    localStorage.setItem('officeStatuses', JSON.stringify(officeStatuses));
}

// Toggle office status
function toggleOfficeStatus(officeId) {
    if (!officeId) return;
    
    // Toggle the status
    officeStatuses[officeId] = !officeStatuses[officeId];
    saveOfficeStatuses();
    initializeOfficesGrid();
}

// قائمة المكاتب الولائية
const offices = [
  { id: 1,  name: 'أولاد بوغالم', active: false },
  { id: 2,  name: 'أولاد مع الله', active: false },
  { id: 3,  name: 'الحسيان', active: false },
  { id: 4,  name: 'السوافلية', active: false },
  { id: 5,  name: 'الصفصاف', active: false },
  { id: 6,  name: 'الصور', active: true },
  { id: 7,  name: 'الطواهرية', active: false },
  { id: 8,  name: 'بن عبد المالك رمضان', active: false },
  { id: 9,  name: 'بوقيراط', active: false },
  { id: 10, name: 'تازقايت', active: false },
  { id: 11, name: 'حاسي مماش', active: false },
  { id: 12, name: 'حجاج', active: true },
  { id: 13, name: 'خضرة', active: false },
  { id: 14, name: 'خير الدين', active: false },
  { id: 15, name: 'ستيدية', active: false },
  { id: 16, name: 'سيدي بلعطار', active: false },
  { id: 17, name: 'سيدي علي', active: false },
  { id: 18, name: 'سيدي لخضر', active: true },
  { id: 19, name: 'سيرات', active: false },
  { id: 20, name: 'صيادة', active: false },
  { id: 21, name: 'عشعاشة', active: true },
  { id: 22, name: 'عين النويصي', active: false },
  { id: 23, name: 'عين بودينار', active: false },
  { id: 24, name: 'عين تادلس', active: true },
  { id: 25, name: 'عين سيدي شريف', active: false },
  { id: 26, name: 'فرناكة', active: false },
  { id: 27, name: 'ماسرة', active: false },
  { id: 28, name: 'مزغران', active: false },
  { id: 29, name: 'منصورة', active: false },
  { id: 30, name: 'نقمارية', active: false },
  { id: 31, name: 'واد الخير', active: false },
  { id: 32, name: 'مستغانم', active: true }
];

console.log('Offices data loaded:', offices.length, 'offices found');

// Initialize the offices grid with current statuses
function initializeOfficesGrid() {
    console.log('Initializing offices grid...');
    const officesGrid = document.getElementById('offices-grid');
    
    if (!officesGrid) {
        console.error('Offices grid element not found!');
        return;
    }
    
    // Show loading state
    officesGrid.innerHTML = '<div class="loading-offices">جاري تحميل المكاتب...</div>';
    
    // Make sure officeStatuses is loaded
    loadOfficeStatuses();
    
    let buttonsHTML = '';
    
    // Show office head status if logged in as office head
    const isHead = window.currentUser && window.currentUser.role === 'raees';
    
    if (isHead) {
        buttonsHTML += `
            <div class="office-head-controls">
                <div class="office-head-status">
                    <i class="fas fa-user-shield"></i>
                    أنت مسجل كرئيس المكتب - يمكنك تعديل حالة المكاتب
                </div>
            </div>
        `;
    }
    
    // Add offices grid
    if (offices && offices.length > 0) {
        // Sort offices by name for better organization
        const sortedOffices = [...offices].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedOffices.forEach(office => {
            // Use saved status or default to office.active
            const isActive = officeStatuses[office.id] !== undefined ? 
                officeStatuses[office.id] : office.active;
            
            const statusClass = isActive ? 'active-office' : 'inactive-office';
            // Show green for active (true) and red for inactive (false)
            const statusIcon = isActive ? 
                '<i class="fas fa-circle text-success fa-lg"></i>' : 
                '<i class="fas fa-circle text-danger fa-lg"></i>';
            
            buttonsHTML += `
                <div class="office-card ${statusClass}">
                    <div class="office-name">${office.name}</div>
                    <div class="office-status">
                        ${isHead ? statusIcon : ''}
                    </div>
                    ${isHead ? `
                        <button 
                            class="toggle-btn" 
                            onclick="window.toggleOfficeStatus(${office.id})"
                            title="تغيير الحالة"
                            data-office-id="${office.id}"
                        >
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    ` : ''}
                </div>
            `;
        });
    } else {
        buttonsHTML += '<div class="no-offices">لا توجد مكاتب متاحة للعرض</div>';
    }
    
    // Update the DOM
    officesGrid.innerHTML = buttonsHTML;
    
    // Make functions available globally
    window.initializeOfficesGrid = initializeOfficesGrid;
    window.toggleOfficeStatus = toggleOfficeStatus;
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOfficesGrid);
} else {
    initializeOfficesGrid();
}
