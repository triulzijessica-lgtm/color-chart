const fs = require('fs');

const appContent = `// DecoTime & Ohuhu Color Tracker - App Logic

const STORAGE_KEY = 'decotime_inventory_v1';
let userInventory = {};
let currentStatusFilter = 'al'; // 'al' (Twin Marker), 'ac' (Acqua Marker), 'ohuhu', 'all'
let currentCategoryFilter = 'all';
let currentSearchQuery = '';
let activeDetailId = null;
let activeDetailType = null; // 'al', 'ac', 'ohuhu'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadInventory();
  setupFilterEvents();
  setupSearchEvents();
  renderColors();
  updateStats();
  initSync();
});

// Load inventory from LocalStorage or initialize with markings from photos
function loadInventory() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      userInventory = JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing stored inventory', e);
      initFromPhotoMarkings();
    }
  } else {
    initFromPhotoMarkings();
  }

  // Ensure DecoTime colors preserve al/ac
  if (typeof DECOTIME_COLORS !== 'undefined') {
    DECOTIME_COLORS.forEach(c => {
      if (!userInventory[c.id]) {
        userInventory[c.id] = {
          al: Boolean(c.defaultAl),
          ac: Boolean(c.defaultAc),
          notes: ''
        };
      }
    });
  }

  // Ensure all Ohuhu colors are initialized as owned (from her swatches)
  if (typeof OHUHU_COLORS !== 'undefined') {
    OHUHU_COLORS.forEach(c => {
      if (!userInventory[c.id]) {
        userInventory[c.id] = {
          owned: Boolean(c.defaultOwned),
          notes: ''
        };
      }
    });
  }

  saveInventoryLocal();
}

function initFromPhotoMarkings() {
  userInventory = {};
  if (typeof DECOTIME_COLORS !== 'undefined') {
    DECOTIME_COLORS.forEach(c => {
      userInventory[c.id] = {
        al: Boolean(c.defaultAl),
        ac: Boolean(c.defaultAc),
        notes: ''
      };
    });
  }
  if (typeof OHUHU_COLORS !== 'undefined') {
    OHUHU_COLORS.forEach(c => {
      userInventory[c.id] = {
        owned: Boolean(c.defaultOwned),
        notes: ''
      };
    });
  }
  saveInventory();
}

function saveInventoryLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userInventory));
}

function saveInventory() {
  saveInventoryLocal();
  if (typeof pushInventoryToServer === 'function') {
    pushInventoryToServer();
  }
}

// Category filter chip generator based on active status/brand
function updateCategoryChipsForCurrentStatus() {
  const categoryRow = document.getElementById('categoryFilterRow');
  if (!categoryRow) return;

  if (currentStatusFilter === 'ohuhu') {
    categoryRow.innerHTML = \`
      <button class="filter-chip \${currentCategoryFilter === 'all' ? 'active' : ''}" data-category="all">Tutti gli Ohuhu (320)</button>
      <button class="filter-chip \${currentCategoryFilter === 'swatch-1' ? 'active' : ''}" data-category="swatch-1">📄 Swatch 1 (Y02 ➔ E513)</button>
      <button class="filter-chip \${currentCategoryFilter === 'swatch-2' ? 'active' : ''}" data-category="swatch-2">📄 Swatch 2 (E514 ➔ RV514)</button>
      <button class="filter-chip \${currentCategoryFilter === 'swatch-3' ? 'active' : ''}" data-category="swatch-3">📄 Swatch 3 (RV515 ➔ G213)</button>
      <button class="filter-chip \${currentCategoryFilter === 'swatch-4' ? 'active' : ''}" data-category="swatch-4">📄 Swatch 4 (G215 ➔ 120)</button>
      <button class="filter-chip \${currentCategoryFilter === 'Gialli & Arancio' ? 'active' : ''}" data-category="Gialli & Arancio">🟡 Gialli & Arancio</button>
      <button class="filter-chip \${currentCategoryFilter === 'Rossi & Rosa' ? 'active' : ''}" data-category="Rossi & Rosa">🔴 Rossi & Rosa</button>
      <button class="filter-chip \${currentCategoryFilter === 'Viola & Lilla' ? 'active' : ''}" data-category="Viola & Lilla">🟣 Viola & Lilla</button>
      <button class="filter-chip \${currentCategoryFilter === 'Blu & Turchese' ? 'active' : ''}" data-category="Blu & Turchese">🔵 Blu & Turchese</button>
      <button class="filter-chip \${currentCategoryFilter === 'Verdi' ? 'active' : ''}" data-category="Verdi">🟢 Verdi</button>
      <button class="filter-chip \${currentCategoryFilter === 'Marroni & Terra' ? 'active' : ''}" data-category="Marroni & Terra">🟤 Marroni & Terra</button>
      <button class="filter-chip \${currentCategoryFilter === 'Grigi' ? 'active' : ''}" data-category="Grigi">⚪ Grigi</button>
      <button class="filter-chip \${currentCategoryFilter === 'Fluo & Neon' ? 'active' : ''}" data-category="Fluo & Neon">⚡ Fluo & Neon</button>
      <button class="filter-chip \${currentCategoryFilter === 'Nero' ? 'active' : ''}" data-category="Nero">⚫ Nero</button>
    \`;
  } else if (currentStatusFilter === 'al') {
    categoryRow.innerHTML = \`
      <button class="filter-chip \${currentCategoryFilter === 'all' ? 'active' : ''}" data-category="all">Tutti i Twin Marker (175)</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-1' ? 'active' : ''}" data-category="page-1">📄 Pagina 1</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-2' ? 'active' : ''}" data-category="page-2">📄 Pagina 2</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-3' ? 'active' : ''}" data-category="page-3">📄 Pagina 3</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-4' ? 'active' : ''}" data-category="page-4">📄 Pagina 4</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-5' ? 'active' : ''}" data-category="page-5">📄 Pagina 5</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-6' ? 'active' : ''}" data-category="page-6">📄 Pagina 6</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-7' ? 'active' : ''}" data-category="page-7">📄 Grigi (Pagina 7)</button>
      <button class="filter-chip \${currentCategoryFilter === 'Rossi & Rosa' ? 'active' : ''}" data-category="Rossi & Rosa">🔴 Rossi & Rosa</button>
      <button class="filter-chip \${currentCategoryFilter === 'Gialli & Arancio' ? 'active' : ''}" data-category="Gialli & Arancio">🟡 Gialli & Arancio</button>
      <button class="filter-chip \${currentCategoryFilter === 'Verdi' ? 'active' : ''}" data-category="Verdi">🟢 Verdi</button>
      <button class="filter-chip \${currentCategoryFilter === 'Blu & Turchese' ? 'active' : ''}" data-category="Blu & Turchese">🔵 Blu & Turchese</button>
      <button class="filter-chip \${currentCategoryFilter === 'Viola & Lilla' ? 'active' : ''}" data-category="Viola & Lilla">🟣 Viola & Lilla</button>
      <button class="filter-chip \${currentCategoryFilter === 'Marroni & Terra' ? 'active' : ''}" data-category="Marroni & Terra">🟤 Marroni & Terra</button>
      <button class="filter-chip \${currentCategoryFilter === 'Toni Pelle & Pastello' ? 'active' : ''}" data-category="Toni Pelle & Pastello">🌸 Toni Pelle</button>
      <button class="filter-chip \${currentCategoryFilter === 'Fluo & Neon' ? 'active' : ''}" data-category="Fluo & Neon">⚡ Fluo & Neon</button>
      <button class="filter-chip \${currentCategoryFilter === 'new-only' ? 'active' : ''}" data-category="new-only">✨ Solo Nuovi (*)</button>
    \`;
  } else if (currentStatusFilter === 'ac') {
    categoryRow.innerHTML = \`
      <button class="filter-chip \${currentCategoryFilter === 'all' ? 'active' : ''}" data-category="all">Tutti gli Acqua Marker (109)</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-1' ? 'active' : ''}" data-category="page-1">📄 Pagina 1</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-2' ? 'active' : ''}" data-category="page-2">📄 Pagina 2</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-3' ? 'active' : ''}" data-category="page-3">📄 Pagina 3</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-4' ? 'active' : ''}" data-category="page-4">📄 Pagina 4</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-5' ? 'active' : ''}" data-category="page-5">📄 Pagina 5</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-6' ? 'active' : ''}" data-category="page-6">📄 Pagina 6</button>
      <button class="filter-chip \${currentCategoryFilter === 'page-7' ? 'active' : ''}" data-category="page-7">📄 Grigi (Pagina 7)</button>
      <button class="filter-chip \${currentCategoryFilter === 'Rossi & Rosa' ? 'active' : ''}" data-category="Rossi & Rosa">🔴 Rossi & Rosa</button>
      <button class="filter-chip \${currentCategoryFilter === 'Gialli & Arancio' ? 'active' : ''}" data-category="Gialli & Arancio">🟡 Gialli & Arancio</button>
      <button class="filter-chip \${currentCategoryFilter === 'Verdi' ? 'active' : ''}" data-category="Verdi">🟢 Verdi</button>
      <button class="filter-chip \${currentCategoryFilter === 'Blu & Turchese' ? 'active' : ''}" data-category="Blu & Turchese">🔵 Blu & Turchese</button>
      <button class="filter-chip \${currentCategoryFilter === 'Viola & Lilla' ? 'active' : ''}" data-category="Viola & Lilla">🟣 Viola & Lilla</button>
      <button class="filter-chip \${currentCategoryFilter === 'Marroni & Terra' ? 'active' : ''}" data-category="Marroni & Terra">🟤 Marroni & Terra</button>
      <button class="filter-chip \${currentCategoryFilter === 'Toni Pelle & Pastello' ? 'active' : ''}" data-category="Toni Pelle & Pastello">🌸 Toni Pelle</button>
      <button class="filter-chip \${currentCategoryFilter === 'Fluo & Neon' ? 'active' : ''}" data-category="Fluo & Neon">⚡ Fluo & Neon</button>
      <button class="filter-chip \${currentCategoryFilter === 'new-only' ? 'active' : ''}" data-category="new-only">✨ Solo Nuovi (*)</button>
    \`;
  } else {
    // 'all'
    categoryRow.innerHTML = \`
      <button class="filter-chip \${currentCategoryFilter === 'all' ? 'active' : ''}" data-category="all">Tutti i Colori (604)</button>
      <button class="filter-chip \${currentCategoryFilter === 'Rossi & Rosa' ? 'active' : ''}" data-category="Rossi & Rosa">🔴 Rossi & Rosa</button>
      <button class="filter-chip \${currentCategoryFilter === 'Gialli & Arancio' ? 'active' : ''}" data-category="Gialli & Arancio">🟡 Gialli & Arancio</button>
      <button class="filter-chip \${currentCategoryFilter === 'Verdi' ? 'active' : ''}" data-category="Verdi">🟢 Verdi</button>
      <button class="filter-chip \${currentCategoryFilter === 'Blu & Turchese' ? 'active' : ''}" data-category="Blu & Turchese">🔵 Blu & Turchese</button>
      <button class="filter-chip \${currentCategoryFilter === 'Viola & Lilla' ? 'active' : ''}" data-category="Viola & Lilla">🟣 Viola & Lilla</button>
      <button class="filter-chip \${currentCategoryFilter === 'Marroni & Terra' ? 'active' : ''}" data-category="Marroni & Terra">🟤 Marroni & Terra</button>
      <button class="filter-chip \${currentCategoryFilter === 'Grigi' ? 'active' : ''}" data-category="Grigi">⚪ Grigi</button>
      <button class="filter-chip \${currentCategoryFilter === 'Fluo & Neon' ? 'active' : ''}" data-category="Fluo & Neon">⚡ Fluo & Neon</button>
    \`;
  }

  // Re-bind click events on category chips
  categoryRow.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      categoryRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategoryFilter = chip.getAttribute('data-category');
      renderColors();
    });
  });
}

// Setup Event Listeners
function setupFilterEvents() {
  const statusRow = document.getElementById('statusFilterRow');
  statusRow.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      statusRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const prevStatus = currentStatusFilter;
      currentStatusFilter = chip.getAttribute('data-status');

      if (prevStatus !== currentStatusFilter) {
        currentCategoryFilter = 'all';
      }
      updateCategoryChipsForCurrentStatus();
      updateStats();
      renderColors();
    });
  });

  updateCategoryChipsForCurrentStatus();
}

function setupSearchEvents() {
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    searchClear.style.display = currentSearchQuery ? 'flex' : 'none';
    renderColors();
  });
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = '';
  currentSearchQuery = '';
  document.getElementById('searchClear').style.display = 'none';
  renderColors();
  searchInput.focus();
}

// Set status filter programmatically (e.g. from stat pill clicks)
function setStatusFilter(status) {
  const prevStatus = currentStatusFilter;
  currentStatusFilter = status;
  const statusRow = document.getElementById('statusFilterRow');
  statusRow.querySelectorAll('.filter-chip').forEach(chip => {
    if (chip.getAttribute('data-status') === status) {
      chip.classList.add('active');
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      chip.classList.remove('active');
    }
  });

  if (prevStatus !== currentStatusFilter) {
    currentCategoryFilter = 'all';
  }
  updateCategoryChipsForCurrentStatus();
  updateStats();
  renderColors();
}

function getActiveColorList() {
  if (currentStatusFilter === 'ohuhu') {
    return (typeof OHUHU_COLORS !== 'undefined') ? OHUHU_COLORS : [];
  }
  
  if (currentStatusFilter === 'al') {
    if (typeof DECOTIME_COLORS === 'undefined') return [];
    return DECOTIME_COLORS
      .filter(c => c.defaultAl || (userInventory[c.id] && userInventory[c.id].al))
      .map(c => ({ ...c, markerType: 'al' }));
  }

  if (currentStatusFilter === 'ac') {
    if (typeof DECOTIME_COLORS === 'undefined') return [];
    return DECOTIME_COLORS
      .filter(c => c.defaultAc || (userInventory[c.id] && userInventory[c.id].ac))
      .map(c => ({ ...c, markerType: 'ac' }));
  }

  // 'all': Twin + Acqua + Ohuhu
  const alColors = (typeof DECOTIME_COLORS !== 'undefined')
    ? DECOTIME_COLORS.filter(c => c.defaultAl || (userInventory[c.id] && userInventory[c.id].al)).map(c => ({ ...c, markerType: 'al' }))
    : [];
  const acColors = (typeof DECOTIME_COLORS !== 'undefined')
    ? DECOTIME_COLORS.filter(c => c.defaultAc || (userInventory[c.id] && userInventory[c.id].ac)).map(c => ({ ...c, markerType: 'ac' }))
    : [];
  const ohu = (typeof OHUHU_COLORS !== 'undefined') ? OHUHU_COLORS : [];
  return [...alColors, ...acColors, ...ohu];
}

// Filter Evaluation
function isColorMatching(c) {
  const isOhuhu = c.brand === 'ohuhu';
  const inv = userInventory[c.id] || { owned: true, notes: '' };

  if (isOhuhu) {
    // Ohuhu Category Filter
    if (currentCategoryFilter !== 'all') {
      if (currentCategoryFilter.startsWith('swatch-')) {
        const swNum = parseInt(currentCategoryFilter.replace('swatch-', ''), 10);
        if (c.swatch !== swNum) return false;
      } else {
        if (c.category !== currentCategoryFilter) return false;
      }
    }

    // Ohuhu Search
    if (currentSearchQuery) {
      const q = currentSearchQuery;
      const matchCode = c.code.toLowerCase().includes(q);
      const matchOld = (c.oldCode || '').toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchCat = c.category.toLowerCase().includes(q);
      const matchNotes = (inv.notes || '').toLowerCase().includes(q);
      if (!matchCode && !matchOld && !matchName && !matchCat && !matchNotes) return false;
    }

    return true;
  }

  // DecoTime (Twin or Acqua)
  // Category Filter
  if (currentCategoryFilter !== 'all') {
    if (currentCategoryFilter.startsWith('page-')) {
      const pageNum = parseInt(currentCategoryFilter.replace('page-', ''), 10);
      if (c.page !== pageNum) return false;
    } else if (currentCategoryFilter === 'new-only') {
      if (!c.isNew) return false;
    } else {
      if (c.category !== currentCategoryFilter) return false;
    }
  }

  // Search Query
  if (currentSearchQuery) {
    const q = currentSearchQuery;
    const matchCode = c.code.toLowerCase().includes(q);
    const matchName = c.name.toLowerCase().includes(q);
    const matchCat = c.category.toLowerCase().includes(q);
    const matchNotes = (inv.notes || '').toLowerCase().includes(q);
    if (!matchCode && !matchName && !matchCat && !matchNotes) return false;
  }

  return true;
}

// Render Color Cards
function renderColors() {
  const grid = document.getElementById('colorsGrid');
  const emptyState = document.getElementById('emptyState');
  grid.innerHTML = '';

  const activeColors = getActiveColorList();
  const filtered = activeColors.filter(isColorMatching);

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(c => {
    const isOhuhu = c.brand === 'ohuhu';
    const inv = userInventory[c.id] || (isOhuhu ? { owned: true, notes: '' } : { al: Boolean(c.defaultAl), ac: Boolean(c.defaultAc), notes: '' });

    const card = document.createElement('div');
    const isBlender = c.code === '0.5';

    if (isOhuhu) {
      const isOwned = (inv.owned !== undefined) ? inv.owned : true;
      card.className = \`color-card \${isOwned ? 'owned-ohuhu' : 'missing'}\`;
      card.id = \`card-\${c.id}\`;
      card.innerHTML = \`
        <div class="card-top" onclick="openDetailModal('\${c.id}', 'ohuhu')">
          <div class="swatch-circle" style="background-color: \${c.hex};"></div>
          <div class="card-info">
            <div class="card-code">
              <span>\${c.code}</span>
              \${c.oldCode ? \`<span class="old-code-badge" title="Vecchio codice: \${c.oldCode}">\${c.oldCode}</span>\` : ''}
              \${inv.notes ? '<span title="Ha note personali" style="font-size: 0.75rem;">📝</span>' : ''}
            </div>
            <div class="card-name" title="\${c.name}">\${c.name}</div>
            <div class="card-category">Swatch \${c.swatch} • \${c.category}</div>
          </div>
        </div>
        <div class="toggle-row">
          <button class="toggle-ohuhu \${isOwned ? 'active' : ''}" onclick="toggleOhuhuStatus('\${c.id}')">
            <span>🖍️</span> <span>\${isOwned ? '✓ Ohuhu' : 'Ohuhu'}</span>
          </button>
        </div>
      \`;
    } else if (c.markerType === 'al') {
      const isOwned = Boolean(inv.al);
      card.className = \`color-card \${isOwned ? 'owned-al' : 'missing'}\`;
      card.id = \`card-al-\${c.id}\`;
      card.innerHTML = \`
        <div class="card-top" onclick="openDetailModal('\${c.id}', 'al')">
          <div class="swatch-circle \${isBlender ? 'is-blender' : ''}" style="background-color: \${c.hex};"></div>
          <div class="card-info">
            <div class="card-code">
              <span>\${c.code}</span>
              \${c.isNew ? '<span class="new-badge">★ NEW</span>' : ''}
              \${inv.notes ? '<span title="Ha note personali" style="font-size: 0.75rem;">📝</span>' : ''}
            </div>
            <div class="card-name" title="\${c.name}">\${c.name}</div>
            <div class="card-category">Pag. \${c.page} • \${c.category}</div>
          </div>
        </div>
        <div class="toggle-row">
          <button class="toggle-twin \${isOwned ? 'active' : ''}" onclick="toggleMarkerStatus('\${c.id}', 'al')">
            <span>🖊️</span> <span>\${isOwned ? '✓ Twin Marker' : 'Twin Marker'}</span>
          </button>
        </div>
      \`;
    } else if (c.markerType === 'ac') {
      const isOwned = Boolean(inv.ac);
      card.className = \`color-card \${isOwned ? 'owned-ac' : 'missing'}\`;
      card.id = \`card-ac-\${c.id}\`;
      card.innerHTML = \`
        <div class="card-top" onclick="openDetailModal('\${c.id}', 'ac')">
          <div class="swatch-circle \${isBlender ? 'is-blender' : ''}" style="background-color: \${c.hex};"></div>
          <div class="card-info">
            <div class="card-code">
              <span>\${c.code}</span>
              \${c.isNew ? '<span class="new-badge">★ NEW</span>' : ''}
              \${inv.notes ? '<span title="Ha note personali" style="font-size: 0.75rem;">📝</span>' : ''}
            </div>
            <div class="card-name" title="\${c.name}">\${c.name}</div>
            <div class="card-category">Pag. \${c.page} • \${c.category}</div>
          </div>
        </div>
        <div class="toggle-row">
          <button class="toggle-acqua \${isOwned ? 'active' : ''}" onclick="toggleMarkerStatus('\${c.id}', 'ac')">
            <span>💧</span> <span>\${isOwned ? '✓ Acqua Marker' : 'Acqua Marker'}</span>
          </button>
        </div>
      \`;
    }

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

// Toggle Twin or Acqua Status
function toggleMarkerStatus(id, type) {
  if (!userInventory[id]) {
    userInventory[id] = { al: false, ac: false, notes: '' };
  }
  userInventory[id][type] = !userInventory[id][type];
  saveInventory();
  updateStats();
  updateCardElement(id, type);
  if (navigator.vibrate) navigator.vibrate(25);
}

// Toggle Ohuhu Status
function toggleOhuhuStatus(id) {
  if (!userInventory[id]) {
    userInventory[id] = { owned: true, notes: '' };
  }
  userInventory[id].owned = !userInventory[id].owned;
  saveInventory();
  updateStats();
  updateCardElement(id, 'ohuhu');
  if (navigator.vibrate) navigator.vibrate(25);
}

function updateCardElement(id, type) {
  const inv = userInventory[id] || {};
  if (type === 'ohuhu') {
    const card = document.getElementById(\`card-\${id}\`);
    if (!card) return;
    const isOwned = Boolean(inv.owned);
    card.className = \`color-card \${isOwned ? 'owned-ohuhu' : 'missing'}\`;
    const btn = card.querySelector('.toggle-ohuhu');
    if (btn) {
      btn.className = \`toggle-ohuhu \${isOwned ? 'active' : ''}\`;
      btn.innerHTML = \`<span>🖍️</span> <span>\${isOwned ? '✓ Ohuhu' : 'Ohuhu'}</span>\`;
    }
  } else if (type === 'al') {
    const card = document.getElementById(\`card-al-\${id}\`);
    if (!card) return;
    const isOwned = Boolean(inv.al);
    card.className = \`color-card \${isOwned ? 'owned-al' : 'missing'}\`;
    const btn = card.querySelector('.toggle-twin');
    if (btn) {
      btn.className = \`toggle-twin \${isOwned ? 'active' : ''}\`;
      btn.innerHTML = \`<span>🖊️</span> <span>\${isOwned ? '✓ Twin Marker' : 'Twin Marker'}</span>\`;
    }
  } else if (type === 'ac') {
    const card = document.getElementById(\`card-ac-\${id}\`);
    if (!card) return;
    const isOwned = Boolean(inv.ac);
    card.className = \`color-card \${isOwned ? 'owned-ac' : 'missing'}\`;
    const btn = card.querySelector('.toggle-acqua');
    if (btn) {
      btn.className = \`toggle-acqua \${isOwned ? 'active' : ''}\`;
      btn.innerHTML = \`<span>💧</span> <span>\${isOwned ? '✓ Acqua Marker' : 'Acqua Marker'}</span>\`;
    }
  }
}

// Update Stats Dashboard
function updateStats() {
  let countAl = 0;
  let countAc = 0;
  if (typeof DECOTIME_COLORS !== 'undefined') {
    DECOTIME_COLORS.forEach(c => {
      const inv = userInventory[c.id];
      if (inv) {
        if (inv.al) countAl++;
        if (inv.ac) countAc++;
      } else {
        if (c.defaultAl) countAl++;
        if (c.defaultAc) countAc++;
      }
    });
  }

  let countOhuhu = 0;
  if (typeof OHUHU_COLORS !== 'undefined') {
    OHUHU_COLORS.forEach(c => {
      const inv = userInventory[c.id];
      if (inv && inv.owned) countOhuhu++;
      else if (!inv) countOhuhu++;
    });
  }

  const countTot = countAl + countAc + countOhuhu;
  const totPossible = 175 + 109 + 320; // 604

  const alEl = document.getElementById('statAlCount');
  if (alEl) alEl.textContent = countAl;

  const acEl = document.getElementById('statAcCount');
  if (acEl) acEl.textContent = countAc;

  const ohuhuEl = document.getElementById('statOhuhuCount');
  if (ohuhuEl) ohuhuEl.textContent = countOhuhu;

  const totEl = document.getElementById('statTotCount');
  if (totEl) totEl.textContent = countTot;

  const alChip = document.querySelector('#statusFilterRow .filter-chip[data-status="al"]');
  if (alChip) alChip.textContent = \`🖊️ Twin Marker (\${countAl})\`;

  const acChip = document.querySelector('#statusFilterRow .filter-chip[data-status="ac"]');
  if (acChip) acChip.textContent = \`💧 Acqua Marker (\${countAc})\`;

  const ohuhuChip = document.querySelector('#statusFilterRow .filter-chip[data-status="ohuhu"]');
  if (ohuhuChip) ohuhuChip.textContent = \`🖍️ Ohuhu Marker (\${countOhuhu})\`;

  const allChip = document.querySelector('#statusFilterRow .filter-chip[data-status="all"]');
  if (allChip) allChip.textContent = \`🌈 Tutti i Colori (\${countTot})\`;

  let pct = 100;
  if (currentStatusFilter === 'ohuhu') {
    pct = Math.round((countOhuhu / 320) * 100);
  } else if (currentStatusFilter === 'al') {
    pct = Math.round((countAl / 175) * 100);
  } else if (currentStatusFilter === 'ac') {
    pct = Math.round((countAc / 109) * 100);
  } else {
    pct = Math.round((countTot / totPossible) * 100);
  }

  const progFill = document.getElementById('progressFill');
  if (progFill) progFill.style.width = \`\${pct}%\`;
}

// Modal Handlers
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('open');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('open');
}

function closeOnOverlay(e, modalId) {
  if (e.target === e.currentTarget) {
    closeModal(modalId);
  }
}

// Color Detail Modal
function openDetailModal(id, type) {
  activeDetailId = id;
  activeDetailType = type;
  const isOhuhu = type === 'ohuhu';

  let c = null;
  if (isOhuhu) {
    c = (typeof OHUHU_COLORS !== 'undefined') ? OHUHU_COLORS.find(item => item.id === id) : null;
  } else {
    c = DECOTIME_COLORS.find(item => item.id === id);
  }
  if (!c) return;

  const inv = userInventory[id] || (isOhuhu ? { owned: true, notes: '' } : { al: Boolean(c.defaultAl), ac: Boolean(c.defaultAc), notes: '' });

  const swatch = document.getElementById('detailSwatch');
  swatch.style.backgroundColor = c.hex;
  if (c.code === '0.5') {
    swatch.style.background = 'repeating-conic-gradient(#e0e0e0 0% 25%, #ffffff 0% 50%) 50% / 15px 15px';
  } else {
    swatch.style.background = c.hex;
  }

  const twinToggles = document.getElementById('modalTwinToggles');
  const acquaToggles = document.getElementById('modalAcquaToggles');
  const ohuhuToggles = document.getElementById('modalOhuhuToggles');

  if (isOhuhu) {
    document.getElementById('detailTitle').textContent = \`\${c.code} - \${c.name} \${c.oldCode ? '(' + c.oldCode + ')' : ''}\`;
    document.getElementById('detailSubtitle').textContent = \`Ohuhu Oahu 320 • Swatch \${c.swatch} • \${c.category} • Hex: \${c.hex}\`;
    if (twinToggles) twinToggles.style.display = 'none';
    if (acquaToggles) acquaToggles.style.display = 'none';
    if (ohuhuToggles) {
      ohuhuToggles.style.display = 'flex';
      const isOwned = Boolean(inv.owned);
      const btnO = document.getElementById('modalToggleOhuhu');
      btnO.className = \`toggle-ohuhu \${isOwned ? 'active' : ''}\`;
      btnO.innerHTML = \`<span>🖍️</span> <span>\${isOwned ? '✓ Posseduto (Ohuhu Oahu 320)' : 'Non Posseduto'}</span>\`;
    }
  } else if (type === 'al') {
    document.getElementById('detailTitle').textContent = \`\${c.code} - \${c.name} \${c.isNew ? '★' : ''}\`;
    document.getElementById('detailSubtitle').textContent = \`Twin Marker (Alcool) • Pagina \${c.page} • \${c.category} • Hex: \${c.hex}\`;
    if (twinToggles) {
      twinToggles.style.display = 'flex';
      const isOwned = Boolean(inv.al);
      const btnT = document.getElementById('modalToggleTwin');
      if (btnT) {
        btnT.className = \`toggle-twin \${isOwned ? 'active' : ''}\`;
        btnT.innerHTML = \`<span>🖊️</span> <span>\${isOwned ? '✓ Posseduto (Twin Marker)' : 'Non Posseduto'}</span>\`;
      }
    }
    if (acquaToggles) acquaToggles.style.display = 'none';
    if (ohuhuToggles) ohuhuToggles.style.display = 'none';
  } else if (type === 'ac') {
    document.getElementById('detailTitle').textContent = \`\${c.code} - \${c.name} \${c.isNew ? '★' : ''}\`;
    document.getElementById('detailSubtitle').textContent = \`Acqua Marker (Acqua) • Pagina \${c.page} • \${c.category} • Hex: \${c.hex}\`;
    if (twinToggles) twinToggles.style.display = 'none';
    if (acquaToggles) {
      acquaToggles.style.display = 'flex';
      const isOwned = Boolean(inv.ac);
      const btnA = document.getElementById('modalToggleAcqua');
      if (btnA) {
        btnA.className = \`toggle-acqua \${isOwned ? 'active' : ''}\`;
        btnA.innerHTML = \`<span>💧</span> <span>\${isOwned ? '✓ Posseduto (Acqua Marker)' : 'Non Posseduto'}</span>\`;
      }
    }
    if (ohuhuToggles) ohuhuToggles.style.display = 'none';
  }

  document.getElementById('detailNotes').value = inv.notes || '';
  openModal('detailModal');
}

function toggleDetailStatus(type) {
  if (!activeDetailId || activeDetailId.startsWith('ohuhu_')) return;
  toggleMarkerStatus(activeDetailId, type);
  const inv = userInventory[activeDetailId] || {};
  if (type === 'al') {
    const isOwned = Boolean(inv.al);
    const btnT = document.getElementById('modalToggleTwin');
    if (btnT) {
      btnT.className = \`toggle-twin \${isOwned ? 'active' : ''}\`;
      btnT.innerHTML = \`<span>🖊️</span> <span>\${isOwned ? '✓ Posseduto (Twin Marker)' : 'Non Posseduto'}</span>\`;
    }
  } else if (type === 'ac') {
    const isOwned = Boolean(inv.ac);
    const btnA = document.getElementById('modalToggleAcqua');
    if (btnA) {
      btnA.className = \`toggle-acqua \${isOwned ? 'active' : ''}\`;
      btnA.innerHTML = \`<span>💧</span> <span>\${isOwned ? '✓ Posseduto (Acqua Marker)' : 'Non Posseduto'}</span>\`;
    }
  }
}

function toggleDetailOhuhuStatus() {
  if (!activeDetailId || !activeDetailId.startsWith('ohuhu_')) return;
  toggleOhuhuStatus(activeDetailId);
  const inv = userInventory[activeDetailId] || { owned: true };
  const isOwned = Boolean(inv.owned);
  const btnO = document.getElementById('modalToggleOhuhu');
  btnO.className = \`toggle-ohuhu \${isOwned ? 'active' : ''}\`;
  btnO.innerHTML = \`<span>🖍️</span> <span>\${isOwned ? '✓ Posseduto (Ohuhu Oahu 320)' : 'Non Posseduto'}</span>\`;
}

function saveDetailNotes() {
  if (!activeDetailId) return;
  const notes = document.getElementById('detailNotes').value.trim();
  if (!userInventory[activeDetailId]) {
    userInventory[activeDetailId] = { notes: '' };
  }
  userInventory[activeDetailId].notes = notes;
  saveInventory();
  renderColors();
  closeModal('detailModal');
  showToast('Note salvate con successo!');
}

// Wishlist (Lista Spesa)
let currentWishlistMode = 'al';

function openWishlistModal() {
  updateWishlistText(currentWishlistMode);
  openModal('wishlistModal');
}

function updateWishlistText(mode) {
  currentWishlistMode = mode;
  ['wlFilterTwin', 'wlFilterAcqua', 'wlFilterOhuhu', 'wlFilterAll'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (mode === 'al' && document.getElementById('wlFilterTwin')) document.getElementById('wlFilterTwin').classList.add('active');
  if (mode === 'ac' && document.getElementById('wlFilterAcqua')) document.getElementById('wlFilterAcqua').classList.add('active');
  if (mode === 'ohuhu' && document.getElementById('wlFilterOhuhu')) document.getElementById('wlFilterOhuhu').classList.add('active');
  if (mode === 'all' && document.getElementById('wlFilterAll')) document.getElementById('wlFilterAll').classList.add('active');

  const missingList = [];

  if (mode === 'al' || mode === 'all') {
    DECOTIME_COLORS.filter(c => c.defaultAl).forEach(c => {
      const inv = userInventory[c.id];
      const isOwned = inv ? Boolean(inv.al) : true;
      if (!isOwned) {
        missingList.push(\`[Twin Marker] \${c.code.padEnd(5, ' ')} - \${c.name} (Pag. \${c.page})\`);
      }
    });
  }

  if (mode === 'ac' || mode === 'all') {
    DECOTIME_COLORS.filter(c => c.defaultAc).forEach(c => {
      const inv = userInventory[c.id];
      const isOwned = inv ? Boolean(inv.ac) : true;
      if (!isOwned) {
        missingList.push(\`[Acqua Marker] \${c.code.padEnd(5, ' ')} - \${c.name} (Pag. \${c.page})\`);
      }
    });
  }

  if (mode === 'ohuhu' || mode === 'all') {
    if (typeof OHUHU_COLORS !== 'undefined') {
      OHUHU_COLORS.forEach(c => {
        const inv = userInventory[c.id];
        const isOwned = inv ? Boolean(inv.owned) : true;
        if (!isOwned) {
          missingList.push(\`[Ohuhu] \${c.code.padEnd(6, ' ')} - \${c.name} (Swatch \${c.swatch})\`);
        }
      });
    }
  }

  const header = mode === 'al'
    ? \`🛍️ MANCANTI TWIN MARKER (\${missingList.length} colori):\\n\`
    : mode === 'ac'
    ? \`💧 MANCANTI ACQUA MARKER (\${missingList.length} colori):\\n\`
    : mode === 'ohuhu'
    ? \`🖍️ MANCANTI OHUHU OAHU 320 (\${missingList.length} colori):\\n\`
    : \`🌈 TUTTI I COLORI MANCANTI (\${missingList.length} colori):\\n\`;

  const content = missingList.length > 0 ? header + '\\n' + missingList.join('\\n') : 'Complimenti! Hai tutti i colori di questa collezione! 🎉';
  document.getElementById('wishlistText').textContent = content;
}

function copyWishlistToClipboard() {
  const text = document.getElementById('wishlistText').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Lista copiata negli appunti!');
  }).catch(() => {
    showToast('Seleziona il testo per copiare');
  });
}

// Stats Modal
function openStatsModal() {
  let alCount = 0;
  let acCount = 0;
  DECOTIME_COLORS.forEach(c => {
    const inv = userInventory[c.id];
    if (inv ? inv.al : c.defaultAl) alCount++;
    if (inv ? inv.ac : c.defaultAc) acCount++;
  });

  let ohuhuOwned = 0;
  const swatchStats = { 1: 0, 2: 0, 3: 0, 4: 0 };
  if (typeof OHUHU_COLORS !== 'undefined') {
    OHUHU_COLORS.forEach(c => {
      const inv = userInventory[c.id];
      const isOwned = (inv && inv.owned !== undefined) ? inv.owned : true;
      if (isOwned) {
        ohuhuOwned++;
        swatchStats[c.swatch]++;
      }
    });
  }

  let html = \`
    <div style="background:#fff5f7; padding:12px; border-radius:12px; margin-bottom:14px; border:1px solid #ffd1dc;">
      <h3 style="margin-bottom:8px; color: var(--al-color);">🖊️ Twin Marker (Alcool)</h3>
      <div>🎨 Colori nella tua lista: <b>175</b></div>
      <div>✓ Posseduti: <b>\${alCount} / 175</b> (<b>\${Math.round((alCount/175)*100)}%</b>)</div>
    </div>

    <div style="background:#f0fbff; padding:12px; border-radius:12px; margin-bottom:14px; border:1px solid #bcebf2;">
      <h3 style="margin-bottom:8px; color: var(--ac-color);">💧 Acqua Marker (Acqua)</h3>
      <div>🎨 Colori nella tua lista: <b>109</b></div>
      <div>✓ Posseduti: <b>\${acCount} / 109</b> (<b>\${Math.round((acCount/109)*100)}%</b>)</div>
    </div>

    <div style="background:#fbf7ff; padding:12px; border-radius:12px; margin-bottom:14px; border:1px solid #d1c4e9;">
      <h3 style="margin-bottom:8px; color: #6a1b9a;">🖍️ Ohuhu Oahu 320</h3>
      <div>🎨 Colori totali nel set: <b>320</b></div>
      <div>✓ Posseduti: <b>\${ohuhuOwned} / 320</b> (<b>\${Math.round((ohuhuOwned/320)*100)}%</b>)</div>
      <div style="margin-top:6px; font-size: 0.85rem; color: #555;">
        📄 Swatch 1: <b>\${swatchStats[1]}/80</b> • Swatch 2: <b>\${swatchStats[2]}/80</b><br>
        📄 Swatch 3: <b>\${swatchStats[3]}/80</b> • Swatch 4: <b>\${swatchStats[4]}/80</b>
      </div>
    </div>

    <div style="background:#f0fff4; padding:12px; border-radius:12px; margin-bottom:14px; border:1px solid #c6f6d5;">
      <h3 style="margin-bottom:8px; color: #276749;">⭐ Totale Complessivo</h3>
      <div>🌈 Pennarelli posseduti: <b>\${alCount + acCount + ohuhuOwned} / 604</b> (<b>\${Math.round(((alCount + acCount + ohuhuOwned)/604)*100)}%</b>)</div>
    </div>
  \`;

  document.getElementById('statsFullDetails').innerHTML = html;
  openModal('statsModal');
}

// Options Modal Handlers
function openOptionsModal() {
  openModal('optionsModal');
}

function openInstallGuide() {
  openModal('installGuideModal');
}

function loadOriginalMarkings() {
  if (confirm('Vuoi ricaricare tutti i colori dalle tue schede? Le modifiche personali non salvate verranno ripristinate.')) {
    initFromPhotoMarkings();
    renderColors();
    updateStats();
    showToast('Colori ripristinati dalle foto!');
    closeModal('optionsModal');
  }
}

function exportBackup() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userInventory, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  const now = new Date().toISOString().slice(0, 10);
  dlAnchor.setAttribute('download', \`decotime_ohuhu_backup_\${now}.json\`);
  dlAnchor.click();
  showToast('Backup salvato sul dispositivo!');
}

function triggerImportBackup() {
  document.getElementById('backupFileInput').click();
}

function importBackupFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (typeof imported === 'object' && imported !== null) {
        userInventory = imported;
        saveInventory();
        renderColors();
        updateStats();
        showToast('Backup importato con successo!');
        closeModal('optionsModal');
      } else {
        showToast('File backup non valido', '⚠️');
      }
    } catch (err) {
      showToast('Errore lettura file backup', '⚠️');
    }
  };
  reader.readAsText(file);
}

function confirmResetAll() {
  if (confirm('ATTENZIONE: Sei sicura di voler cancellare tutte le spunte?')) {
    userInventory = {};
    saveInventory();
    renderColors();
    updateStats();
    showToast('Tutte le spunte sono state azzerate');
    closeModal('optionsModal');
  }
}

// Toast Notifications
let toastTimer = null;
function showToast(msg, icon = '✅') {
  const toast = document.getElementById('toast');
  const iconEl = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');

  if (iconEl) iconEl.textContent = icon;
  if (msgEl) msgEl.textContent = msg;

  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// Wi-Fi Local Synchronization
const SYNC_SERVER_STORAGE_KEY = 'decotime_sync_server_url';
const SYNC_TIMESTAMP_KEY = 'decotime_sync_last_timestamp';

let syncServerUrl = localStorage.getItem(SYNC_SERVER_STORAGE_KEY) || (window.location.protocol.startsWith('http') ? window.location.origin : 'http://192.168.1.11:8080');
let lastKnownServerTimestamp = localStorage.getItem(SYNC_TIMESTAMP_KEY) || null;
let isSyncing = false;
let syncIntervalTimer = null;

function initSync() {
  const input = document.getElementById('syncServerInput');
  if (input) input.value = syncServerUrl;

  checkAndSyncWithServer(false);
  if (syncIntervalTimer) clearInterval(syncIntervalTimer);
  syncIntervalTimer = setInterval(() => {
    checkAndSyncWithServer(false);
  }, 10000);
}

function updateSyncUI(status, message) {
  const badge = document.getElementById('syncBadgeStatus');
  const icon = document.getElementById('syncIndicatorIcon');
  const lastInfo = document.getElementById('syncLastInfo');

  if (!badge) return;

  if (status === 'synced') {
    badge.textContent = 'Wi-Fi Connesso';
    badge.style.background = '#28a745';
    if (icon) icon.textContent = '🟢';
    if (lastInfo && message) lastInfo.textContent = message;
  } else if (status === 'syncing') {
    badge.textContent = 'In sincronizzazione...';
    badge.style.background = '#ffc107';
    badge.style.color = '#333';
    if (icon) icon.textContent = '🟡';
  } else if (status === 'offline') {
    badge.textContent = 'Non connesso al PC';
    badge.style.background = '#dc3545';
    badge.style.color = '#fff';
    if (icon) icon.textContent = '⚪';
    if (lastInfo) lastInfo.textContent = 'Modalità Offline (i dati restano salvati in locale)';
  }
}

async function checkAndSyncWithServer(showToastFeedback = false) {
  if (isSyncing || !syncServerUrl) return;
  isSyncing = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(\`\${syncServerUrl}/api/inventory\`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.inventory) {
        if (!lastKnownServerTimestamp || new Date(data.lastUpdated) > new Date(lastKnownServerTimestamp)) {
          lastKnownServerTimestamp = data.lastUpdated;
          localStorage.setItem(SYNC_TIMESTAMP_KEY, lastKnownServerTimestamp);
          
          let hasNewData = false;
          for (let key in data.inventory) {
            if (!userInventory[key] || JSON.stringify(userInventory[key]) !== JSON.stringify(data.inventory[key])) {
              userInventory[key] = data.inventory[key];
              hasNewData = true;
            }
          }

          if (hasNewData) {
            saveInventoryLocal();
            renderColors();
            updateStats();
            if (showToastFeedback) {
              showToast('Dati sincronizzati col PC!');
            }
          }
        }
        updateSyncUI('synced', \`Sincronizzato: \${new Date().toLocaleTimeString()}\`);
      }
    } else {
      updateSyncUI('offline');
    }
  } catch (err) {
    updateSyncUI('offline');
  } finally {
    isSyncing = false;
  }
}

let pushDebounceTimer = null;
function pushInventoryToServer() {
  if (!syncServerUrl) return;

  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(async () => {
    try {
      const payload = {
        lastUpdated: new Date().toISOString(),
        inventory: userInventory
      };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(\`\${syncServerUrl}/api/inventory\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        lastKnownServerTimestamp = payload.lastUpdated;
        localStorage.setItem(SYNC_TIMESTAMP_KEY, lastKnownServerTimestamp);
        updateSyncUI('synced', \`Aggiornato: \${new Date().toLocaleTimeString()}\`);
      } else {
        updateSyncUI('offline');
      }
    } catch (err) {
      updateSyncUI('offline');
    }
  }, 300);
}

function triggerManualSync() {
  updateSyncUI('syncing');
  showToast('Sincronizzazione in corso...', '🔄');
  const payload = {
    lastUpdated: new Date().toISOString(),
    inventory: userInventory
  };

  fetch(\`\${syncServerUrl}/api/inventory\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(() => {
    checkAndSyncWithServer(true);
    showToast('Sincronizzazione completata!', '🟢');
  })
  .catch(() => {
    checkAndSyncWithServer(true);
  });
}

function saveSyncServerAndSync() {
  const input = document.getElementById('syncServerInput');
  if (input && input.value.trim()) {
    let val = input.value.trim();
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      val = 'http://' + val;
    }
    syncServerUrl = val;
    localStorage.setItem(SYNC_SERVER_STORAGE_KEY, syncServerUrl);
    triggerManualSync();
  }
}
`;

fs.writeFileSync('decotime-tracker/app.js', appContent, 'utf8');
console.log('decotime-tracker/app.js written successfully!');
