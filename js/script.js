// Main application script
let currentUser = null;

// Make currentUser available globally for the offices module
window.currentUser = currentUser;

// Check if current user is the office head
function isOfficeHead() {
    return currentUser && currentUser.role === 'raees';
}

// Update current user in both local and global scope
function setCurrentUser(user) {
    currentUser = user;
    window.currentUser = user; // Make it available for offices.js
}

// Function to initialize all components
function initializeApp() {
    // Check for saved user session
    const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('rememberedUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            
            // Initialize components
            initializeCalendar();
            setupChat();
            setupFileUpload();
            addSampleEvents();
            
            // Initialize offices grid with retry logic
            function initializeOfficesWithRetry(attempt = 0) {
                if (attempt > 3) {
                    console.error('Failed to initialize offices grid after multiple attempts');
                    return;
                }
                
                try {
                    console.log(`Initializing offices grid (attempt ${attempt + 1})`);
                    initializeOfficesGrid();
                    
                    // Verify the grid was populated
                    const grid = document.getElementById('offices-grid');
                    if (!grid || !grid.children.length) {
                        throw new Error('Offices grid is empty');
                    }
                    
                    console.log('Offices grid initialized successfully');
                } catch (error) {
                    console.warn(`Failed to initialize offices grid: ${error.message}`);
                    setTimeout(() => initializeOfficesWithRetry(attempt + 1), 500);
                }
            }
            
            // Start the initialization
            initializeOfficesWithRetry();
            
        } catch (e) {
            console.error('Error initializing app:', e);
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing app...');
    // Initialize the app
    initializeApp();
    
    // Initialize offices grid with a small delay to ensure all elements are available
    setTimeout(initializeOfficesGrid, 200);
    
    // Also try initializing again after a short delay in case of any timing issues
    setTimeout(initializeOfficesGrid, 1000);
});

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Adjust for RTL (Arabic week starts on Saturday)
    const firstDayIndex = (firstDayOfMonth + 1) % 7;
    
    let calendarHTML = `
        <div class="calendar-header">
            <h4>${monthNames[currentMonth]} ${currentYear}</h4>
        </div>
        <div class="calendar-days">
            <div>سبت</div>
            <div>أحد</div>
            <div>إثنين</div>
            <div>ثلاثاء</div>
            <div>أربعاء</div>
            <div>خميس</div>
            <div>جمعة</div>
        </div>
        <div class="calendar-dates">
    `;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
        calendarHTML += '<div></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (day === currentDate) && 
                       (new Date().getMonth() === currentMonth) && 
                       (new Date().getFullYear() === currentYear);
        
        calendarHTML += `
            <div class="calendar-date ${isToday ? 'today' : ''}">${day}</div>
        `;
    }
    
    calendarHTML += '</div>';
    calendarEl.innerHTML = calendarHTML;
}

// Set the current user and initialize the grid
function setCurrentUser(user) {
    console.log('Setting current user:', user);
    currentUser = user;
    loadOfficeStatuses();
    
    // Initialize the offices grid after a small delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Initializing offices grid for user:', user);
        initializeOfficesGrid();
    }, 100);
}

// Toggle office status
function toggleOfficeStatus(officeId) {
    if (!isOfficeHead()) {
        return;
    }
    
    // Toggle the status
    officeStatuses[officeId] = !officeStatuses[officeId];
    saveOfficeStatuses();
    initializeOfficesGrid();
}


function setupChat() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!messageInput || !sendButton || !chatMessages) return;
    
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.style.padding = '8px';
            messageElement.style.margin = '5px 0';
            messageElement.style.backgroundColor = '#f0f0f0';
            messageElement.style.borderRadius = '5px';
            chatMessages.appendChild(messageElement);
            
            // Clear input
            messageInput.value = '';
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate response after a short delay
            setTimeout(sendAutoResponse, 1000);
        }
    }
    
    function sendAutoResponse() {
        const responses = [
            "شكراً على رسالتك",
            "سيتم الرد عليك قريباً",
            "نقدر تواصلك معنا",
            "هل هناك أي شيء آخر يمكننا مساعدتك به؟"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseElement = document.createElement('div');
        responseElement.textContent = randomResponse;
        responseElement.style.padding = '8px';
        responseElement.style.margin = '5px 0';
        responseElement.style.backgroundColor = '#e6f7ed';
        responseElement.style.borderRadius = '5px';
        responseElement.style.textAlign = 'right';
        chatMessages.appendChild(responseElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function setupFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    if (!fileUpload) return;
    
    fileUpload.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            alert(`تم اختيار الملف: ${fileName}\nسيتم رفعه قريباً.`);
            // Here you would typically handle the file upload to a server
        }
    });
}

function addSampleEvents() {
    const eventsContent = document.querySelector('.events-content');
    if (!eventsContent) return;
    
    const events = [
        { title: "اجتماع إداري", date: "2025-10-20" },
        { title: "حملة تبرعات", date: "2025-10-25" },
        { title: "ورشة عمل", date: "2025-11-05" }
    ];
    
    eventsContent.innerHTML = '';
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.style.marginBottom = '10px';
        eventElement.style.padding = '8px';
        eventElement.style.backgroundColor = '#f8f9fa';
        eventElement.style.borderRadius = '4px';
        eventElement.innerHTML = `
            <strong>${event.title}</strong>
            <span style="display: block; color: #666; font-size: 0.9em;">${event.date}</span>
        `;
        eventsContent.appendChild(eventElement);
    });
}

