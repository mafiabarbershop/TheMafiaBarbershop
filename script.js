let menuOpen = false;
  function toggleMenu() {
    menuOpen = !menuOpen;
    document.getElementById('mobile-menu').classList.toggle('open', menuOpen);
    document.getElementById('ham1').style.transform = menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    document.getElementById('ham2').style.opacity = menuOpen ? '0' : '1';
    document.getElementById('ham3').style.transform = menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
    document.getElementById('ham3').style.width = menuOpen ? '1.5rem' : '1rem';
  }
  function closeMenu() {
    menuOpen = false;
    document.getElementById('mobile-menu').classList.remove('open');
    document.getElementById('ham1').style.transform = '';
    document.getElementById('ham2').style.opacity = '1';
    document.getElementById('ham3').style.transform = '';
    document.getElementById('ham3').style.width = '1rem';
  }

// Show/hide scroll-to-top
const fabTop = document.getElementById('fab-top');
const fabWa = document.querySelector('.fab-wa');
window.addEventListener('scroll', () => {
  const shouldShow = window.scrollY > window.innerHeight;
  fabTop.classList.toggle('show', shouldShow);
  if (fabWa) fabWa.classList.toggle('scroll-up', shouldShow);
});

// DATA BARBER (untuk dropdown form booking)
const barbers = [
  // OUTLET #1 - LIDAH KULON
  { nama: "Afif", outlet: "Lidah Kulon"},
  { nama: "Fauzan", outlet: "Lidah Kulon"},
  { nama: "Wandi", outlet: "Lidah Kulon"},
  // OUTLET #2 - MERR
  { nama: "Lucky", outlet: "MERR"},
  { nama: "Robi", outlet: "MERR"},
  { nama: "Kevin", outlet: "MERR"}
];

function updateBarberSelect() {
  const outletSelect = document.getElementById('b-outlet');
  const barberSelect = document.getElementById('b-barber');
  const selectedOutlet = outletSelect.value;
  const filterTarget = selectedOutlet === "" ? "Lidah Kulon" : selectedOutlet;
  barberSelect.innerHTML = '<option value="">-- Pilih Barber --</option>';
  barbers.filter(b => b.outlet === filterTarget).forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.nama;
    opt.textContent = `${b.nama}`;
    barberSelect.appendChild(opt);
  });
}

// INIT & EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  // Set default outlet & isi dropdown barber
  document.getElementById('b-outlet').value = "Lidah Kulon";
  updateBarberSelect();
  document.getElementById('b-outlet').addEventListener('change', updateBarberSelect);

  // Toggle Services
// Toggle Services
const toggleBtn = document.getElementById('toggleBtn');
let servicesVisible = false;

toggleBtn.addEventListener('click', () => {
    const hiddenServices = document.querySelectorAll('.hidden-service');
    servicesVisible = !servicesVisible;

    hiddenServices.forEach((item, index) => {
        if(servicesVisible) {
            item.style.display = 'block';
            setTimeout(() => item.classList.add('show'), index * 50);
        } else {
            item.classList.remove('show');
            setTimeout(() => item.style.display = 'none', 500);
        }
    });

    document.getElementById('toggleText').textContent =
        servicesVisible ? "Tampilkan Lebih Sedikit" : "Lihat Lebih Banyak";

    document.getElementById('toggleIcon').style.transform =
        servicesVisible ? "rotate(180deg)" : "rotate(0deg)";

    // ✅ TAMBAHAN PENTING
    if (!servicesVisible) {
        document.getElementById('layanan').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
});

  // Min Date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('b-tanggal').min = today;
});

// 5. NAVBAR SCROLL & MENU
window.addEventListener('scroll', () => {
  const isScrolled = window.scrollY > 60;
  document.getElementById('navbar').classList.toggle('scrolled', isScrolled);
  document.body.classList.toggle('scrolled', isScrolled);
});



// 6. FORM HANDLER
function handleBooking(e) {
  e.preventDefault();
  const data = {
      nama: document.getElementById('b-nama').value,
      outlet: document.getElementById('b-outlet').value,
      barber: document.getElementById('b-barber').value,
      layanan: document.getElementById('b-layanan').value,
      tanggal: document.getElementById('b-tanggal').value,
      jam: document.getElementById('b-jam').value,
      catatan: document.getElementById('b-catatan').value
  };

  // Format tanggal jadi lebih readable: 2026-04-10 → 10 April 2026
  const tgl = new Date(data.tanggal);
  const hariList = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const bulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tanggalFormatted = `${hariList[tgl.getDay()]}, ${tgl.getDate()} ${bulanList[tgl.getMonth()]} ${tgl.getFullYear()}`;

  let waAdmin = "6281232331581"; // Nomor Pusat Baru
  const catatanLine = data.catatan ? `\n📝 Catatan    : ${data.catatan}` : '';

  const text =
`💈 *BOOKING RESERVASI*
━━━━━━━━━━━━━━━━━━━━
👤 Nama      : ${data.nama}
📍 Outlet    : ${data.outlet}
💇 Barber    : ${data.barber}
✂️ Layanan   : ${data.layanan}
📅 Tanggal   : ${tanggalFormatted}
⏰ Jam       : ${data.jam} WIB${catatanLine}
━━━━━━━━━━━━━━━━━━━━
Mohon konfirmasi ketersediaan slot. Terima kasih! 🙏`;

  document.getElementById('booking-success').classList.remove('hidden');
  setTimeout(() => {
      window.open(`https://wa.me/${waAdmin}?text=${encodeURIComponent(text)}`, '_blank');
      e.target.reset();
      updateBarberSelect();
      document.getElementById('booking-success').classList.add('hidden');
  }, 1000);
}

// FIX 1: IntersectionObserver untuk animasi .reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── COUNT-UP ANIMATION ──
function animateCountUp(el) {
  const raw = el.getAttribute('data-count');
  const suffix = el.getAttribute('data-suffix') || '';
  const prefix = el.getAttribute('data-prefix') || '';
  const target = parseFloat(raw);
  const isFloat = raw.includes('.');

  // Durasi proporsional dengan angka (log scale):
  // angka kecil (2, 5) = ~600ms, angka besar (500, 1000) = ~3000ms
  const minDuration = 600;
  const maxDuration = 3000;
  const scale = Math.log10(target + 1) / Math.log10(1000);
  const duration = Math.min(maxDuration, Math.max(minDuration, scale * maxDuration));

  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = target * ease;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      entry.target.classList.add('counted');
      animateCountUp(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  let barClosed = false;
  const annBar = document.getElementById('announcement-bar');
  const navbar = document.getElementById('navbar');
  function getBarH() { return (!annBar || barClosed) ? 0 : annBar.offsetHeight; }
  function initBarPosition() { if (navbar) navbar.style.top = getBarH() + 'px'; }
  if (annBar) {
    initBarPosition();
    window.addEventListener('resize', () => { if (!barClosed) initBarPosition(); });
    window.addEventListener('scroll', () => {
      if (barClosed) return;
      const barH = getBarH(), sc = window.scrollY;
      if (sc >= barH) { annBar.style.transform = 'translateY(-'+barH+'px)'; if (navbar) navbar.style.top = '0px'; }
      else { annBar.style.transform = 'translateY(-'+sc+'px)'; if (navbar) navbar.style.top = (barH-sc)+'px'; }
    }, {passive:true});
  } else {
    if (navbar) navbar.style.top = '0px';
  }
  function closeAnnouncementBar() {
    if (!annBar) return;
    const barH = getBarH(); barClosed = true;
    annBar.style.transform = 'translateY(-'+barH+'px)'; if (navbar) navbar.style.top = '0px';
  }

  // Gallery Lightbox
  const lbImages = [
    {src:'images/merchandise.webp',title:'Merchandises'},
    {src:'images/waitingroom.webp',title:'Waiting Room'},
    {src:'images/washbak.webp',title:'Washbak'},
    {src:'images/cashier.webp',title:'Cashier'},
    {src:'images/outlet_lidah2.webp',title:'Outlet Lidah Kulon'},
    {src:'images/undercut.webp',title:'Undercut'},
    {src:'images/frontyard.webp',title:'Front Yard'},
    {src:'images/outlet_mer.webp',title:'Outlet MERR'}
  ];
  let lbIndex = 0;
  
  function buildLbDots() {
    const dotsEl = document.getElementById('lightbox-dots'); dotsEl.innerHTML = '';
    lbImages.forEach((_,i) => { const d = document.createElement('button'); d.className='lb-dot'+(i===lbIndex?' active':''); d.onclick=(e)=>{e.stopPropagation();lbGoTo(i);}; dotsEl.appendChild(d); });
  }
  function lbGoTo(n) {
    lbIndex=(n+lbImages.length)%lbImages.length;
    const img=document.getElementById('lightbox-img'); img.classList.add('transitioning');
    setTimeout(()=>{img.src=lbImages[lbIndex].src;document.getElementById('lightbox-title').textContent=lbImages[lbIndex].title;img.classList.remove('transitioning');},220);
    buildLbDots();
  }
  function lbSlide(dir){lbGoTo(lbIndex+dir);}
  function openLightbox(index) {
    lbIndex=index; const lb=document.getElementById('gallery-lightbox'); const img=document.getElementById('lightbox-img');
    img.src=lbImages[lbIndex].src; document.getElementById('lightbox-title').textContent=lbImages[lbIndex].title;
    buildLbDots(); lb.classList.add('active'); document.body.style.overflow='hidden';
  }
  function closeLightbox(){document.getElementById('gallery-lightbox').classList.remove('active');document.body.style.overflow='';}
  function handleLightboxClick(e){if(e.target===document.getElementById('gallery-lightbox'))closeLightbox();}
  document.addEventListener('keydown',(e)=>{const lb=document.getElementById('gallery-lightbox');if(!lb.classList.contains('active'))return;if(e.key==='ArrowLeft')lbSlide(-1);if(e.key==='ArrowRight')lbSlide(1);if(e.key==='Escape')closeLightbox();});
  let lbTouchStartX=0;
  document.getElementById('gallery-lightbox').addEventListener('touchstart',(e)=>{lbTouchStartX=e.touches[0].clientX;},{passive:true});
  document.getElementById('gallery-lightbox').addEventListener('touchend',(e)=>{const diff=lbTouchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>50)lbSlide(diff>0?1:-1);},{passive:true});

  // Modern Parallax Effect
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.parallax').forEach(el => {
      const speed = el.getAttribute('data-speed') || 0.05;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });

  // ── CUSTOM CURSOR LOGIC ──
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (cursor && follower) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      // Smooth movement for follower
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;

      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effect
    const hoverables = document.querySelectorAll('a, button, .service-card, .gallery-item, .outlet-card, .lb-dot, .reveal');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ── MAGNETIC BUTTONS ──
  const magnets = document.querySelectorAll('.btn-primary, .btn-outline, .toggle-btn');
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // ── CUSTOM REVIEWS LOGIC ──
  const reviewsData = [
    {
      name: "Gitta Asmara",
      time: "3 days ago",
      rating: 5,
      content: "Potongannya keren, tempatnya juga cozy banget. Pelayanan ramah dan profesional. Sangat recommended buat yang cari gaya rambut baru!",
      verified: true
    },
    {
      name: "Andrian Firmansyah",
      time: "3 days ago",
      rating: 5,
      content: "Asli keren banget hasilnya🙌 Stafnya ngerti banget apa yang kita mau. Gak nyesel langganan di sini terus.",
      verified: true
    },
    {
      name: "Patrick Gregorius Jimant...",
      time: "3 days ago",
      rating: 5,
      content: "Tempatnya bagus dan nyaman... Pelayanannya juga bagus. Barbernya sabar dan teliti banget pas ngerjain rambut.",
      verified: true
    },
    {
      name: "joko hariyanto",
      time: "4 days ago",
      rating: 5,
      content: "Mantab, rapi, cekatan, cocok lah ini buat langganan. Harga juga sebanding sama kualitas yang didapet.",
      verified: true
    },
    {
      name: "Rizky Ramadhani",
      time: "1 week ago",
      rating: 5,
      content: "Pilihan terbaik di Surabaya. Suasananya dapet banget, berasa masuk ke basecamp mafia tapi dilayani dengan sangat baik.",
      verified: true
    },
    {
      name: "Budi Santoso",
      time: "2 weeks ago",
      rating: 4,
      content: "Potongan rapi, barber ramah. Cuma tadi agak antre dikit pas weekend, mending booking dulu lewat aplikasi biar enak.",
      verified: true
    }
  ];

  function renderReviews() {
    const reviewsDisplay = document.getElementById('reviews-display');
    if (!reviewsDisplay) return;

    reviewsDisplay.innerHTML = ''; // Clear loading spinner

    reviewsData.forEach((review, index) => {
      const card = document.createElement('div');
      card.className = 'review-item-card reveal';
      card.style.transitionDelay = `${(index % 3) * 0.1}s`;

      const initials = review.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      const starsHTML = Array(5).fill(0).map((_, i) => 
        `<span class="star">${i < review.rating ? '★' : '☆'}</span>`
      ).join('');

      card.innerHTML = `
        <div class="review-user-info">
          <div class="user-avatar" style="background: ${getRandomColor()}">
            ${initials}
          </div>
          <div class="user-details">
            <div class="user-name-row">
              <span class="user-name">${review.name}</span>
              ${review.verified ? `
                <svg class="verified-badge" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              ` : ''}
            </div>
            <div class="review-meta">${review.time}</div>
          </div>
        </div>
        <div class="review-stars">
          ${starsHTML}
        </div>
        <div class="review-content" id="review-content-${index}">
          ${review.content}
        </div>
        ${review.content.length > 100 ? `<button class="read-more-btn" onclick="toggleReadMore(${index})">Read more</button>` : ''}
      `;

      reviewsDisplay.appendChild(card);
      // Re-observe the new element for animations
      if (typeof observer !== 'undefined') observer.observe(card);
    });
  }

  function getRandomColor() {
    const colors = ['#e11d48', '#c9a84c', '#4285F4', '#34A853', '#6200ea', '#d81b60'];
    return colors[Math.floor(Math.random() * colors.length)] + '40'; // 25% opacity
  }

  function toggleReadMore(index) {
    const content = document.getElementById(`review-content-${index}`);
    const btn = content.nextElementSibling;
    if (content.classList.toggle('expanded')) {
      btn.textContent = 'Read less';
    } else {
      btn.textContent = 'Read more';
    }
  }

  // Initialize reviews on load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderReviews, 800); // Simulate network delay
  });
