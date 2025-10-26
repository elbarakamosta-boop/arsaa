document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    // Set RTL direction for the calendar
    calendarEl.dir = 'rtl';
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Configure moment to use Arabic locale
    moment.locale('ar');

    const gregorianMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    function getHijriDate(gregorianDate) {
        // Create moment object with the exact date
        const m = moment(gregorianDate);
        // Convert to Hijri and get the full date string in Arabic
        const hijriDate = m.format('iD iMMMM iYYYY');
        const [day, month, year] = hijriDate.split(' ');
        
        // Get the Arabic day name
        const dayOfWeek = m.format('dddd');
        
        return {
            day: parseInt(day),
            month: month,
            year: parseInt(year),
            dayName: dayOfWeek
        };
    }

    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const isCurrentMonth = (month === today.getMonth() && year === today.getFullYear());

        // Update month and year in header
        const currentHijri = moment(today).format('iD iMMMM iYYYY').split(' ');
        const currentGregorian = moment(today).locale('ar').format('dddd D MMMM YYYY');
        
        calendarEl.innerHTML = `
            <div class="today-display">
                <div class="current-date">
                    <div class="gregorian-date">${currentGregorian}</div>
                    <div class="hijri-date">${currentHijri[0]} ${currentHijri[1]} ${currentHijri[2]}هـ</div>
                </div>
            </div>
            <div class="calendar-header">
                <button id="prev-month" class="nav-btn"><i class="fas fa-chevron-right"></i></button>
                <div class="month-display">
                    <span class="hijri-month">${moment(new Date(year, month, 1)).format('iMMMM iYYYY')} هـ</span>
                    <span class="gregorian-month">${gregorianMonths[month]} ${year} م</span>
                </div>
                <button id="next-month" class="nav-btn"><i class="fas fa-chevron-left"></i></button>
            </div>
            <div class="calendar-weekdays">
                ${weekDays.map(day => `<div class="weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-days" id="calendar-days"></div>
        `;

        const calendarDaysEl = document.getElementById('calendar-days');
        
        // Clear any existing days
        calendarDaysEl.innerHTML = '';

        // Add empty cells for days from previous month
        const daysFromPrevMonth = firstDay === 0 ? 6 : firstDay - 1; // Days to show from previous month
        for (let i = 0; i < daysFromPrevMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month';
            const prevDay = daysInPrevMonth - daysFromPrevMonth + i + 1;
            
            // Add date
            const dateSpan = document.createElement('span');
            dateSpan.className = 'day-number';
            dateSpan.textContent = prevDay;
            dayEl.appendChild(dateSpan);
            
            // Add Hijri date (approximate)
            const hijriDay = getHijriDate(new Date(year, month - 1, prevDay));
            const hijriSpan = document.createElement('span');
            hijriSpan.className = 'hijri-day';
            hijriSpan.textContent = hijriDay.day;
            dayEl.appendChild(hijriSpan);
            
            calendarDaysEl.appendChild(dayEl);
        }

        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // Add date
            const dateSpan = document.createElement('span');
            dateSpan.className = 'day-number';
            dateSpan.textContent = i;
            dayEl.appendChild(dateSpan);
            
            // Add Hijri date
            const hijriDay = getHijriDate(new Date(year, month, i));
            const hijriSpan = document.createElement('span');
            hijriSpan.className = 'hijri-day';
            hijriSpan.textContent = hijriDay.day;
            dayEl.appendChild(hijriSpan);
            
            // Highlight today
            if (isCurrentMonth && i === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            calendarDaysEl.appendChild(dayEl);
        }

        // Calculate remaining cells for next month
        const totalCells = 42; // 6 rows x 7 days
        const daysShown = daysFromPrevMonth + daysInMonth;
        const remainingCells = totalCells - daysShown;
        
        // Add days from next month
        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day other-month';
            
            // Add date
            const dateSpan = document.createElement('span');
            dateSpan.className = 'day-number';
            dateSpan.textContent = i;
            dayEl.appendChild(dateSpan);
            
            // Add Hijri date (approximate)
            const hijriDay = getHijriDate(new Date(year, month + 1, i));
            const hijriSpan = document.createElement('span');
            hijriSpan.className = 'hijri-day';
            hijriSpan.textContent = hijriDay.day;
            dayEl.appendChild(hijriSpan);
            
            calendarDaysEl.appendChild(dayEl);
        }

        // Add event listeners for navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });
    }

    // Initial render
    renderCalendar(currentMonth, currentYear);
});
