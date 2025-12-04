// روابط واجهات برمجة التطبيقات لجلب البيانات
const DRIVERS_API = 'https://script.google.com/macros/s/AKfycby_nb2K4vvKSSGf-rIzoC4piG7rCajELDVAN-CxQQL0FlSBcWwctobNNlH6fRcP9qOo/exec';
const ACTIVITIES_API = 'https://script.google.com/macros/s/AKfycbz_i-wRFIAbax3k0s-HWLp5Y8CrN7mkOussemBhDYOIGNJ5a_lLWuh7kyjGdQQC-IM0/exec';

// دالة لجلب البيانات من واجهة برمجة التطبيقات
async function fetchData(url, isActivities = false) {
    try {
        console.log('جاري جلب البيانات من:', url);
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`خطأ في الاستجابة: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('تم جلب البيانات بنجاح:', data);
        
        if (isActivities) {
            // إذا كانت بيانات النشاطات، نقوم بإنشاء كائن يحتوي على آخر نشاط
            return {
                lastActivity: data,
                weekly: 1,  // قيمة افتراضية
                monthly: 1, // قيمة افتراضية
                yearly: 1   // قيمة افتراضية
            };
        }
        
        return data;
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        return isActivities ? { lastActivity: null, weekly: 0, monthly: 0, yearly: 0 } : null;
    }
}

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date) ? null : date;
}

// دالة لحساب عدد النشاطات
function calculateActivitiesCount(activity) {
    if (!activity || !activity.date) return { weekly: 0, monthly: 0, yearly: 0 };
    
    const now = new Date();
    const activityDate = new Date(activity.date);
    
    // حساب الفرق بالمللي ثانية
    const diffTime = now - activityDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // إذا كان النشاط في آخر أسبوع
    const isThisWeek = diffDays <= 7;
    // إذا كان النشاط في آخر شهر (30 يوم)
    const isThisMonth = diffDays <= 30;
    // إذا كان النشاط في آخر سنة (365 يوم)
    const isThisYear = diffDays <= 365;
    
    return {
        weekly: isThisWeek ? 1 : 0,
        monthly: isThisMonth ? 1 : 0,
        yearly: isThisYear ? 1 : 0
    };
}

// دالة لتحديث الإحصائيات
async function updateStatistics() {
    console.log('بدء تحديث الإحصائيات...');
    
    try {
        // جلب بيانات السائقين والمؤسسات والمعوزين
        console.log('جاري جلب بيانات السائقين...');
        const driversData = await fetchData(DRIVERS_API);
        
        if (driversData) {
            console.log('بيانات السائقين المستلمة:', driversData);
            
            // تحديث إحصائيات السائقين والمؤسسات والمعوزين
            updateElement('activeDriversCount', driversData.drivers || 0);
            updateElement('totalOrganizationsCount', driversData.institutions || 0);
            updateElement('needyPeopleCount', driversData.needy || 0);
            
            // تحديث عدد المتصلين (المتبرعين)
            const donorsCount = driversData.donors || 0;
            updateElement('totalCallersCount', donorsCount);
            
            // حساب عدد أعضاء الجمعية (9 + عدد المنخرطين + عدد المتصلين)
            const membersCount = 9 + (parseInt(driversData.members) || 0) + parseInt(donorsCount);
            updateElement('associationMembersCount', membersCount);
        }
        
        // جلب بيانات النشاطات
        console.log('جاري جلب بيانات النشاطات...');
        const activitiesData = await fetchData(ACTIVITIES_API, true);
        
        if (activitiesData && activitiesData.lastActivity) {
            console.log('بيانات النشاطات المستلمة:', activitiesData);
            
            // حساب عدد النشاطات بناءً على تاريخ آخر نشاط
            const activitiesCount = calculateActivitiesCount(activitiesData.lastActivity);
            
            // تحديث إحصائيات النشاطات
            updateElement('weeklyActivitiesCount', activitiesCount.weekly);
            updateElement('monthlyActivitiesCount', activitiesCount.monthly);
            updateElement('yearlyActivitiesCount', activitiesCount.yearly);
            
            // عرض معلومات آخر نشاط
            updateLastActivityInfo(activitiesData.lastActivity);
        } else {
            // تعيين القيم الافتراضية إذا لم تكن هناك بيانات
            updateElement('weeklyActivitiesCount', 0);
            updateElement('monthlyActivitiesCount', 0);
            updateElement('yearlyActivitiesCount', 0);
        }
        
        // تحديث عدد المكاتب النشطة وغير النشطة
        console.log('جاري حساب عدد المكاتب...');
        const activeOffices = document.querySelectorAll('.office.active').length || 0;
        const inactiveOffices = document.querySelectorAll('.office:not(.active)').length || 0;
        updateElement('activeOfficesCount', activeOffices);
        updateElement('inactiveOfficesCount', inactiveOffices);
        
        console.log('تم تحديث جميع الإحصائيات بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء تحديث الإحصائيات:', error);
    }
}

// دالة لعرض معلومات آخر نشاط
function updateLastActivityInfo(activity) {
    if (!activity) return;
    
    const lastActivityElement = document.getElementById('lastActivityInfo');
    if (lastActivityElement) {
        lastActivityElement.innerHTML = `
            <h6>آخر نشاط: ${activity.title || 'لا يوجد عنوان'}</h6>
            <p class="mb-1">الوصف: ${activity.description || 'لا يوجد وصف'}</p>
            <p class="mb-1">التاريخ: ${activity.date || 'غير محدد'}</p>
            <p class="mb-0">المكان: ${activity.place || 'غير محدد'}</p>
        `;
    }
}

// دالة مساعدة لتحديث عنصر HTML
function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || 0;
    } else {
        console.error(`العنصر غير موجود: ${elementId}`);
    }
}

// تحديث الإحصائيات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل الصفحة، جاري تحديث الإحصائيات...');
    updateStatistics();
    
    // تحديث الإحصائيات كل 5 دقائق
    setInterval(updateStatistics, 300000);
});