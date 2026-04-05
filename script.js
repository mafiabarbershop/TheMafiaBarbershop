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
  { nama: "Shandy", outlet: "Lidah Kulon"},
  { nama: "Fauzan", outlet: "Lidah Kulon"},
  { nama: "Kevin", outlet: "Lidah Kulon"},
  // OUTLET #2 - MERR
  { nama: "Lucky", outlet: "MERR"},
  { nama: "Robin", outlet: "MERR"},
  { nama: "Dani", outlet: "MERR"}
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
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
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

  let waAdmin = data.outlet === "MERR" ? "6285385858626" : "6282225328882";
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
}, { threshold: 0.1 });

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
    {src:'images/merchandise.jpg',title:'Merchandises'},
    {src:'images/waitingroom.jpg',title:'Waiting Room'},
    {src:'images/washbak.jpg',title:'Washbak'},
    {src:'images/cashier.jpg',title:'Cashier'},
    {src:'images/outlet_lidah2.jpg',title:'Outlet Lidah Kulon'},
    {src:'images/undercut.jpg',title:'Undercut'},
    {src:'images/frontyard.jpg',title:'Front Yard'},
    {src:'images/outlet_mer.jpg',title:'Outlet MERR'}
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