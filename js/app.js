const API_URL = 'https://66f535759aa4891f2a2451d7.mockapi.io/user';
let allGuests = [];
let filteredGuests = [];

// DOM Elements
const guestListEl = document.getElementById('guest-list');
const guestCountEl = document.getElementById('guest-count');
const deleteAllBtn = document.getElementById('delete-all-btn');
const collapseBtn = document.getElementById('collapse-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Fetch guests from API
async function fetchGuests() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('خطا در دریافت داده');
        allGuests = await response.json();
        filteredGuests = [...allGuests];
        renderGuestList();
    } catch (error) {
        console.error('Error:', error);
        showError('خطا در بارگذاری لیست مهمانان');
    }
}

// Delete guest from API
async function deleteGuest(id) {
    try {
        if (!confirm('آیا از حذف این مهمان اطمینان دارید؟')) return;
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('خطا در حذف مهمان');
        
        allGuests = allGuests.filter(guest => guest.id !== id);
        filteredGuests = filteredGuests.filter(guest => guest.id !== id);
        renderGuestList();
    } catch (error) {
        console.error('Error:', error);
        showError('خطا در حذف مهمان');
    }
}

// Delete all guests
async function deleteAllGuests() {
    if (!confirm('آیا از حذف تمام مهمانان اطمینان دارید؟')) return;
    
    try {
        showLoading();
        // Delete one by one (mock API doesn't support bulk delete)
        for (const guest of filteredGuests) {
            await fetch(`${API_URL}/${guest.id}`, {
                method: 'DELETE'
            });
        }
        
        allGuests = allGuests.filter(g => !filteredGuests.some(fg => fg.id === g.id));
        filteredGuests = [];
        renderGuestList();
    } catch (error) {
        console.error('Error:', error);
        showError('خطا در حذف مهمانان');
    }
}

// Search guests
function searchGuests() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredGuests = [...allGuests];
    } else {
        filteredGuests = allGuests.filter(guest => 
            guest.name.toLowerCase().includes(searchTerm) ||
            (guest.attendance === 'coming' ? 'حضور دارد' : 'عدم حضور').includes(searchTerm)
        );
    }
    
    renderGuestList();
}

// Render guest list
function renderGuestList() {
    if (filteredGuests.length === 0) {
        guestListEl.innerHTML = `
            <div class="guest-list-header">
                <div>نام مهمان</div>
                <div>وضعیت</div>
                <div>تعداد همراهان</div>
                <div class="action">عملیات</div>
            </div>
            <div class="${allGuests.length === 0 ? 'no-guests' : 'no-results'}">
                ${allGuests.length === 0 ? 'هیچ مهمانی ثبت نشده است' : 'مهمانی با این مشخصات یافت نشد'}
            </div>
        `;
        guestCountEl.textContent = '0';
        return;
    }
    
    let html = `
        <div class="guest-list-header">
            <div>نام مهمان</div>
            <div>وضعیت</div>
            <div>تعداد همراهان</div>
            <div class="action">عملیات</div>
        </div>
    `;
    
    filteredGuests.forEach(guest => {
        html += `
            <div class="guest-item">
                <div>${guest.name || 'بدون نام'}</div>
                <div>
                    <span class="status-badge ${guest.attendance === 'coming' ? 'status-coming' : 'status-not-coming'}">
                        ${guest.attendance === 'coming' ? 'حضور دارد' : 'عدم حضور'}
                    </span>
                </div>
                <div>${guest.guestCount || 0}</div>
                <div class="action">
                    <button class="delete-btn" data-id="${guest.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    guestListEl.innerHTML = html;
    guestCountEl.textContent = filteredGuests.length;
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteGuest(id);
        });
    });
}

// Toggle collapse/expand
function toggleCollapse() {
    guestListEl.classList.toggle('collapsed');
    const icon = collapseBtn.querySelector('i');
    const text = collapseBtn.querySelector('span');
    
    if (guestListEl.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        text.textContent = 'باز کردن لیست';
    } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
        text.textContent = 'جمع کردن لیست';
    }
}

// Show loading state
function showLoading() {
    guestListEl.innerHTML = `
        <div class="guest-list-header">
            <div>نام مهمان</div>
            <div>وضعیت</div>
            <div>تعداد همراهان</div>
            <div class="action">عملیات</div>
        </div>
        <div class="no-guests" style="display: flex; justify-content: center; align-items: center;">
            <div class="loading"></div>
            <span>در حال بارگذاری...</span>
        </div>
    `;
}

// Show error message
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'no-results';
    errorEl.textContent = message;
    
    const currentError = guestListEl.querySelector('.no-guests, .no-results');
    if (currentError) {
        guestListEl.replaceChild(errorEl, currentError);
    } else {
        guestListEl.appendChild(errorEl);
    }
}

// Event listeners
deleteAllBtn.addEventListener('click', deleteAllGuests);
collapseBtn.addEventListener('click', toggleCollapse);
searchBtn.addEventListener('click', searchGuests);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchGuests();
});

// Initialize
document.addEventListener('DOMContentLoaded', fetchGuests);