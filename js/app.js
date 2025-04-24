// تاریخ عروسی: ۶ شهریور ۱۴۰۴ (۲۸ آگوست ۲۰۲۵)

const weddingDate = new Date('2025-08-28T00:00:00');

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

// مدیریت فرم نظر سنجی
document.getElementById('submit-rsvp').addEventListener('click', function() {
    const name = document.getElementById('guest-name').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const guestCount = document.getElementById('guest-count').value;
    const data = {
      name:name,
      No:guestCount,
      add: attendance
    }
    console.log(guestCount , name , attendance)
    if (!name) {
        alert('لطفاً نام خود را وارد کنید');
        return;
    }
      

      fetch("https://66f535759aa4891f2a2451d7.mockapi.io/user" ,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          
        },
        method: "POST",
        body: JSON.stringify(data)
      })
      .then(function(res){ console.log(res) })
      .catch(function(res){ console.log(res) })
    
      
    const guestList = document.getElementById('guest-list');
    const guestItem = document.createElement('div');
    guestItem.classList.add('guest-item');
    
    const guestName = document.createElement('span');
    guestName.classList.add('guest-name');
      guestName.textContent = name;
      
      const guestStatus = document.createElement('span');
      guestStatus.classList.add('guest-status');
      
      if (attendance === 'coming') {
          guestStatus.classList.add('status-coming');
          guestStatus.textContent = guestCount > 0 ? `حضور دارد (${guestCount} همراه)` : 'حضور دارد';
        } else {
            guestStatus.classList.add('status-not-coming');
            guestStatus.textContent = 'عدم حضور';
        }
       
        // پاک کردن فرم
        document.getElementById('guest-name').value = '';
        document.getElementById('coming').checked = true;
        document.getElementById('guest-count').value = '0';
        
        // نمایش پیام موفقیت
        const successMsg = document.createElement('div');
        successMsg.textContent = 'پاسخ شما ثبت شد!';
      successMsg.style.color = '#27ae60';
      successMsg.style.marginTop = '1rem';
      successMsg.style.textAlign = 'center';
      successMsg.style.animation = 'fadeIn 0.5s ease-out';
      
      const form = document.querySelector('.rsvp-form');
      form.appendChild(successMsg);
      
      setTimeout(() => {
          successMsg.remove();
        }, 3000);
    });
