// DOM references
const carousel = document.getElementById('carousel');
const track = document.getElementById('track');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

// Lightbox references
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbClose = document.querySelector('.lb-close');
const lbPrev = document.getElementById('prevBtn');
const lbNext = document.getElementById('nextBtn');

// Raw cards present in DOM (will be re-grouped into columns)
let rawCards = Array.from(track.querySelectorAll('.card'));
let columns = [];
let flattened = []; // Ordered list of cards for lightbox indexing

let currentStart = 0;        // Index of first visible column
let visibleCount = 3;        // Desktop default
let gap = parseInt(getComputedStyle(track).gap) || 14;
const CHUNK = 3; // Number of images per column

// Build carousel columns
function buildColumns() {
  track.innerHTML = '';
  columns = [];
  flattened = rawCards.slice(); // Save order
  
  for (let i = 0; i < rawCards.length; i += CHUNK) {
    const col = document.createElement('div');
    col.className = 'column';
    
    for (let j = i; j < i + CHUNK && j < rawCards.length; j++) {
      col.appendChild(rawCards[j]);
    }
    
    track.appendChild(col);
    columns.push(col);
  }
  
  // Attach click handlers to flattened cards for lightbox
  flattened.forEach((c, idx) => {
    const clone = c.cloneNode(true);
    c.parentNode && c.parentNode.replaceChild(clone, c);
    flattened[idx] = clone;
  });
  
  rawCards = flattened.slice();
  rawCards.forEach((c, idx) => {
    c.addEventListener('click', (e) => {
      const anchor = c.querySelector('a.card-link');
      if (e.target.closest('a.card-link')) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        openLightbox(idx);
      } else {
        openLightbox(idx);
      }
    });
  });
}

// Update visible columns count based on screen size
function updateVisibleCount() {
  const w = window.innerWidth;
  if (w <= 520) visibleCount = 1;
  else if (w <= 980) visibleCount = 2;
  else visibleCount = 3;
}

// Update carousel layout
function updateLayout() {
  updateVisibleCount();
  gap = parseInt(getComputedStyle(track).gap) || 14;
  
  if (columns.length === 0) return;
  
  const available = Math.max(0, carousel.clientWidth);
  const colWidth = Math.floor((available - gap * (visibleCount - 1)) / visibleCount);
  
  columns.forEach(c => {
    c.style.flex = `0 0 ${colWidth}px`;
  });
  
  const maxStart = Math.max(0, columns.length - visibleCount);
  if (currentStart > maxStart) currentStart = maxStart;
  
  const translate = -(colWidth + gap) * currentStart;
  track.style.transform = `translateX(${translate}px)`;
  
  // Navigation visibility
  if (columns.length <= visibleCount) {
    prev.setAttribute('hidden', '');
    next.setAttribute('hidden', '');
  } else {
    prev.removeAttribute('hidden');
    next.removeAttribute('hidden');
  }
  
  prev.disabled = currentStart === 0;
  next.disabled = currentStart >= maxStart;
}

// Navigation handlers
prev.addEventListener('click', () => {
  if (currentStart <= 0) return;
  currentStart = Math.max(0, currentStart - 1);
  updateLayout();
});

next.addEventListener('click', () => {
  const maxStart = Math.max(0, columns.length - visibleCount);
  if (currentStart >= maxStart) return;
  currentStart = Math.min(maxStart, currentStart + 1);
  updateLayout();
});

// Lightbox functions
let lbCurrentIndex = -1;

function openLightbox(index) {
  const c = flattened[index];
  if (!c) return;
  
  lbImg.src = c.getAttribute('data-img') || c.querySelector('img')?.src;
  lbImg.alt = c.querySelector('img')?.alt || 'Photo';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  lbCurrentIndex = index;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
  lbCurrentIndex = -1;
}

function lbShowPrev() { 
  if (lbCurrentIndex > 0) openLightbox(lbCurrentIndex - 1); 
}

function lbShowNext() { 
  if (lbCurrentIndex < flattened.length - 1) openLightbox(lbCurrentIndex + 1); 
}

// Lightbox event listeners
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target === lbClose) closeLightbox();
});

lbPrev.addEventListener('click', (e) => { 
  e.stopPropagation(); 
  lbShowPrev(); 
});

lbNext.addEventListener('click', (e) => { 
  e.stopPropagation(); 
  lbShowNext(); 
});

lbClose.addEventListener('click', (e) => { 
  e.stopPropagation(); 
  closeLightbox(); 
});

document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbShowPrev();
    if (e.key === 'ArrowRight') lbShowNext();
  }
});

// Responsive resize handling (debounced)
window.addEventListener('resize', () => {
  clearTimeout(window._carouselResizeTimer);
  window._carouselResizeTimer = setTimeout(updateLayout, 80);
});

// Initialize carousel
window.addEventListener('load', () => {
  rawCards = Array.from(document.querySelectorAll('#track .card'));
  buildColumns();
  columns = Array.from(track.querySelectorAll('.column'));
  flattened = Array.from(document.querySelectorAll('.column .card'));
  updateLayout();
  
  setTimeout(() => {
    document.querySelector('.hero-section').classList.add('visible');
  }, 300);
});

setTimeout(() => { 
  if (columns.length === 0) {
    rawCards = Array.from(document.querySelectorAll('#track .card'));
    buildColumns();
    columns = Array.from(track.querySelectorAll('.column'));
    flattened = Array.from(document.querySelectorAll('.column .card'));
  }
  updateLayout(); 
}, 70);

// Contact form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  
  alert(`Terima kasih ${name}! Pesan Anda telah terkirim. Kami akan menghubungi Anda di ${email} segera.`);
  contactForm.reset();
});

// Animation on scroll
function animateOnScroll() {
  const elements = document.querySelectorAll('.about, .about-card, #portfolio, .social-section, .contact-section, .contact-item, .form-group, .submit-btn, footer, .social-icon, .card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1
  });
  
  elements.forEach(element => {
    observer.observe(element);
  });
}

// Initialize animations
window.addEventListener('load', () => {
  animateOnScroll();
  
  setTimeout(() => {
    document.querySelector('.hero-section').classList.add('visible');
  }, 300);
  
  // Staggered animations
  document.querySelectorAll('.card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });
  
  document.querySelectorAll('.social-icon').forEach((icon, index) => {
    icon.style.transitionDelay = `${index * 0.15}s`;
  });
  
  document.querySelectorAll('.contact-item').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
  });
  
  document.querySelectorAll('.form-group').forEach((group, index) => {
    group.style.transitionDelay = `${index * 0.15}s`;
  });
  
  // Initialize video background
  const video = document.getElementById('video-background');
  video.playbackRate = 0.8;
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

