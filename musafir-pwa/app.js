/* ============================================================
   Musafir — Pakistan Travel Planner  |  app.js
   Vanilla JS, no frameworks, production-quality PWA
   ============================================================ */

'use strict';

// ── Data ─────────────────────────────────────────────────────────────────────

const DESTINATIONS = [
  // Mountains / Trekking
  { id: 'hunza', name: 'Hunza Valley', urdu: 'ہنزہ', province: 'Gilgit-Baltistan', categories: ['mountains','trekking','photography'], weather: 'snow', rating: 4.9, emoji: '🏔️', gradient: 'linear-gradient(135deg, #2F4F4F 0%, #4A7C59 50%, #87CEEB 100%)' },
  { id: 'skardu', name: 'Skardu', urdu: 'اسکردو', province: 'Gilgit-Baltistan', categories: ['mountains','trekking','adventure'], weather: 'clear', rating: 4.8, emoji: '⛰️', gradient: 'linear-gradient(135deg, #1a3a4a 0%, #2F6F8F 50%, #87CEEB 100%)' },
  { id: 'fairy-meadows', name: 'Fairy Meadows', urdu: 'پری گھاٹی', province: 'Gilgit-Baltistan', categories: ['mountains','trekking','wildlife'], weather: 'clear', rating: 4.9, emoji: '🌿', gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #81C784 100%)' },
  { id: 'swat', name: 'Swat Valley', urdu: 'سوات', province: 'KPK', categories: ['mountains','heritage','trekking'], weather: 'clear', rating: 4.7, emoji: '🌲', gradient: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 50%, #A5D6A7 100%)' },
  { id: 'chitral', name: 'Chitral', urdu: 'چترال', province: 'KPK', categories: ['mountains','wildlife','heritage'], weather: 'snow', rating: 4.6, emoji: '🦅', gradient: 'linear-gradient(135deg, #37474F 0%, #546E7A 50%, #B0BEC5 100%)' },
  { id: 'nathia-gali', name: 'Nathia Gali', urdu: 'ناتھیا گلی', province: 'KPK', categories: ['mountains','photography'], weather: 'clear', rating: 4.5, emoji: '🌄', gradient: 'linear-gradient(135deg, #2E7D32 0%, #43A047 50%, #C8E6C9 100%)' },
  { id: 'gilgit', name: 'Gilgit', urdu: 'گلگت', province: 'Gilgit-Baltistan', categories: ['mountains','heritage','trekking'], weather: 'clear', rating: 4.6, emoji: '🏞️', gradient: 'linear-gradient(135deg, #4E342E 0%, #795548 50%, #D7CCC8 100%)' },
  { id: 'naltar', name: 'Naltar Valley', urdu: 'نالتر', province: 'Gilgit-Baltistan', categories: ['mountains','photography'], weather: 'snow', rating: 4.7, emoji: '🎿', gradient: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #90CAF9 100%)' },

  // Coastal / Beaches
  { id: 'karachi', name: 'Karachi', urdu: 'کراچی', province: 'Sindh', categories: ['coastal','food','heritage'], weather: 'hot', rating: 4.3, emoji: '🌊', gradient: 'linear-gradient(135deg, #01579B 0%, #0288D1 50%, #80DEEA 100%)' },
  { id: 'gwadar', name: 'Gwadar', urdu: 'گوادر', province: 'Balochistan', categories: ['coastal','photography'], weather: 'hot', rating: 4.5, emoji: '🏖️', gradient: 'linear-gradient(135deg, #00838F 0%, #00ACC1 50%, #80DEEA 100%)' },
  { id: 'ormara', name: 'Ormara', urdu: 'اورماڑہ', province: 'Balochistan', categories: ['coastal','photography'], weather: 'clear', rating: 4.4, emoji: '🐠', gradient: 'linear-gradient(135deg, #004D40 0%, #00695C 50%, #80CBC4 100%)' },

  // Heritage / History
  { id: 'lahore', name: 'Lahore', urdu: 'لاہور', province: 'Punjab', categories: ['heritage','food','spiritual','art'], weather: 'hot', rating: 4.8, emoji: '🕌', gradient: 'linear-gradient(135deg, #B71C1C 0%, #C62828 50%, #EF9A9A 100%)' },
  { id: 'mohenjo-daro', name: 'Mohenjo-daro', urdu: 'موہن جو دڑو', province: 'Sindh', categories: ['heritage','photography'], weather: 'landslide', rating: 4.6, emoji: '🏛️', gradient: 'linear-gradient(135deg, #E65100 0%, #EF6C00 50%, #FFCC80 100%)' },
  { id: 'taxila', name: 'Taxila', urdu: 'تکسلا', province: 'Punjab', categories: ['heritage'], weather: 'clear', rating: 4.5, emoji: '🗿', gradient: 'linear-gradient(135deg, #4E342E 0%, #6D4C41 50%, #D7CCC8 100%)' },
  { id: 'multan', name: 'Multan', urdu: 'ملتان', province: 'Punjab', categories: ['heritage','spiritual','art'], weather: 'hot', rating: 4.4, emoji: '🎨', gradient: 'linear-gradient(135deg, #880E4F 0%, #AD1457 50%, #F48FB1 100%)' },
  { id: 'peshawar', name: 'Peshawar', urdu: 'پشاور', province: 'KPK', categories: ['heritage','food','art'], weather: 'clear', rating: 4.5, emoji: '🫖', gradient: 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 50%, #CE93D8 100%)' },
  { id: 'thatta', name: 'Thatta', urdu: 'ٹھٹہ', province: 'Sindh', categories: ['heritage','spiritual'], weather: 'hot', rating: 4.3, emoji: '🕍', gradient: 'linear-gradient(135deg, #33691E 0%, #558B2F 50%, #C5E1A5 100%)' },

  // Food
  { id: 'islamabad', name: 'Islamabad', urdu: 'اسلام آباد', province: 'ICT', categories: ['food','heritage','trekking'], weather: 'clear', rating: 4.6, emoji: '🌆', gradient: 'linear-gradient(135deg, #006A4E 0%, #00875A 50%, #80CBC4 100%)' },

  // Spiritual
  { id: 'sehwan', name: 'Sehwan Sharif', urdu: 'سیہون شریف', province: 'Sindh', categories: ['spiritual','heritage'], weather: 'hot', rating: 4.5, emoji: '✨', gradient: 'linear-gradient(135deg, #F57F17 0%, #F9A825 50%, #FFF59D 100%)' },

  // Wildlife / Nature
  { id: 'deosai', name: 'Deosai Plains', urdu: 'دیوسائی', province: 'Gilgit-Baltistan', categories: ['wildlife','photography','trekking'], weather: 'snow', rating: 4.8, emoji: '🐻', gradient: 'linear-gradient(135deg, #1B5E20 0%, #33691E 50%, #F9A825 100%)' },
  { id: 'haleji', name: 'Haleji Lake', urdu: 'ہالیجی جھیل', province: 'Sindh', categories: ['wildlife','photography'], weather: 'hot', rating: 4.2, emoji: '🦩', gradient: 'linear-gradient(135deg, #006064 0%, #00838F 50%, #80DEEA 100%)' },

  // Desert
  { id: 'thar', name: 'Thar Desert', urdu: 'تھر', province: 'Sindh', categories: ['adventure','photography','art'], weather: 'hot', rating: 4.4, emoji: '🐪', gradient: 'linear-gradient(135deg, #F57F17 0%, #FF8F00 50%, #FFE082 100%)' },
  { id: 'quetta', name: 'Quetta', urdu: 'کوئٹہ', province: 'Balochistan', categories: ['mountains','food','heritage'], weather: 'clear', rating: 4.3, emoji: '🍑', gradient: 'linear-gradient(135deg, #4E342E 0%, #5D4037 50%, #D7CCC8 100%)' },
];

const CATEGORIES = [
  { id: 'mountains',   label: 'Mountains',        urdu: 'پہاڑ',       icon: '🏔️' },
  { id: 'trekking',   label: 'Trekking',          urdu: 'ٹریکنگ',    icon: '🥾' },
  { id: 'coastal',    label: 'Coastal & Beaches', urdu: 'ساحل',       icon: '🏖️' },
  { id: 'heritage',   label: 'Heritage',          urdu: 'ورثہ',       icon: '🏛️' },
  { id: 'food',       label: 'Food & Cuisine',    urdu: 'کھانا',      icon: '🍛' },
  { id: 'spiritual',  label: 'Spiritual',         urdu: 'روحانی',     icon: '🕌' },
  { id: 'wildlife',   label: 'Wildlife',          urdu: 'جنگلی',      icon: '🦅' },
  { id: 'photography',label: 'Photography',       urdu: 'فوٹوگرافی', icon: '📷' },
  { id: 'adventure',  label: 'Adventure',         urdu: 'ایڈونچر',   icon: '🎒' },
  { id: 'art',        label: 'Art & Crafts',      urdu: 'فنون',       icon: '🎨' },
];

const TRANSPORT = [
  { id: 'jeep',     icon: '🚙', label: 'Jeep 4x4',        urdu: 'جیپ'   },
  { id: 'bus',      icon: '🚌', label: 'Luxury Bus',       urdu: 'بس'    },
  { id: 'rickshaw', icon: '🛺', label: 'Rickshaw',         urdu: 'رکشہ'  },
  { id: 'flight',   icon: '✈️', label: 'Domestic Flight', urdu: 'پرواز' },
  { id: 'train',    icon: '🚂', label: 'Train',            urdu: 'ٹرین'  },
  { id: 'guide',    icon: '🧭', label: 'Local Guide',      urdu: 'گائیڈ' },
];

const HUNZA_ITINERARY = [
  {
    day: 1, title: 'Islamabad Arrival', urdu: 'اسلام آباد آمد',
    location: 'Islamabad, ICT',
    alert: null,
    activities: {
      morning:   [{ name: 'Arrive at Islamabad Airport', icon: '✈️', location: 'Islamabad International Airport', duration: '2h', category: 'Transport', color: '#E3F2FD' }],
      afternoon: [{ name: 'Faisal Mosque Visit', icon: '🕌', location: 'Islamabad', duration: '1.5h', category: 'Heritage', color: '#E8F5E9' }, { name: 'Daman-e-Koh Viewpoint', icon: '🌄', location: 'Margalla Hills', duration: '2h', category: 'Photography', color: '#FFF3E0' }],
      evening:   [{ name: 'Dinner at F-7 Markaz', icon: '🍛', location: 'F-7, Islamabad', duration: '2h', category: 'Food', color: '#FCE4EC' }]
    }
  },
  {
    day: 2, title: 'Drive via KKH', urdu: 'شاہراہ قراقرم سفر',
    location: 'Islamabad → Besham',
    alert: { type: 'warning', text: '⚠️ KKH Road: Check conditions at Thakot' },
    activities: {
      morning:   [{ name: 'Early departure on KKH', icon: '🚙', location: 'Islamabad → Attock', duration: '3h', category: 'Transport', color: '#E3F2FD' }],
      afternoon: [{ name: 'Thakot Bridge Stop', icon: '🌉', location: 'Thakot, KPK', duration: '30m', category: 'Photography', color: '#FFF3E0' }, { name: 'Continue to Besham', icon: '🚙', location: 'Thakot → Besham', duration: '2h', category: 'Transport', color: '#E3F2FD' }],
      evening:   [{ name: 'Hotel Check-in & Rest', icon: '🏨', location: 'Besham', duration: '1h', category: 'Rest', color: '#F3E5F5' }, { name: 'Local Chapli Kebab Dinner', icon: '🥩', location: 'Besham Bazaar', duration: '1h', category: 'Food', color: '#FCE4EC' }]
    }
  },
  {
    day: 3, title: 'Gilgit City', urdu: 'گلگت شہر',
    location: 'Besham → Gilgit',
    alert: { type: 'info', text: '✅ Road open — Gilgit reachable via Sazin' },
    activities: {
      morning:   [{ name: 'Drive Besham → Gilgit', icon: '🚙', location: 'KKH Mountain Road', duration: '5h', category: 'Transport', color: '#E3F2FD' }],
      afternoon: [{ name: 'Kargah Buddha Rock Carving', icon: '🗿', location: '10km west of Gilgit', duration: '1.5h', category: 'Heritage', color: '#E8F5E9' }, { name: 'Gilgit Bazaar', icon: '🛍️', location: 'Main Bazaar, Gilgit', duration: '1.5h', category: 'Shopping', color: '#FFF8E1' }],
      evening:   [{ name: 'Sunset at Gilgit River', icon: '🌅', location: 'Gilgit River Banks', duration: '1h', category: 'Photography', color: '#FFF3E0' }, { name: 'Chapshuro Bread Dinner', icon: '🫓', location: 'Local Dhaba, Gilgit', duration: '1h', category: 'Food', color: '#FCE4EC' }]
    }
  },
  {
    day: 4, title: 'Hunza Valley Highlights', urdu: 'ہنزہ وادی',
    location: 'Gilgit → Karimabad, Hunza',
    alert: { type: 'snow', text: '❄️ Snow possible above 3000m tonight' },
    activities: {
      morning:   [{ name: 'Drive to Karimabad', icon: '🚙', location: 'Gilgit → Karimabad', duration: '2h', category: 'Transport', color: '#E3F2FD' }, { name: 'Baltit Fort', icon: '🏰', location: 'Karimabad, Hunza', duration: '2h', category: 'Heritage', color: '#E8F5E9' }],
      afternoon: [{ name: 'Attabad Lake Boat Ride', icon: '⛵', location: 'Attabad Lake', duration: '2h', category: 'Adventure', color: '#E3F2FD' }, { name: 'Altit Fort', icon: '🏯', location: 'Altit Village', duration: '1.5h', category: 'Heritage', color: '#E8F5E9' }],
      evening:   [{ name: "Eagle's Nest Sunset", icon: '🦅', location: 'Duikar, 3100m', duration: '2h', category: 'Photography', color: '#FFF3E0' }, { name: 'Hunza Apricot Chicken Dinner', icon: '🍑', location: 'Karimabad', duration: '1h', category: 'Food', color: '#FCE4EC' }]
    }
  },
  {
    day: 5, title: 'Rakaposhi & Passu', urdu: 'راکاپوشی و پاسو',
    location: 'Hunza Valley Exploration',
    alert: null,
    activities: {
      morning:   [{ name: 'Rakaposhi Base View Point', icon: '🏔️', location: 'Minapin, Nagar', duration: '3h', category: 'Photography', color: '#FFF3E0' }],
      afternoon: [{ name: 'Passu Cones Photo Stop', icon: '📷', location: 'Passu, Upper Hunza', duration: '2h', category: 'Photography', color: '#FFF3E0' }, { name: 'Hussaini Suspension Bridge', icon: '🌉', location: 'Hussaini Village', duration: '1h', category: 'Adventure', color: '#FCE4EC' }],
      evening:   [{ name: 'Sost Dry Fruit Market', icon: '🌰', location: 'Sost Bazaar', duration: '1h', category: 'Shopping', color: '#FFF8E1' }, { name: 'Local Diram & Mamtu Dinner', icon: '🥟', location: 'Hunza Restaurant', duration: '1h', category: 'Food', color: '#FCE4EC' }]
    }
  },
  {
    day: 6, title: 'Nagar & Hopar Glacier', urdu: 'ناگر و ہوپر گلیشئر',
    location: 'Nagar Valley, GB',
    alert: { type: 'warning', text: '⚠️ Glacier trail requires guide — hire locally' },
    activities: {
      morning:   [{ name: 'Hopar Glacier Trek', icon: '🧊', location: 'Hopar, Nagar', duration: '4h', category: 'Trekking', color: '#E3F2FD' }],
      afternoon: [{ name: 'Nagar Fort', icon: '🏰', location: 'Nagar Town', duration: '1.5h', category: 'Heritage', color: '#E8F5E9' }, { name: 'Shishper Glacier View', icon: '🏔️', location: 'Hassanabad', duration: '1h', category: 'Photography', color: '#FFF3E0' }],
      evening:   [{ name: 'Rest & Photography', icon: '🌙', location: 'Karimabad', duration: '2h', category: 'Photography', color: '#FFF3E0' }, { name: 'Hunza Tea & Walnuts', icon: '🫖', location: 'Gulmit Café', duration: '1h', category: 'Food', color: '#FCE4EC' }]
    }
  },
  {
    day: 7, title: 'Return to Islamabad', urdu: 'واپسی اسلام آباد',
    location: 'Hunza → Islamabad',
    alert: { type: 'info', text: '✅ Flight ISB→GIL available 07:30' },
    activities: {
      morning:   [{ name: 'Gilgit Airport', icon: '✈️', location: 'Gilgit Airport', duration: '3h', category: 'Transport', color: '#E3F2FD' }],
      afternoon: [{ name: 'Arrive Islamabad', icon: '🌆', location: 'Islamabad', duration: '1h', category: 'Transport', color: '#E3F2FD' }, { name: 'F-6 Super Market Souvenirs', icon: '🛍️', location: 'F-6, Islamabad', duration: '1.5h', category: 'Shopping', color: '#FFF8E1' }],
      evening:   [{ name: 'Farewell Dinner — Monal Restaurant', icon: '🍽️', location: 'Margalla Hills', duration: '2h', category: 'Food', color: '#FCE4EC' }]
    }
  }
];

// ── App State ─────────────────────────────────────────────────────────────────

const state = {
  currentScreen: 'home',
  language: 'en',
  selectedCategories: [],
  selectedDestinations: [],
  tripData: {
    destinations: [],
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 150000,
    interests: [],
    name: ''
  },
  currentDay: 1,
  savedTrips: [],
  apiKey: '',
  chatMessages: [],
  wizardStep: 1,
  activeTransport: null,
  generatedItinerary: null,
};

// PWA install prompt reference
let deferredPrompt = null;

// Leaflet map instance (re-used to avoid double-init)
let survivalMap = null;

// ── Utility ───────────────────────────────────────────────────────────────────

/** Escape HTML to prevent XSS in dynamically built strings */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Format PKR currency */
function formatPKR(amount) {
  if (amount >= 100000) {
    return `PKR ${(amount / 100000).toFixed(1)}L`;
  }
  return `PKR ${amount.toLocaleString()}`;
}

/** Format date for display */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Generate a unique trip id */
function generateId() {
  return 'trip_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

/** Clamp a number between min and max */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Return a label string depending on current language */
function t(en, ur) {
  return state.language === 'ur' ? ur : en;
}

/** Show a transient toast notification */
function showToast(msg, duration = 2800) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:90px', 'left:50%', 'transform:translateX(-50%)',
      'background:#1a1a1a', 'color:#fff', 'padding:10px 20px', 'border-radius:20px',
      'font-size:14px', 'font-weight:500', 'z-index:9999', 'pointer-events:none',
      'opacity:0', 'transition:opacity 0.25s ease', 'max-width:80vw', 'text-align:center'
    ].join(';');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

// ── Service Worker Registration ───────────────────────────────────────────────

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registered, scope:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  }
}

// ── localStorage Persistence ──────────────────────────────────────────────────

function loadSavedTrips() {
  try {
    const raw = localStorage.getItem('musafir_trips');
    state.savedTrips = raw ? JSON.parse(raw) : [];
  } catch {
    state.savedTrips = [];
  }
}

function saveTripToStorage(trip) {
  state.savedTrips.unshift(trip);
  try {
    localStorage.setItem('musafir_trips', JSON.stringify(state.savedTrips));
  } catch (e) {
    console.warn('Could not save trip:', e);
  }
}

function deleteSavedTrip(id) {
  state.savedTrips = state.savedTrips.filter(t => t.id !== id);
  try {
    localStorage.setItem('musafir_trips', JSON.stringify(state.savedTrips));
  } catch (e) {
    console.warn('Could not delete trip:', e);
  }
}

function loadSettings() {
  try {
    const key = localStorage.getItem('musafir_api_key');
    if (key) state.apiKey = key;
    const lang = localStorage.getItem('musafir_language');
    if (lang === 'en' || lang === 'ur') state.language = lang;
  } catch { /* ignore */ }
}

function saveSettings() {
  try {
    localStorage.setItem('musafir_api_key', state.apiKey);
    localStorage.setItem('musafir_language', state.language);
  } catch { /* ignore */ }
}

// ── Screen Management ─────────────────────────────────────────────────────────

function showScreen(name) {
  state.currentScreen = name;

  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
  });

  const target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.add('active');
    target.setAttribute('aria-hidden', 'false');
    target.scrollTop = 0;
  }

  // Update bottom nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    const isActive = btn.dataset.screen === name;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Lazy init screens
  if (name === 'home') renderHome();
  if (name === 'plan') initPlanScreen();
  if (name === 'itinerary') renderItinerary();
  if (name === 'survival') initSurvivalScreen();
  if (name === 'export') initExportScreen();
}

// ── Bottom Navigation ─────────────────────────────────────────────────────────

function initBottomNav() {
  document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      showScreen(screen);
    });
  });
}

// ── Language Toggle ───────────────────────────────────────────────────────────

function setLanguage(lang) {
  state.language = lang;
  saveSettings();

  if (lang === 'ur') {
    document.body.classList.add('urdu-mode');
    document.documentElement.lang = 'ur';
    document.documentElement.dir = 'rtl';
  } else {
    document.body.classList.remove('urdu-mode');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }

  // Update all elements that carry data-en / data-ur
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'ur' ? (el.dataset.ur || el.dataset.en) : el.dataset.en;
  });

  // Re-render active screen
  if (state.currentScreen === 'home') renderHome();
  if (state.currentScreen === 'plan') renderWizardStep(state.wizardStep);
  if (state.currentScreen === 'itinerary') renderItinerary();
}

// ── PWA Install Banner ────────────────────────────────────────────────────────

function initInstallBanner() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    deferredPrompt = null;
    showToast('Musafir installed! Find it on your home screen.');
  });
}

function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.classList.remove('hidden');
    banner.setAttribute('aria-hidden', 'false');
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.classList.add('hidden');
    banner.setAttribute('aria-hidden', 'true');
  }
}

function handleInstallClick() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(result => {
    if (result.outcome === 'accepted') {
      showToast('Installing Musafir…');
    }
    deferredPrompt = null;
    hideInstallBanner();
  });
}

// ── Home Screen ───────────────────────────────────────────────────────────────

function renderHome() {
  renderCategoryChips();
  renderDestinationCards();
  renderTransportRow();
}

function renderCategoryChips() {
  const container = document.getElementById('category-chips');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const active = state.selectedCategories.includes(cat.id);
    return `<button
      class="chip${active ? ' chip--active' : ''}"
      data-category="${esc(cat.id)}"
      aria-pressed="${active}"
      title="${esc(cat.label)}"
    >
      <span class="chip-icon">${cat.icon}</span>
      <span class="chip-label">${esc(t(cat.label, cat.urdu))}</span>
    </button>`;
  }).join('');

  container.querySelectorAll('.chip[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.category;
      const idx = state.selectedCategories.indexOf(id);
      if (idx === -1) {
        state.selectedCategories.push(id);
      } else {
        state.selectedCategories.splice(idx, 1);
      }
      renderHome();
    });
  });
}

function renderDestinationCards() {
  const container = document.getElementById('destination-cards');
  if (!container) return;

  const filtered = state.selectedCategories.length === 0
    ? DESTINATIONS
    : DESTINATIONS.filter(d =>
        d.categories.some(c => state.selectedCategories.includes(c))
      );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🗺️</div>
        <p>${esc(t('No destinations match your filters', 'کوئی منزل نہیں ملی'))}</p>
        <button class="btn btn-outline" id="clear-filters-btn">${esc(t('Clear Filters', 'فلٹر صاف کریں'))}</button>
      </div>`;
    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
      state.selectedCategories = [];
      renderHome();
    });
    return;
  }

  container.innerHTML = filtered.map(dest => `
    <article class="dest-card" data-id="${esc(dest.id)}" role="button" tabindex="0"
      aria-label="${esc(dest.name)}, ${esc(dest.province)}, rated ${dest.rating}">
      <div class="dest-card__hero" style="background:${dest.gradient}">
        <span class="dest-card__emoji" aria-hidden="true">${dest.emoji}</span>
        <span class="dest-card__rating">⭐ ${dest.rating}</span>
        <span class="dest-card__weather dest-card__weather--${esc(dest.weather)}">${weatherIcon(dest.weather)}</span>
      </div>
      <div class="dest-card__body">
        <h3 class="dest-card__name">${esc(state.language === 'ur' ? dest.urdu : dest.name)}</h3>
        <p class="dest-card__province">${esc(dest.province)}</p>
        <div class="dest-card__tags">
          ${dest.categories.slice(0, 3).map(cid => {
            const cat = CATEGORIES.find(c => c.id === cid);
            return cat ? `<span class="tag">${cat.icon} ${esc(t(cat.label, cat.urdu))}</span>` : '';
          }).join('')}
        </div>
        <button class="btn btn-primary btn-sm dest-card__plan-btn" data-id="${esc(dest.id)}">
          ${esc(t('Plan Trip', 'سفر منصوبہ'))}
        </button>
      </div>
    </article>
  `).join('');

  // Destination card clicks — open detail or pre-select for planning
  container.querySelectorAll('.dest-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.dest-card__plan-btn')) return; // handled below
      showDestinationDetail(card.dataset.id);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showDestinationDetail(card.dataset.id);
      }
    });
  });

  container.querySelectorAll('.dest-card__plan-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dest = DESTINATIONS.find(d => d.id === btn.dataset.id);
      if (dest) {
        state.tripData.destinations = [dest.id];
        state.wizardStep = 1;
        showScreen('plan');
      }
    });
  });
}

function weatherIcon(type) {
  const icons = { snow: '❄️', clear: '☀️', hot: '🌡️', landslide: '⚠️', rain: '🌧️' };
  return icons[type] || '🌤️';
}

function renderTransportRow() {
  const container = document.getElementById('transport-row');
  if (!container) return;

  container.innerHTML = TRANSPORT.map(tr => `
    <button class="transport-item${state.activeTransport === tr.id ? ' transport-item--active' : ''}"
      data-transport="${esc(tr.id)}" aria-pressed="${state.activeTransport === tr.id}"
      title="${esc(tr.label)}">
      <span class="transport-icon">${tr.icon}</span>
      <span class="transport-label">${esc(t(tr.label, tr.urdu))}</span>
    </button>
  `).join('');

  container.querySelectorAll('.transport-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.transport;
      state.activeTransport = state.activeTransport === id ? null : id;
      renderTransportRow();
    });
  });
}

function showDestinationDetail(id) {
  const dest = DESTINATIONS.find(d => d.id === id);
  if (!dest) return;

  const modal = document.getElementById('dest-modal');
  const body = document.getElementById('dest-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="dest-modal__hero" style="background:${dest.gradient}">
      <span class="dest-modal__emoji">${dest.emoji}</span>
      <button class="dest-modal__close" id="close-dest-modal" aria-label="Close">✕</button>
    </div>
    <div class="dest-modal__content">
      <h2>${esc(dest.name)} <span class="dest-modal__urdu">${esc(dest.urdu)}</span></h2>
      <p class="dest-modal__province">📍 ${esc(dest.province)}</p>
      <div class="dest-modal__meta">
        <span>⭐ ${dest.rating} rating</span>
        <span>${weatherIcon(dest.weather)} ${esc(dest.weather)}</span>
      </div>
      <div class="dest-modal__cats">
        ${dest.categories.map(cid => {
          const cat = CATEGORIES.find(c => c.id === cid);
          return cat ? `<span class="tag tag--large">${cat.icon} ${esc(cat.label)}</span>` : '';
        }).join('')}
      </div>
      <button class="btn btn-primary btn-full dest-modal__plan" data-id="${esc(dest.id)}">
        ${esc(t('Plan a Trip Here', 'یہاں سفر منصوبہ بنائیں'))} →
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  document.getElementById('close-dest-modal')?.addEventListener('click', closeDestModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeDestModal(); });

  body.querySelector('.dest-modal__plan')?.addEventListener('click', e => {
    const did = e.currentTarget.dataset.id;
    const d = DESTINATIONS.find(x => x.id === did);
    if (d) {
      state.tripData.destinations = [d.id];
      state.wizardStep = 1;
      closeDestModal();
      showScreen('plan');
    }
  });
}

function closeDestModal() {
  const modal = document.getElementById('dest-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ── Plan Trip Wizard ───────────────────────────────────────────────────────────

function initPlanScreen() {
  state.wizardStep = 1;
  renderWizardStep(1);
}

function showWizard(step) {
  state.wizardStep = step;
  renderWizardStep(step);
}

function renderWizardStep(step) {
  // Update step indicators
  document.querySelectorAll('.wizard-step-indicator').forEach((el, i) => {
    const stepNum = i + 1;
    el.classList.toggle('active', stepNum === step);
    el.classList.toggle('completed', stepNum < step);
    el.setAttribute('aria-current', stepNum === step ? 'step' : 'false');
  });

  // Show/hide panes
  document.querySelectorAll('.wizard-pane').forEach(pane => {
    const paneStep = parseInt(pane.dataset.step, 10);
    pane.classList.toggle('hidden', paneStep !== step);
    pane.setAttribute('aria-hidden', paneStep !== step ? 'true' : 'false');
  });

  // Nav buttons
  const prevBtn = document.getElementById('wizard-prev');
  const nextBtn = document.getElementById('wizard-next');
  if (prevBtn) {
    prevBtn.classList.toggle('hidden', step === 1);
    prevBtn.textContent = t('Back', 'واپس');
  }
  if (nextBtn) {
    if (step === 4) {
      nextBtn.textContent = t('Generate AI Itinerary ✨', 'AI سفرنامہ بنائیں ✨');
      nextBtn.classList.add('btn-generate');
    } else {
      nextBtn.textContent = t('Next →', 'آگے →');
      nextBtn.classList.remove('btn-generate');
    }
  }

  // Render pane content
  if (step === 1) renderStep1();
  if (step === 2) renderStep2();
  if (step === 3) renderStep3();
  if (step === 4) renderStep4();
}

function renderStep1() {
  const container = document.getElementById('step1-destinations');
  if (!container) return;

  const pool = state.selectedCategories.length > 0
    ? DESTINATIONS.filter(d => d.categories.some(c => state.selectedCategories.includes(c)))
    : DESTINATIONS;

  container.innerHTML = pool.map(dest => {
    const sel = state.tripData.destinations.includes(dest.id);
    return `<button
      class="dest-chip${sel ? ' dest-chip--active' : ''}"
      data-dest="${esc(dest.id)}"
      aria-pressed="${sel}">
      <span>${dest.emoji}</span>
      <span>${esc(state.language === 'ur' ? dest.urdu : dest.name)}</span>
    </button>`;
  }).join('');

  container.querySelectorAll('.dest-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.dest;
      const idx = state.tripData.destinations.indexOf(id);
      if (idx === -1) {
        state.tripData.destinations.push(id);
      } else {
        state.tripData.destinations.splice(idx, 1);
      }
      btn.classList.toggle('dest-chip--active', state.tripData.destinations.includes(id));
      btn.setAttribute('aria-pressed', String(state.tripData.destinations.includes(id)));
    });
  });
}

function renderStep2() {
  const startInput = document.getElementById('trip-start-date');
  const endInput   = document.getElementById('trip-end-date');
  const travelerDisplay = document.getElementById('traveler-count');
  const budgetDisplay   = document.getElementById('budget-display');
  const budgetSlider    = document.getElementById('budget-slider');
  const tripNameInput   = document.getElementById('trip-name-input');

  // Set today as min date
  const today = new Date().toISOString().split('T')[0];
  if (startInput) {
    startInput.min = today;
    startInput.value = state.tripData.startDate;
    startInput.addEventListener('change', () => {
      state.tripData.startDate = startInput.value;
      if (endInput && endInput.value && endInput.value < startInput.value) {
        endInput.value = startInput.value;
        state.tripData.endDate = endInput.value;
      }
      if (endInput) endInput.min = startInput.value;
    });
  }
  if (endInput) {
    endInput.min = state.tripData.startDate || today;
    endInput.value = state.tripData.endDate;
    endInput.addEventListener('change', () => { state.tripData.endDate = endInput.value; });
  }

  // Traveler stepper
  if (travelerDisplay) travelerDisplay.textContent = state.tripData.travelers;
  const decBtn = document.getElementById('traveler-dec');
  const incBtn = document.getElementById('traveler-inc');
  if (decBtn) {
    decBtn.onclick = () => {
      state.tripData.travelers = clamp(state.tripData.travelers - 1, 1, 20);
      if (travelerDisplay) travelerDisplay.textContent = state.tripData.travelers;
    };
  }
  if (incBtn) {
    incBtn.onclick = () => {
      state.tripData.travelers = clamp(state.tripData.travelers + 1, 1, 20);
      if (travelerDisplay) travelerDisplay.textContent = state.tripData.travelers;
    };
  }

  // Budget slider
  if (budgetSlider) {
    budgetSlider.min = 50000;
    budgetSlider.max = 500000;
    budgetSlider.step = 10000;
    budgetSlider.value = state.tripData.budget;
    const updateBudgetDisplay = () => {
      if (budgetDisplay) budgetDisplay.textContent = formatPKR(state.tripData.budget);
    };
    updateBudgetDisplay();
    budgetSlider.addEventListener('input', () => {
      state.tripData.budget = parseInt(budgetSlider.value, 10);
      updateBudgetDisplay();
    });
  }

  // Trip name
  if (tripNameInput) {
    tripNameInput.value = state.tripData.name;
    tripNameInput.addEventListener('input', () => {
      state.tripData.name = tripNameInput.value.trim();
    });
  }
}

function renderStep3() {
  const container = document.getElementById('step3-interests');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const sel = state.tripData.interests.includes(cat.id);
    return `<button
      class="interest-chip${sel ? ' interest-chip--active' : ''}"
      data-interest="${esc(cat.id)}"
      aria-pressed="${sel}">
      <span class="interest-icon">${cat.icon}</span>
      <span>${esc(t(cat.label, cat.urdu))}</span>
    </button>`;
  }).join('');

  container.querySelectorAll('.interest-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.interest;
      const idx = state.tripData.interests.indexOf(id);
      if (idx === -1) {
        state.tripData.interests.push(id);
      } else {
        state.tripData.interests.splice(idx, 1);
      }
      btn.classList.toggle('interest-chip--active', state.tripData.interests.includes(id));
      btn.setAttribute('aria-pressed', String(state.tripData.interests.includes(id)));
    });
  });
}

function renderStep4() {
  const container = document.getElementById('step4-review');
  if (!container) return;

  const destNames = state.tripData.destinations
    .map(id => DESTINATIONS.find(d => d.id === id))
    .filter(Boolean)
    .map(d => `${d.emoji} ${state.language === 'ur' ? d.urdu : d.name}`)
    .join(', ') || t('None selected', 'کوئی نہیں');

  const interestNames = state.tripData.interests
    .map(id => CATEGORIES.find(c => c.id === id))
    .filter(Boolean)
    .map(c => `${c.icon} ${t(c.label, c.urdu)}`)
    .join(', ') || t('None selected', 'کوئی نہیں');

  const duration = (state.tripData.startDate && state.tripData.endDate)
    ? (() => {
        const diff = (new Date(state.tripData.endDate) - new Date(state.tripData.startDate)) / 86400000;
        return `${diff + 1} ${t('days', 'دن')}`;
      })()
    : t('Not set', 'متعین نہیں');

  container.innerHTML = `
    <div class="review-card">
      <h3>${esc(state.tripData.name || t('My Pakistan Trip', 'میرا پاکستان سفر'))}</h3>
      <div class="review-row">
        <span class="review-label">${esc(t('Destinations', 'منازل'))}</span>
        <span class="review-value">${esc(destNames)}</span>
      </div>
      <div class="review-row">
        <span class="review-label">${esc(t('Travel Dates', 'سفر کی تاریخیں'))}</span>
        <span class="review-value">${esc(formatDate(state.tripData.startDate) || t('Not set', 'متعین نہیں'))} – ${esc(formatDate(state.tripData.endDate) || t('Not set', 'متعین نہیں'))}</span>
      </div>
      <div class="review-row">
        <span class="review-label">${esc(t('Duration', 'مدت'))}</span>
        <span class="review-value">${esc(duration)}</span>
      </div>
      <div class="review-row">
        <span class="review-label">${esc(t('Travelers', 'مسافرین'))}</span>
        <span class="review-value">${esc(String(state.tripData.travelers))}</span>
      </div>
      <div class="review-row">
        <span class="review-label">${esc(t('Budget', 'بجٹ'))}</span>
        <span class="review-value">${esc(formatPKR(state.tripData.budget))}</span>
      </div>
      <div class="review-row">
        <span class="review-label">${esc(t('Interests', 'دلچسپیاں'))}</span>
        <span class="review-value">${esc(interestNames)}</span>
      </div>
    </div>
    <p class="review-hint">
      ${esc(t(
        state.apiKey
          ? 'Claude AI will generate a personalised itinerary based on your preferences.'
          : 'A sample Hunza Valley itinerary will be used. Add your Claude API key in Settings for a personalised plan.',
        state.apiKey
          ? 'Claude AI آپ کی ترجیحات کی بنیاد پر ذاتی سفرنامہ بنائے گا۔'
          : 'نمونہ ہنزہ سفرنامہ استعمال ہوگا۔ ذاتی منصوبے کے لیے ترتیبات میں API کلید شامل کریں۔'
      ))}
    </p>
  `;
}

function nextStep() {
  const step = state.wizardStep;

  // Validate
  if (step === 1) {
    // Destinations are optional — user might explore on itinerary
  }
  if (step === 2) {
    if (!state.tripData.startDate || !state.tripData.endDate) {
      showToast(t('Please select travel dates', 'سفر کی تاریخیں منتخب کریں'));
      return;
    }
    if (state.tripData.endDate < state.tripData.startDate) {
      showToast(t('End date must be after start date', 'اختتام کی تاریخ شروع کے بعد ہونی چاہیے'));
      return;
    }
  }

  if (step < 4) {
    showWizard(step + 1);
  } else {
    generateItinerary();
  }
}

function prevStep() {
  if (state.wizardStep > 1) {
    showWizard(state.wizardStep - 1);
  }
}

function initPlanButtons() {
  const nextBtn = document.getElementById('wizard-next');
  const prevBtn = document.getElementById('wizard-prev');
  if (nextBtn) nextBtn.addEventListener('click', nextStep);
  if (prevBtn) prevBtn.addEventListener('click', prevStep);
}

// ── Generate Itinerary ────────────────────────────────────────────────────────

async function generateItinerary() {
  const overlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }
  if (loadingText) loadingText.textContent = t('Generating your Pakistan adventure…', 'آپ کا پاکستان سفر بنایا جا رہا ہے…');

  let aiSummary = null;

  if (state.apiKey) {
    try {
      const destNames = state.tripData.destinations
        .map(id => DESTINATIONS.find(d => d.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      const prompt = `Create a brief travel summary (3-4 sentences) for a Pakistan trip with these details:
- Destinations: ${destNames || 'Hunza Valley'}
- Dates: ${state.tripData.startDate} to ${state.tripData.endDate}
- Travelers: ${state.tripData.travelers}
- Budget: ${formatPKR(state.tripData.budget)}
- Interests: ${state.tripData.interests.join(', ') || 'general tourism'}

Highlight what makes this trip special and include one safety tip.`;

      aiSummary = await callClaude(
        [{ role: 'user', content: prompt }],
        'You are an expert Pakistan travel guide. Provide concise, enthusiastic travel summaries highlighting the best of Pakistan.'
      );
    } catch (err) {
      console.warn('AI generation failed:', err.message);
      aiSummary = null;
    }
  }

  // Build trip object
  const trip = {
    id: generateId(),
    name: state.tripData.name || t('My Pakistan Trip', 'میرا پاکستان سفر'),
    destinations: [...state.tripData.destinations],
    startDate: state.tripData.startDate,
    endDate: state.tripData.endDate,
    travelers: state.tripData.travelers,
    budget: state.tripData.budget,
    interests: [...state.tripData.interests],
    aiSummary,
    createdAt: new Date().toISOString(),
    itinerary: HUNZA_ITINERARY,
  };

  state.generatedItinerary = trip;
  saveTripToStorage(trip);

  // Small delay for UX
  await delay(600);

  if (overlay) {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  showScreen('itinerary');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Claude API ────────────────────────────────────────────────────────────────

async function callClaude(messages, systemPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: messages
    })
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

// ── Itinerary Screen ──────────────────────────────────────────────────────────

function renderItinerary() {
  const trip = state.generatedItinerary || state.savedTrips[0] || null;
  const itinerary = trip?.itinerary || HUNZA_ITINERARY;

  renderItineraryHeader(trip);
  renderDayPills(itinerary);
  renderDayContent(itinerary[state.currentDay - 1] || itinerary[0]);
  if (trip?.aiSummary) renderAiSummaryBanner(trip.aiSummary);
}

function renderItineraryHeader(trip) {
  const titleEl = document.getElementById('itinerary-trip-name');
  if (titleEl) {
    titleEl.textContent = trip?.name || t('Hunza Valley — 7 Days', 'ہنزہ — 7 دن');
  }
  const subtitleEl = document.getElementById('itinerary-trip-dates');
  if (subtitleEl && trip?.startDate && trip?.endDate) {
    subtitleEl.textContent = `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)} · ${trip.travelers} ${t('travelers', 'مسافرین')}`;
  }
}

function renderAiSummaryBanner(summary) {
  const banner = document.getElementById('ai-summary-banner');
  const text = document.getElementById('ai-summary-text');
  if (banner && text) {
    text.textContent = summary;
    banner.classList.remove('hidden');
    banner.setAttribute('aria-hidden', 'false');
  }
}

function renderDayPills(itinerary) {
  const container = document.getElementById('day-pills');
  if (!container) return;

  container.innerHTML = itinerary.map(day => `
    <button
      class="day-pill${state.currentDay === day.day ? ' day-pill--active' : ''}"
      data-day="${day.day}"
      aria-pressed="${state.currentDay === day.day}"
      aria-label="${esc(t('Day', 'دن'))} ${day.day}: ${esc(day.title)}">
      <span class="day-pill__num">${esc(t('Day', 'دن'))} ${day.day}</span>
      <span class="day-pill__title">${esc(state.language === 'ur' ? day.urdu : day.title)}</span>
    </button>
  `).join('');

  container.querySelectorAll('.day-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentDay = parseInt(btn.dataset.day, 10);
      renderDayPills(itinerary);
      const day = itinerary.find(d => d.day === state.currentDay);
      if (day) renderDayContent(day);
    });
  });
}

function renderDayContent(day) {
  const container = document.getElementById('day-content');
  if (!container || !day) return;

  const alertHtml = day.alert ? `
    <div class="day-alert day-alert--${esc(day.alert.type)}" role="alert">
      ${esc(day.alert.text)}
    </div>
  ` : '';

  container.innerHTML = `
    <div class="day-header">
      <div class="day-header__meta">
        <span class="day-badge">${esc(t('Day', 'دن'))} ${day.day}</span>
        <span class="day-location">📍 ${esc(day.location)}</span>
      </div>
      <h2 class="day-title">${esc(state.language === 'ur' ? day.urdu : day.title)}</h2>
    </div>
    ${alertHtml}
    ${renderTimeSlot('morning',   '🌅', t('Morning',   'صبح'),   day.activities.morning)}
    ${renderTimeSlot('afternoon', '☀️', t('Afternoon', 'دوپہر'), day.activities.afternoon)}
    ${renderTimeSlot('evening',   '🌙', t('Evening',   'شام'),   day.activities.evening)}
  `;
}

function renderTimeSlot(slot, icon, label, activities) {
  if (!activities || activities.length === 0) return '';
  return `
    <section class="time-slot" aria-label="${esc(label)}">
      <h3 class="time-slot__header">${icon} ${esc(label)}</h3>
      <div class="time-slot__activities">
        ${activities.map(act => renderActivityCard(act)).join('')}
      </div>
    </section>
  `;
}

function renderActivityCard(act) {
  return `
    <div class="activity-card" style="border-left: 4px solid ${act.color}; background: ${act.color}22">
      <div class="activity-card__icon">${act.icon}</div>
      <div class="activity-card__body">
        <strong class="activity-card__name">${esc(act.name)}</strong>
        <span class="activity-card__location">📍 ${esc(act.location)}</span>
        <div class="activity-card__meta">
          <span class="activity-card__duration">⏱ ${esc(act.duration)}</span>
          <span class="activity-card__cat tag">${esc(act.category)}</span>
        </div>
      </div>
    </div>
  `;
}

// ── AI Chat ───────────────────────────────────────────────────────────────────

function initChatScreen() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input?.value.trim();
      if (text) {
        input.value = '';
        sendChatMessage(text);
      }
    });
  }
}

async function sendChatMessage(text) {
  addChatBubble(text, 'user');
  state.chatMessages.push({ role: 'user', content: text });

  if (!state.apiKey) {
    addChatBubble(
      t(
        'Please add your Claude API key in Settings to enable AI chat.',
        'AI چیٹ فعال کرنے کے لیے ترتیبات میں Claude API کلید شامل کریں۔'
      ),
      'ai'
    );
    return;
  }

  const typingId = showTypingIndicator();

  try {
    const reply = await callClaude(
      state.chatMessages,
      'You are an expert Pakistan travel guide. Give concise, helpful advice about travel in Pakistan. Include safety tips, local food recommendations, and cultural advice. Keep responses under 150 words.'
    );
    state.chatMessages.push({ role: 'assistant', content: reply });
    removeTypingIndicator(typingId);
    addChatBubble(reply, 'ai');
  } catch (err) {
    removeTypingIndicator(typingId);
    addChatBubble(
      t(
        `Sorry, something went wrong: ${err.message}`,
        `معذرت، کچھ غلط ہو گیا: ${err.message}`
      ),
      'ai error'
    );
  }
}

function addChatBubble(text, role) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble--${role.includes('user') ? 'user' : 'ai'}`;
  if (role.includes('error')) bubble.classList.add('chat-bubble--error');
  bubble.textContent = text;
  bubble.setAttribute('role', 'listitem');
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-bubble chat-bubble--ai chat-bubble--typing';
  div.id = id;
  div.innerHTML = '<span></span><span></span><span></span>';
  div.setAttribute('aria-label', t('AI is typing…', 'AI لکھ رہا ہے…'));
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  if (id) document.getElementById(id)?.remove();
}

function openChatModal() {
  const modal = document.getElementById('chat-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('chat-input')?.focus();
  }
}

function closeChatModal() {
  const modal = document.getElementById('chat-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// ── Survival / Offline Map ────────────────────────────────────────────────────

const TRAIL_WAYPOINTS = [
  { name: 'Raikot Bridge',            lat: 35.1856, lng: 74.5960, icon: '🌉', info: 'Starting point — 1450m' },
  { name: 'Tato Village',             lat: 35.2431, lng: 74.5730, icon: '🏘️', info: 'Jeep stop — 2860m' },
  { name: 'Fairy Meadows',            lat: 35.3731, lng: 74.5785, icon: '🌿', info: 'Camp base — 3300m' },
  { name: 'Nanga Parbat Base Camp',   lat: 35.4118, lng: 74.6028, icon: '🏔️', info: 'Advance camp — 4200m' },
  { name: 'Camp 1',                   lat: 35.4390, lng: 74.6140, icon: '⛺', info: 'Camp 1 — 5000m' },
];

function initSurvivalScreen() {
  renderSignalStrength();
  initSOSButton();
  initSurvivalMap();
}

function renderSignalStrength() {
  const container = document.getElementById('signal-bars');
  if (!container) return;
  const bars = Math.floor(Math.random() * 3) + 1; // 1-3
  container.innerHTML = [1, 2, 3].map(i =>
    `<span class="signal-bar${i <= bars ? ' signal-bar--active' : ''}" aria-hidden="true"></span>`
  ).join('');
  container.setAttribute('aria-label', `${bars} bar${bars > 1 ? 's' : ''} signal`);
}

function initSOSButton() {
  const btn = document.getElementById('sos-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const confirmed = window.confirm(
        t(
          'Send SOS? This will alert emergency services.\n\nEmergency: 1122\nMountain Rescue: 1122\nPTDC: +92-51-9201731',
          'SOS بھیجیں؟ یہ ہنگامی خدمات کو الرٹ کرے گا۔\n\nایمرجنسی: 1122'
        )
      );
      if (confirmed) {
        alert(t('Emergency SOS activated! Calling 1122…', 'ایمرجنسی SOS فعال! 1122 کال ہو رہی ہے…'));
      }
    });
  }
}

function initSurvivalMap() {
  const mapEl = document.getElementById('survival-map');
  if (!mapEl) return;

  // Avoid re-initialising an existing map
  if (survivalMap) {
    survivalMap.invalidateSize();
    return;
  }

  // Wait for Leaflet to be available (loaded via CDN)
  if (typeof L === 'undefined') {
    mapEl.innerHTML = `<div class="map-offline-msg">
      <p>🗺️ ${esc(t('Map unavailable offline', 'آف لائن نقشہ دستیاب نہیں'))}</p>
    </div>`;
    return;
  }

  try {
    survivalMap = L.map(mapEl, {
      center: [35.3731, 74.5785],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      crossOrigin: true,
    }).addTo(survivalMap);

    // Draw trail polyline
    const latlngs = TRAIL_WAYPOINTS.map(wp => [wp.lat, wp.lng]);
    L.polyline(latlngs, {
      color: '#006A4E',
      weight: 3,
      opacity: 0.8,
      dashArray: '6, 4',
    }).addTo(survivalMap);

    // Add markers
    TRAIL_WAYPOINTS.forEach(wp => {
      const icon = L.divIcon({
        className: 'trail-marker',
        html: `<div style="
          background:#006A4E; color:white; border-radius:50%;
          width:32px; height:32px; display:flex; align-items:center;
          justify-content:center; font-size:16px; border:2px solid white;
          box-shadow:0 2px 4px rgba(0,0,0,0.3);">${wp.icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      L.marker([wp.lat, wp.lng], { icon })
        .bindPopup(`<strong>${esc(wp.name)}</strong><br><small>${esc(wp.info)}</small>`)
        .addTo(survivalMap);
    });
  } catch (err) {
    console.warn('Map init failed:', err);
    mapEl.innerHTML = `<div class="map-offline-msg">
      <p>🗺️ ${esc(t('Map unavailable', 'نقشہ دستیاب نہیں'))}</p>
    </div>`;
  }
}

// ── Export / PDF Screen ───────────────────────────────────────────────────────

function initExportScreen() {
  const titleInput     = document.getElementById('export-title');
  const travelerInput  = document.getElementById('export-traveler');
  const layoutRadios   = document.querySelectorAll('input[name="export-layout"]');
  const langRadios     = document.querySelectorAll('input[name="export-lang"]');
  const downloadBtn    = document.getElementById('download-pdf-btn');

  const trip = state.generatedItinerary || state.savedTrips[0];

  if (titleInput) {
    titleInput.value = trip?.name || 'My Pakistan Trip — Hunza Valley';
    titleInput.addEventListener('input', updateExportPreview);
  }
  if (travelerInput) {
    travelerInput.value = trip?.travelers ? `${trip.travelers} Travelers` : '2 Travelers';
    travelerInput.addEventListener('input', updateExportPreview);
  }

  layoutRadios.forEach(r => r.addEventListener('change', updateExportPreview));
  langRadios.forEach(r => r.addEventListener('change', updateExportPreview));

  document.querySelectorAll('.export-section-check').forEach(cb => {
    cb.addEventListener('change', updateExportPreview);
  });

  if (downloadBtn) downloadBtn.addEventListener('click', downloadPDF);

  updateExportPreview();
}

function getExportOptions() {
  const title     = document.getElementById('export-title')?.value.trim() || 'My Pakistan Trip';
  const traveler  = document.getElementById('export-traveler')?.value.trim() || '';
  const layout    = document.querySelector('input[name="export-layout"]:checked')?.value || 'classic';
  const lang      = document.querySelector('input[name="export-lang"]:checked')?.value || 'en';
  const sections  = {};
  document.querySelectorAll('.export-section-check').forEach(cb => {
    sections[cb.dataset.section] = cb.checked;
  });
  return { title, traveler, layout, lang, sections };
}

function updateExportPreview() {
  const preview = document.getElementById('export-preview');
  if (!preview) return;
  const { title, traveler, layout } = getExportOptions();
  const trip = state.generatedItinerary || state.savedTrips[0];

  const dates = (trip?.startDate && trip?.endDate)
    ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
    : 'Dates TBD';

  preview.innerHTML = `
    <div class="pdf-preview pdf-preview--${esc(layout)}">
      <div class="pdf-cover-header">
        <div class="pdf-cover-logo">🧭 MUSAFIR</div>
        <div class="pdf-cover-flag">🇵🇰</div>
      </div>
      <h2 class="pdf-cover-title">${esc(title)}</h2>
      <p class="pdf-cover-dates">${esc(dates)}</p>
      ${traveler ? `<p class="pdf-cover-traveler">👤 ${esc(traveler)}</p>` : ''}
      <div class="pdf-preview-days">
        ${HUNZA_ITINERARY.slice(0, 3).map(day => `
          <div class="pdf-day-preview">
            <strong>Day ${day.day}: ${esc(day.title)}</strong>
            <small>${esc(day.location)}</small>
          </div>
        `).join('')}
        <div class="pdf-day-preview pdf-day-preview--more">+ ${HUNZA_ITINERARY.length - 3} more days…</div>
      </div>
    </div>
  `;
}

async function downloadPDF() {
  const btn = document.getElementById('download-pdf-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = t('Generating PDF…', 'PDF بن رہی ہے…');
  }

  try {
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
      throw new Error('jsPDF not loaded');
    }

    // jsPDF UMD exposes as window.jspdf.jsPDF
    const JsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : jsPDF;
    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const { title, traveler, sections } = getExportOptions();
    const trip = state.generatedItinerary || state.savedTrips[0];
    const itinerary = trip?.itinerary || HUNZA_ITINERARY;
    const dates = (trip?.startDate && trip?.endDate)
      ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`
      : '';

    const W = 210; // A4 width mm
    const MARGIN = 16;
    const CONTENT_W = W - MARGIN * 2;

    // ── Page 1: Cover ────────────────────────────────────────────────
    // Teal header rectangle
    doc.setFillColor(0, 106, 78);
    doc.rect(0, 0, W, 80, 'F');

    // MUSAFIR title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('MUSAFIR', W / 2, 32, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('Pakistan Travel Planner', W / 2, 43, { align: 'center' });

    // Flag line
    doc.setFontSize(22);
    doc.text('🇵🇰', W / 2, 60, { align: 'center' });

    // Trip details below header
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(title, W / 2, 100, { align: 'center', maxWidth: CONTENT_W });

    if (dates) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(dates, W / 2, 112, { align: 'center' });
    }

    if (traveler) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Traveler: ${traveler}`, W / 2, 122, { align: 'center' });
    }

    // Decorative separator
    doc.setDrawColor(0, 106, 78);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 132, W - MARGIN, 132);

    // AI summary if available
    let coverY = 140;
    if (trip?.aiSummary && sections?.summary !== false) {
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'italic');
      const lines = doc.splitTextToSize(trip.aiSummary, CONTENT_W);
      doc.text(lines, MARGIN, coverY);
      coverY += lines.length * 5 + 8;
    }

    // Quick stats
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const stats = [
      `Destinations: ${(trip?.destinations || ['hunza']).map(id => DESTINATIONS.find(d => d.id === id)?.name || id).join(', ')}`,
      `Duration: ${itinerary.length} days`,
      `Travelers: ${trip?.travelers || 2}`,
      `Budget: ${formatPKR(trip?.budget || 150000)}`,
    ];
    stats.forEach((s, i) => {
      doc.text(`• ${s}`, MARGIN, coverY + i * 7);
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text('Generated by Musafir PWA — musafir.pk', W / 2, 287, { align: 'center' });

    // ── Pages 2-8: Daily Itinerary ───────────────────────────────────
    if (sections?.itinerary !== false) {
      itinerary.forEach(day => {
        doc.addPage();

        // Day header bar
        doc.setFillColor(0, 106, 78);
        doc.rect(0, 0, W, 22, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Day ${day.day}: ${day.title}`, MARGIN, 14);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(day.location, W - MARGIN, 14, { align: 'right' });

        let y = 30;

        // Alert
        if (day.alert) {
          doc.setFillColor(255, 243, 205);
          doc.setDrawColor(255, 193, 7);
          doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, 'FD');
          doc.setTextColor(120, 80, 0);
          doc.setFontSize(9);
          doc.text(day.alert.text.replace(/[^\x00-\x7F]/g, '').trim() || day.alert.text, MARGIN + 3, y + 8);
          y += 18;
        }

        // Time slots
        const slots = [
          { key: 'morning',   label: 'Morning',   icon: 'M' },
          { key: 'afternoon', label: 'Afternoon', icon: 'A' },
          { key: 'evening',   label: 'Evening',   icon: 'E' },
        ];

        slots.forEach(slot => {
          const acts = day.activities[slot.key];
          if (!acts || acts.length === 0) return;

          if (y > 255) {
            doc.addPage();
            y = 20;
          }

          // Slot label
          doc.setFillColor(240, 248, 245);
          doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
          doc.setTextColor(0, 106, 78);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(slot.label, MARGIN + 2, y + 5.5);
          y += 11;

          acts.forEach(act => {
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`${act.icon}  ${act.name}`, MARGIN + 4, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(90, 90, 90);
            doc.setFontSize(8);
            doc.text(`     ${act.location}  •  ${act.duration}  •  ${act.category}`, MARGIN + 4, y + 5);
            y += 13;
          });
        });

        // Page footer
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(`Musafir — Day ${day.day} of ${itinerary.length}`, W / 2, 290, { align: 'center' });
      });
    }

    // ── Emergency Contacts ────────────────────────────────────────────
    if (sections?.emergency !== false) {
      doc.addPage();
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, W, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Emergency Contacts', MARGIN, 14);

      let y = 32;
      const contacts = [
        { name: 'Mountain Rescue',         number: '1122',                  note: '24/7 emergency' },
        { name: 'PTDC (Tourism)',           number: '+92-51-9201731',        note: 'Mon-Fri 9am-5pm' },
        { name: 'Aga Khan Health Service', number: '+92-5811-960200',       note: 'GB hospitals' },
        { name: 'Police',                  number: '15',                    note: 'All provinces' },
        { name: 'Ambulance',               number: '1122',                  note: 'Punjab / KPK' },
        { name: 'Fire Brigade',            number: '16',                    note: 'Major cities' },
      ];

      contacts.forEach((c, i) => {
        const rowBg = i % 2 === 0 ? [248, 248, 248] : [255, 255, 255];
        doc.setFillColor(...rowBg);
        doc.rect(MARGIN, y - 2, CONTENT_W, 12, 'F');
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(c.name, MARGIN + 2, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 106, 78);
        doc.text(c.number, MARGIN + 80, y + 6);
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(9);
        doc.text(c.note, MARGIN + 130, y + 6);
        y += 14;
      });
    }

    // ── Urdu Phrases ─────────────────────────────────────────────────
    if (sections?.phrases !== false) {
      doc.addPage();
      doc.setFillColor(0, 106, 78);
      doc.rect(0, 0, W, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Useful Urdu Phrases', MARGIN, 14);

      let y = 32;
      const phrases = [
        { roman: 'Shukriya',       urdu: 'شکریہ',                       meaning: 'Thank you' },
        { roman: 'Kitna hai?',     urdu: 'کتنا ہے؟',           meaning: 'How much is it?' },
        { roman: 'Kahan hai?',     urdu: 'کہاں ہے؟',           meaning: 'Where is it?' },
        { roman: 'Pani chahiye',   urdu: 'پانی چاہیے', meaning: 'I need water' },
        { roman: 'Madad karo',     urdu: 'مدد کرو',                 meaning: 'Help me!' },
        { roman: 'Halal khana',    urdu: 'حلال کھانا', meaning: 'Halal food' },
        { roman: 'Kitna door hai?',urdu: 'کتنا دور ہے؟', meaning: 'How far is it?' },
        { roman: 'Ruk jao',        urdu: 'رک جاؤ',                       meaning: 'Stop!' },
        { roman: 'Mujhe hospital le jao', urdu: 'مجھے ہسپتال لے جاؤ', meaning: 'Take me to hospital' },
        { roman: 'Bahut acha',     urdu: 'بہت اچھا',           meaning: 'Very good / Excellent' },
      ];

      // Table header
      doc.setFillColor(0, 106, 78);
      doc.rect(MARGIN, y - 2, CONTENT_W, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Romanised',    MARGIN + 2, y + 5);
      doc.text('English',      MARGIN + 75, y + 5);
      doc.text('Urdu Script',  MARGIN + 130, y + 5);
      y += 12;

      phrases.forEach((p, i) => {
        const rowBg = i % 2 === 0 ? [248, 248, 248] : [255, 255, 255];
        doc.setFillColor(...rowBg);
        doc.rect(MARGIN, y - 2, CONTENT_W, 11, 'F');
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(p.roman,   MARGIN + 2, y + 5);
        doc.text(p.meaning, MARGIN + 75, y + 5);
        // Urdu script needs special handling — show romanised as fallback in PDF
        doc.text(p.roman,   MARGIN + 130, y + 5);
        y += 13;
      });
    }

    // ── Packing List ─────────────────────────────────────────────────
    if (sections?.packing !== false) {
      doc.addPage();
      doc.setFillColor(0, 106, 78);
      doc.rect(0, 0, W, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Packing List', MARGIN, 14);

      const packingGroups = [
        {
          group: 'Clothing',
          items: ['Warm jacket / down vest', 'Thermal base layers (x2)', 'Waterproof outer layer', 'Trekking trousers (x2)', 'Moisture-wicking t-shirts (x3)', 'Warm hat & gloves', 'Sun hat / cap', 'Good hiking boots (broken in)', 'Sandals / camp shoes', 'Woollen socks (x4)'],
        },
        {
          group: 'Documents',
          items: ['CNIC / Passport', 'PTDC permit (if required)', 'Travel insurance docs', 'Emergency contacts card', 'Hotel booking confirmations', 'Printed itinerary (this PDF!)'],
        },
        {
          group: 'Medical',
          items: ['Altitude sickness pills (Diamox)', 'Rehydration sachets (ORS)', 'Pain relievers (paracetamol)', 'Antiseptic cream & bandages', 'Sunscreen SPF 50+', 'Lip balm (high altitude)', 'Personal prescription medicines', 'Blister plasters'],
        },
        {
          group: 'Gear',
          items: ['Daypack (25-30L)', 'Trekking poles', 'Headlamp + spare batteries', 'Sleeping bag (-10°C rated)', 'Water bottle (1L x2)', 'Water purification tablets', 'Portable charger / power bank', 'Offline maps downloaded', 'Whistle & mirror (emergency)'],
        },
        {
          group: 'Food & Snacks',
          items: ['Energy bars (x10)', 'Dried fruit & nuts', 'Instant noodles (for camps)', 'Electrolyte powder', 'Chocolate / halwa'],
        },
      ];

      let y = 30;
      let col = 0; // 0 = left, 1 = right
      const colWidth = (CONTENT_W - 8) / 2;
      const colX = [MARGIN, MARGIN + colWidth + 8];

      packingGroups.forEach(group => {
        if (y > 255 && col === 0) {
          col = 1;
          y = 30;
        } else if (y > 255 && col === 1) {
          doc.addPage();
          col = 0;
          y = 30;
        }

        const x = colX[col];

        doc.setFillColor(0, 106, 78);
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(x, y, colWidth, 9, 1.5, 1.5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(group.group, x + 3, y + 6);
        y += 12;

        group.items.forEach(item => {
          if (y > 262) {
            if (col === 0) { col = 1; y = 30; }
            else { doc.addPage(); col = 0; y = 30; }
          }
          // Checkbox square
          doc.setDrawColor(180, 180, 180);
          doc.setFillColor(255, 255, 255);
          doc.rect(colX[col] + 1, y - 4, 4, 4, 'FD');
          doc.setTextColor(40, 40, 40);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(item, colX[col] + 7, y - 1);
          y += 7;
        });
        y += 4; // group spacing
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text('Musafir — Packing List', W / 2, 290, { align: 'center' });
    }

    // ── Save the PDF ──────────────────────────────────────────────────
    const filename = (title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-') || 'Musafir-Trip') + '.pdf';
    doc.save(filename);
    showToast(t('PDF downloaded!', 'PDF ڈاؤن لوڈ ہو گئی!'));

  } catch (err) {
    console.error('PDF generation failed:', err);
    showToast(t('PDF generation failed. Check console.', 'PDF بنانے میں ناکامی۔'));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = t('Download PDF', 'PDF ڈاؤن لوڈ کریں');
    }
  }
}

// ── Saved Trips Modal ─────────────────────────────────────────────────────────

function openSavedTripsModal() {
  const modal = document.getElementById('saved-trips-modal');
  if (!modal) return;
  renderSavedTripsList();
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeSavedTripsModal() {
  const modal = document.getElementById('saved-trips-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function renderSavedTripsList() {
  const container = document.getElementById('saved-trips-list');
  if (!container) return;

  if (state.savedTrips.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🗺️</div>
      <p>${esc(t('No saved trips yet', 'ابھی تک کوئی محفوظ سفر نہیں'))}</p>
    </div>`;
    return;
  }

  container.innerHTML = state.savedTrips.map(trip => `
    <div class="saved-trip-card" data-id="${esc(trip.id)}">
      <div class="saved-trip-card__info">
        <strong>${esc(trip.name)}</strong>
        <span>${trip.destinations.map(id => DESTINATIONS.find(d => d.id === id)?.emoji || '📍').join(' ')}</span>
        <small>${esc(formatDate(trip.startDate) || '')} ${trip.endDate ? '– ' + esc(formatDate(trip.endDate)) : ''}</small>
        <small>${trip.travelers} ${esc(t('travelers', 'مسافرین'))} · ${esc(formatPKR(trip.budget))}</small>
      </div>
      <div class="saved-trip-card__actions">
        <button class="btn btn-outline btn-sm view-trip-btn" data-id="${esc(trip.id)}">${esc(t('View', 'دیکھیں'))}</button>
        <button class="btn btn-danger btn-sm delete-trip-btn" data-id="${esc(trip.id)}" aria-label="${esc(t('Delete trip', 'سفر حذف کریں'))}">🗑️</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.view-trip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trip = state.savedTrips.find(t => t.id === btn.dataset.id);
      if (trip) {
        state.generatedItinerary = trip;
        state.currentDay = 1;
        closeSavedTripsModal();
        showScreen('itinerary');
      }
    });
  });

  container.querySelectorAll('.delete-trip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.confirm(t('Delete this trip?', 'یہ سفر حذف کریں؟'))) {
        deleteSavedTrip(btn.dataset.id);
        renderSavedTripsList();
        showToast(t('Trip deleted', 'سفر حذف ہو گیا'));
      }
    });
  });
}

// ── Settings Modal ────────────────────────────────────────────────────────────

function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;

  const keyInput = document.getElementById('settings-api-key');
  if (keyInput) keyInput.value = state.apiKey;

  // Reflect current language
  const langEn = document.getElementById('lang-en');
  const langUr = document.getElementById('lang-ur');
  if (langEn) langEn.classList.toggle('active', state.language === 'en');
  if (langUr) langUr.classList.toggle('active', state.language === 'ur');

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function saveApiKey() {
  const keyInput = document.getElementById('settings-api-key');
  if (keyInput) {
    state.apiKey = keyInput.value.trim();
    saveSettings();
    showToast(state.apiKey ? t('API key saved!', 'API کلید محفوظ!') : t('API key cleared', 'API کلید صاف'));
  }
}

function clearAllTrips() {
  if (!window.confirm(t('Clear all saved trips? This cannot be undone.', 'تمام محفوظ سفر صاف کریں؟ یہ واپس نہیں ہو سکتا۔'))) return;
  state.savedTrips = [];
  try { localStorage.removeItem('musafir_trips'); } catch { /* ignore */ }
  showToast(t('All trips cleared', 'تمام سفر صاف ہو گئے'));
}

function initSettingsModal() {
  const saveKeyBtn   = document.getElementById('save-api-key-btn');
  const clearBtn     = document.getElementById('clear-trips-btn');
  const closeBtn     = document.getElementById('close-settings-btn');
  const overlay      = document.getElementById('settings-modal');
  const langEnBtn    = document.getElementById('lang-en');
  const langUrBtn    = document.getElementById('lang-ur');

  if (saveKeyBtn)   saveKeyBtn.addEventListener('click', saveApiKey);
  if (clearBtn)     clearBtn.addEventListener('click', clearAllTrips);
  if (closeBtn)     closeBtn.addEventListener('click', closeSettingsModal);
  if (overlay)      overlay.addEventListener('click', e => { if (e.target === overlay) closeSettingsModal(); });
  if (langEnBtn)    langEnBtn.addEventListener('click', () => { setLanguage('en'); langEnBtn.classList.add('active'); document.getElementById('lang-ur')?.classList.remove('active'); });
  if (langUrBtn)    langUrBtn.addEventListener('click', () => { setLanguage('ur'); langUrBtn.classList.add('active'); document.getElementById('lang-en')?.classList.remove('active'); });

  // Settings button(s) in various headers
  document.querySelectorAll('[data-action="open-settings"]').forEach(btn => {
    btn.addEventListener('click', openSettingsModal);
  });
}

// ── Global Event Bindings ─────────────────────────────────────────────────────

function bindGlobalEvents() {
  // Install banner
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) installBtn.addEventListener('click', handleInstallClick);
  const dismissInstall = document.getElementById('dismiss-install-btn');
  if (dismissInstall) dismissInstall.addEventListener('click', hideInstallBanner);

  // Dest modal backdrop
  const destModal = document.getElementById('dest-modal');
  if (destModal) destModal.addEventListener('click', e => { if (e.target === destModal) closeDestModal(); });

  // Saved trips
  document.querySelectorAll('[data-action="open-saved-trips"]').forEach(btn => {
    btn.addEventListener('click', openSavedTripsModal);
  });
  const closeSavedBtn = document.getElementById('close-saved-trips-btn');
  if (closeSavedBtn) closeSavedBtn.addEventListener('click', closeSavedTripsModal);
  const savedModal = document.getElementById('saved-trips-modal');
  if (savedModal) savedModal.addEventListener('click', e => { if (e.target === savedModal) closeSavedTripsModal(); });

  // Itinerary chat button
  document.querySelectorAll('[data-action="open-chat"]').forEach(btn => {
    btn.addEventListener('click', openChatModal);
  });
  const closeChatBtn = document.getElementById('close-chat-btn');
  if (closeChatBtn) closeChatBtn.addEventListener('click', closeChatModal);
  const chatModal = document.getElementById('chat-modal');
  if (chatModal) chatModal.addEventListener('click', e => { if (e.target === chatModal) closeChatModal(); });

  // Plan screen quick-start button (from itinerary header)
  document.querySelectorAll('[data-action="new-trip"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.wizardStep = 1;
      state.tripData = {
        destinations: [], startDate: '', endDate: '',
        travelers: 2, budget: 150000, interests: [], name: ''
      };
      showScreen('plan');
    });
  });

  // Export from itinerary
  document.querySelectorAll('[data-action="export"]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('export'));
  });

  // Keyboard: close modals with Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDestModal();
      closeSavedTripsModal();
      closeChatModal();
      closeSettingsModal();
    }
  });
}

// ── init ──────────────────────────────────────────────────────────────────────

function init() {
  // Load persisted state
  loadSettings();
  loadSavedTrips();

  // Apply language immediately
  if (state.language === 'ur') {
    document.body.classList.add('urdu-mode');
    document.documentElement.lang = 'ur';
    document.documentElement.dir = 'rtl';
  }

  // Register service worker
  registerServiceWorker();

  // Wire up all static event bindings
  initBottomNav();
  initInstallBanner();
  initSettingsModal();
  bindGlobalEvents();
  initPlanButtons();
  initChatScreen();

  // Show initial screen
  showScreen('home');
}

// ── Boot ──────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
