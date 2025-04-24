        // API endpoint
        const API_URL = 'https://66f535759aa4891f2a2451d7.mockapi.io/user';
        
        // تاریخ عروسی: ۶ شهریور ۱۴۰۴ (۲۸ آگوست ۲۰۲۵)
        const weddingDate = new Date('2025-08-28T00:00:00');
        
        // تایمر شمارش معکوس
        function updateTimer() {
            const now = new Date();
            const diff = weddingDate - now;
            
            if (diff <= 0) {
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }
        
        setInterval(updateTimer, 1000);
        updateTimer();
        
        // تابع برای ارسال داده به API
        async function postGuestData(guestData) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(guestData)
                });
                
                if (!response.ok) {
                    throw new Error('خطا در ارسال داده');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        }
        
        // تابع برای دریافت داده از API
        async function fetchGuestList() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('خطا در دریافت داده');
                }
                const guests = await response.json();
                return guests;
            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        }
        
        // تابع برای نمایش لیست مهمانان
        function displayGuestList(guests) {
            const guestList = document.getElementById('guest-list');
            guestList.innerHTML = '';
            
            // حذف موارد تکراری بر اساس نام
            const uniqueGuests = [];
            const seenNames = new Set();
            
            guests.forEach(guest => {
                if (!seenNames.has(guest.name)) {
                    seenNames.add(guest.name);
                    uniqueGuests.push(guest);
                }
            });
            
            if (uniqueGuests.length === 0) {
                guestList.innerHTML = '<div class="guest-item" style="justify-content: center;">هنوز مهمانی ثبت نشده است</div>';
                return;
            }
            
            uniqueGuests.forEach(guest => {
                const guestItem = document.createElement('div');
                guestItem.classList.add('guest-item');
                
                const guestName = document.createElement('span');
                guestName.classList.add('guest-name');
                guestName.textContent = guest.name;
                
                const guestStatus = document.createElement('span');
                guestStatus.classList.add('guest-status');
                
                if (guest.attendance === 'coming') {
                    guestStatus.classList.add('status-coming');
                    guestStatus.textContent = guest.guestCount > 0 ? 
                        `حضور دارد (${guest.guestCount} همراه)` : 'حضور دارد';
                } else {
                    guestStatus.classList.add('status-not-coming');
                    guestStatus.textContent = 'عدم حضور';
                }
                
                guestItem.appendChild(guestName);
                guestItem.appendChild(guestStatus);
                guestList.appendChild(guestItem);
            });
        }
        
        // مدیریت فرم نظر سنجی
        document.getElementById('submit-rsvp').addEventListener('click', async function() {
            const name = document.getElementById('guest-name').value.trim();
            const attendance = document.querySelector('input[name="attendance"]:checked').value;
            const guestCount = parseInt(document.getElementById('guest-count').value);
            
            if (!name) {
                alert('لطفاً نام خود را وارد کنید');
                return;
            }
            
            const submitBtn = document.getElementById('submit-rsvp');
            const submitText = document.getElementById('submit-text');
            const submitLoading = document.getElementById('submit-loading');
            
            // نمایش اسپینر لودینگ
            submitText.style.display = 'none';
            submitLoading.style.display = 'inline-block';
            submitBtn.disabled = true;
            
            try {
                // ارسال داده به API
                const guestData = {
                    name: name,
                    attendance: attendance,
                    guestCount: guestCount,
                    createdAt: new Date().toISOString()
                };
                
                await postGuestData(guestData);
                
                // دریافت لیست به‌روز شده
                const guests = await fetchGuestList();
                displayGuestList(guests);
                
                // پاک کردن فرم
                document.getElementById('guest-name').value = '';
                document.getElementById('coming').checked = true;
                document.getElementById('guest-count').value = '0';
                
                // نمایش پیام موفقیت
                showSuccessMessage('پاسخ شما با موفقیت ثبت شد!');
            } catch (error) {
                showSuccessMessage('خطا در ثبت پاسخ. لطفاً دوباره تلاش کنید.', true);
            } finally {
                // مخفی کردن اسپینر لودینگ
                submitText.style.display = 'inline-block';
                submitLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
        
        // نمایش پیام موفقیت/خطا
        function showSuccessMessage(message, isError = false) {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = message;
            messageDiv.style.color = isError ? '#c0392b' : '#27ae60';
            messageDiv.style.marginTop = '1rem';
            messageDiv.style.textAlign = 'center';
            messageDiv.style.animation = 'fadeIn 0.5s ease-out';
            
            const form = document.querySelector('.rsvp-form');
            const oldMessage = form.querySelector('.message');
            if (oldMessage) oldMessage.remove();
            
            form.appendChild(messageDiv);
            messageDiv.classList.add('message');
            
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
        
        // بارگذاری اولیه لیست مهمانان
        async function loadInitialGuestList() {
            try {
                const guests = await fetchGuestList();
                displayGuestList(guests);
            } catch (error) {
                console.error('Error loading initial guest list:', error);
                const guestList = document.getElementById('guest-list');
                guestList.innerHTML = '<div class="guest-item" style="justify-content: center;">خطا در بارگذاری لیست مهمانان</div>';
            }
        }
        
        // اجرای اولیه
        document.addEventListener('DOMContentLoaded', loadInitialGuestList);