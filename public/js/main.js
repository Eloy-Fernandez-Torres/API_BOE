// ─── Referencias al DOM ──────────────────────────────────────────────────────
const searchForm    = document.getElementById('searchForm');
const loadingEl     = document.getElementById('loading');
const errorEl       = document.getElementById('error');
const errorTextEl   = document.getElementById('errorText');
const mainContent   = document.getElementById('mainContent');
const noResultsEl   = document.getElementById('noResults');
const resultsListEl = document.getElementById('resultsList');
const resultCountEl = document.getElementById('resultCount');
const clearBtn      = document.getElementById('clearFilters');
const roleSelector  = document.getElementById('roleSelector');
const roleNoticeEl  = document.getElementById('roleNotice');
const keywordEl     = document.getElementById('keyword');
const diasAtrasEl   = document.getElementById('diasAtras');
const sectorFilterGroupEl = document.getElementById('sectorFilterGroup');
const tipoFilterGroupEl   = document.getElementById('tipoFilterGroup');
const resultsSectionEl    = document.querySelector('.results-section');
const paginationEl        = document.getElementById('pagination');
const themeToggleEl       = document.getElementById('themeToggle');

const THEME_STORAGE_KEY = 'boe_finder_theme';
const customSelectInstances = new Map();

// ─── Select UI: center selected value without shifting dropdown ───────────────
function setupClosedCenteredSelect(selectEl) {
  if (!selectEl) return;

  // Keep a fixed visual state so clicking only opens the native dropdown.
  selectEl.classList.add('is-closed');
}

setupClosedCenteredSelect(roleSelector);
setupClosedCenteredSelect(diasAtrasEl);

function closeAllCustomSelects(exceptSelectId = null) {
  customSelectInstances.forEach((instance, selectId) => {
    if (exceptSelectId && selectId === exceptSelectId) return;
    instance.root.classList.remove('is-open');
  });
}

function refreshCustomSelect(selectEl) {
  if (!selectEl) return;
  const instance = customSelectInstances.get(selectEl.id);
  if (!instance) return;

  const { trigger, menu } = instance;
  const availableOptions = [...selectEl.options].filter(opt => !opt.hidden);
  menu.innerHTML = '';

  availableOptions.forEach(opt => {
    const li = document.createElement('li');
    li.className = 'custom-select-option';
    li.textContent = opt.textContent;
    li.dataset.value = opt.value;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(opt.value === selectEl.value));
    if (opt.disabled) li.classList.add('is-disabled');
    if (opt.value === selectEl.value) li.classList.add('is-selected');

    li.addEventListener('click', () => {
      if (opt.disabled) return;
      selectEl.value = opt.value;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      closeAllCustomSelects();
    });
    menu.appendChild(li);
  });

  const selectedOpt = selectEl.options[selectEl.selectedIndex];
  trigger.textContent = selectedOpt ? selectedOpt.textContent : '';
  trigger.classList.toggle('is-disabled', Boolean(selectEl.disabled));
}

function initCustomSelect(selectEl) {
  if (!selectEl || customSelectInstances.has(selectEl.id)) return;

  selectEl.classList.add('native-select-hidden');

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';
  wrapper.dataset.for = selectEl.id;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('ul');
  menu.className = 'custom-select-menu';
  menu.setAttribute('role', 'listbox');

  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);
  selectEl.insertAdjacentElement('afterend', wrapper);

  customSelectInstances.set(selectEl.id, { root: wrapper, trigger, menu });
  refreshCustomSelect(selectEl);

  trigger.addEventListener('click', () => {
    if (selectEl.disabled) return;
    const isOpen = wrapper.classList.contains('is-open');
    closeAllCustomSelects(selectEl.id);
    wrapper.classList.toggle('is-open', !isOpen);
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });

  selectEl.addEventListener('change', () => refreshCustomSelect(selectEl));
}

function initCustomSelects() {
  initCustomSelect(roleSelector);
  initCustomSelect(diasAtrasEl);
}

document.addEventListener('click', event => {
  if (event.target.closest('.custom-select')) return;
  closeAllCustomSelects();
});

function resolveApiBaseUrl() {
  if (window.API_BASE_URL) return String(window.API_BASE_URL).replace(/\/$/, '');
  if (window.location.hostname === 'localhost' && window.location.port === '5500') {
    return 'http://localhost:3000';
  }
  return '';
}

const API_BASE_URL = resolveApiBaseUrl();

function buildApiUrl(pathWithQuery) {
  return `${API_BASE_URL}${pathWithQuery}`;
}

async function parseApiResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error('La URL de la API no responde en este puerto. Arranca el backend en http://localhost:3000.');
  }

  throw new Error(`Respuesta no válida del servidor: ${text.slice(0, 80)}...`);
}

// Use static lists for filters (user requested). Set to false to fallback to dynamic population.
const USE_STATIC_FILTERS = true;

// Representative static lists of BOE sectors and types. Editable if you want additions.
const BOE_STATIC_SECTORES = [
  'Administración General del Estado',
  'Agricultura, Pesca y Alimentación',
  'Cultura y Deporte',
  'Defensa',
  'Educación y Formación Profesional',
  'Economía y Empresa',
  'Empleo y Seguridad Social',
  'Industria, Comercio y Turismo',
  'Interior',
  'Justicia',
  'Sanidad',
  'Transporte, Movilidad y Agenda Urbana',
  'Medio Ambiente',
  'Ciencia e Innovación',
  'Energía',
  'Política Territorial',
  'Servicios Sociales',
  'Vivienda',
  'Finanzas',
  'Trabajo',
  'Turismo'
];

const BOE_STATIC_TIPOS = [
  'Subvención', 'Ayuda', 'Beca', 'Convocatoria', 'Concesión', 'Extracto', 'Orden',
  'Real Decreto', 'Resolución', 'Acuerdo', 'Circular', 'Instrucción', 'Incentivo',
  'Premio', 'Contrato', 'Licitación', 'Convocatoria pública', 'Convocatoria de ayuda'
];

const SECTOR_KEYWORDS = {
  'Administración General del Estado': ['administracion general del estado', 'ministerio', 'secretaria de estado'],
  'Agricultura, Pesca y Alimentación': ['agricultura', 'pesca', 'alimentacion', 'agrario', 'ganaderia'],
  'Cultura y Deporte': ['cultura', 'deporte', 'deportivo', 'patrimonio cultural'],
  'Defensa': ['defensa', 'militar', 'fuerzas armadas', 'ejercito'],
  'Educación y Formación Profesional': ['educacion', 'formacion profesional', 'universidad', 'beca'],
  'Economía y Empresa': ['economia', 'empresa', 'pymes', 'emprendimiento'],
  'Empleo y Seguridad Social': ['empleo', 'seguridad social', 'trabajo', 'laboral'],
  'Industria, Comercio y Turismo': ['industria', 'comercio', 'turismo', 'comercial', 'industrial'],
  'Interior': ['interior', 'policia', 'guardia civil', 'proteccion civil'],
  'Justicia': ['justicia', 'judicial', 'fiscalia', 'tribunal'],
  'Sanidad': ['sanidad', 'salud', 'sanitario', 'hospital'],
  'Transporte, Movilidad y Agenda Urbana': ['transporte', 'movilidad', 'agenda urbana', 'ferrocarril', 'carretera'],
  'Medio Ambiente': ['medio ambiente', 'ambiental', 'sostenibilidad', 'ecosistema'],
  'Ciencia e Innovación': ['ciencia', 'innovacion', 'investigacion', 'i+d'],
  'Energía': ['energia', 'energetico', 'electrico', 'renovable'],
  'Política Territorial': ['politica territorial', 'territorial', 'cohesion territorial'],
  'Servicios Sociales': ['servicios sociales', 'social', 'inclusion', 'dependencia'],
  'Vivienda': ['vivienda', 'habitacion', 'alquiler', 'inmueble'],
  'Finanzas': ['finanzas', 'financiero', 'tributario', 'fiscal'],
  'Trabajo': ['trabajo', 'laboral', 'empleo'],
  'Turismo': ['turismo', 'turistico']
};

// ─── Estado ───────────────────────────────────────────────────────────────────
let allAyudas = [];
let filteredAyudas = [];
let currentRole = roleSelector?.value || 'estandar';
let currentPage = 1;
const RESULTS_PER_PAGE = 8;

const ROLE_CAPABILITIES = {
  estandar: {
    label: 'Versión estándar',
    maxDays: 7,
    allowKeywordSearch: true,
    allowSectorFilter: false,
    allowTipoFilter: true
  },
  pro: {
    label: 'Versión pro',
    maxDays: 14,
    allowKeywordSearch: true,
    allowSectorFilter: true,
    allowTipoFilter: true
  },
  creador: {
    label: 'Versión creador',
    maxDays: 30,
    allowKeywordSearch: true,
    allowSectorFilter: true,
    allowTipoFilter: true
  }
};

// ─── Eventos ──────────────────────────────────────────────────────────────────
searchForm.addEventListener('submit', async e => { e.preventDefault(); await buscar(); });
clearBtn.addEventListener('click', limpiarFiltros);
roleSelector.addEventListener('change', onRoleChanged);

function getRoleCapabilities() {
  return ROLE_CAPABILITIES[currentRole] || ROLE_CAPABILITIES.estandar;
}

function onRoleChanged() {
  currentRole = roleSelector.value;
  limpiarFiltros();
  applyRoleAccessUI();
}

function applyRoleAccessUI() {
  const role = getRoleCapabilities();
  const diasValue = parseInt(diasAtrasEl.value, 10) || 7;

  keywordEl.disabled = !role.allowKeywordSearch;
  if (!role.allowKeywordSearch) keywordEl.value = '';

  sectorFilterGroupEl.hidden = !role.allowSectorFilter;
  tipoFilterGroupEl.hidden = !role.allowTipoFilter;

  [...diasAtrasEl.options].forEach(opt => {
    const dias = parseInt(opt.value, 10);
    const isAllowed = dias <= role.maxDays;
    opt.disabled = !isAllowed;
    opt.hidden = !isAllowed;
  });
  if (diasValue > role.maxDays) diasAtrasEl.value = String(role.maxDays);
  refreshCustomSelect(diasAtrasEl);
  refreshCustomSelect(roleSelector);

  roleNoticeEl.textContent = `${role.label}: acceso ${role.allowKeywordSearch ? 'avanzado' : 'básico'} con hasta ${role.maxDays} días de búsqueda.`;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function sectorMatches(ayuda, selectedSector) {
  const sectorNorm = normalizeText(selectedSector);
  const depNorm = normalizeText(ayuda.departamento);
  const haystack = normalizeText(`${ayuda.departamento} ${ayuda.seccion} ${ayuda.titulo} ${ayuda.descripcion}`);

  if (depNorm && (depNorm.includes(sectorNorm) || sectorNorm.includes(depNorm))) return true;
  if (haystack.includes(sectorNorm)) return true;

  const keywords = SECTOR_KEYWORDS[selectedSector] || [];
  return keywords.some(kw => haystack.includes(normalizeText(kw)));
}

// ─── Búsqueda principal ───────────────────────────────────────────────────────
async function buscar() {
  const role = getRoleCapabilities();
  const q    = role.allowKeywordSearch ? keywordEl.value.trim() : '';
  const dias = diasAtrasEl.value;

  resetUI();
  show(loadingEl);
  loadingEl.textContent = `Consultando el BOE de los últimos ${dias} días...`;

  try {
    if (resultsSectionEl) show(resultsSectionEl);

    const params = new URLSearchParams({ dias, role: currentRole });
    if (q) params.set('q', q);

    const res  = await fetch(buildApiUrl(`/api/ayudas/buscar?${params}`), {
      headers: { 'x-user-role': currentRole }
    });
    const json = await parseApiResponse(res);

    if (!res.ok) throw new Error(json.error || 'Error del servidor');

    allAyudas = json.data || [];

    if (allAyudas.length === 0) {
      show(noResultsEl);
      return;
    }

    // If using static filters, do not overwrite them with the per-search values
    if (!USE_STATIC_FILTERS) {
      construirFiltros(allAyudas);
    }
    aplicarFiltros();
    show(mainContent);
  } catch (err) {
    mostrarError(err.message);
  } finally {
    hide(loadingEl);
  }
}

// ─── Construir checkboxes de filtro dinámicamente ─────────────────────────────
  function construirFiltros(ayudas) {
    const sectores = unique(ayudas.map(a => a.departamento)).filter(Boolean).sort();
    const tipos    = unique(ayudas.map(a => a.tipo)).filter(Boolean).sort();

    // Renderizar como selects (desplegables)
    renderSelect('sectorFilters', 'sector', sectores, 'Elige...');
    renderSelect('tipoFilters',   'tipo',   tipos,    'Elige...');
  }

  function renderSelect(containerId, filterKey, values, placeholder) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const select = document.createElement('select');
    select.dataset.filter = filterKey;
    select.id = `${filterKey}Select`;
    select.className = 'filter-select';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = String(placeholder || 'Todos').toUpperCase();
    select.appendChild(defaultOpt);

    values.forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = String(val).toUpperCase();
      select.appendChild(opt);
    });

  const syncPlaceholderState = () => {
    select.classList.toggle('is-placeholder', !select.value);
  };

  syncPlaceholderState();
  select.addEventListener('change', () => {
    syncPlaceholderState();
    aplicarFiltros();
  });
    container.appendChild(select);
    initCustomSelect(select);
    refreshCustomSelect(select);
  }

function renderCheckboxes(containerId, filterKey, values) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  values.forEach(val => {
    const label = document.createElement('label');
    const cb    = document.createElement('input');
    cb.type           = 'checkbox';
    cb.dataset.filter = filterKey;
    cb.value          = val;
    cb.addEventListener('change', aplicarFiltros);
    label.appendChild(cb);
    label.append(' ' + val);
    container.appendChild(label);
  });
}

// ─── Aplicar filtros ──────────────────────────────────────────────────────────
function aplicarFiltros() {
  const role = getRoleCapabilities();
  const deptos   = role.allowSectorFilter ? getFilterValues('sector') : [];
  const tipos    = role.allowTipoFilter ? getFilterValues('tipo') : [];

  const filtradas = allAyudas.filter(a => {
    const tipoNorm = normalizeText(a.tipo);
    const tipoHaystack = normalizeText(`${a.tipo} ${a.titulo} ${a.descripcion}`);

    if (deptos.length) {
      const matchSector = deptos.some(sector => sectorMatches(a, sector));
      if (!matchSector) return false;
    }

    if (tipos.length) {
      const matchTipo = tipos.some(tipo => {
        const tipoSelNorm = normalizeText(tipo);
        return (
          tipoNorm.includes(tipoSelNorm) ||
          tipoSelNorm.includes(tipoNorm) ||
          tipoHaystack.includes(tipoSelNorm)
        );
      });
      if (!matchTipo) return false;
    }
    return true;
  });

  filteredAyudas = filtradas;
  currentPage = 1;
  renderResultados();
}

// Devuelve un array con el valor seleccionado en el select correspondiente o
//, si no existe select, los checkboxes marcados (compatibilidad backward).
function getFilterValues(filterKey) {
  const sel = document.querySelector(`#${filterKey}Select`) || document.querySelector(`[data-filter="${filterKey}"]`);
  if (sel && sel.tagName === 'SELECT') {
    const v = sel.value;
    return v ? [v] : [];
  }
  return getChecked(filterKey);
}

// ─── Renderizar tarjetas ──────────────────────────────────────────────────────
function renderResultados() {
  const ayudas = filteredAyudas;
  animateResultCount(ayudas.length);
  resultsListEl.innerHTML   = '';

  if (ayudas.length === 0) {
    resultsListEl.innerHTML = '<p style="color:#999;text-align:center;padding:40px">Sin resultados con los filtros aplicados.</p>';
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(ayudas.length / RESULTS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const pageItems = ayudas.slice(start, end);

  pageItems.forEach(appendAyudaCard);
  renderPagination(totalPages);
}

function appendAyudaCard(ayuda) {
  const card = document.createElement('div');
  card.className = 'result-card reveal-card';
  const cardIndex = resultsListEl.children.length;
  card.style.setProperty('--card-delay', `${Math.min(cardIndex * 55, 420)}ms`);

  card.innerHTML = `
    <h3>${ayuda.titulo}</h3>
    ${ayuda.descripcion ? `<div class="result-description">${ayuda.descripcion}</div>` : ''}
    <div class="result-meta">
      ${ayuda.departamento ? `<div class="meta-item"><strong>Organismo:</strong> ${ayuda.departamento}</div>` : ''}
      ${ayuda.tipo         ? `<div class="meta-item"><strong>Tipo:</strong> <span class="badge">${ayuda.tipo}</span></div>` : ''}
      ${ayuda.seccion      ? `<div class="meta-item"><strong>Sección:</strong> ${ayuda.seccion}</div>` : ''}
      ${ayuda.fecha        ? `<div class="meta-item"><strong>Fecha:</strong> ${ayuda.fecha}</div>` : ''}
    </div>
    ${ayuda.url ? `<a class="result-link" href="${ayuda.url}" target="_blank" rel="noopener">Ver en el BOE →</a>` : ''}
  `;
  resultsListEl.appendChild(card);
}

function animateResultCount(target) {
  const suffix = ` resultado${target !== 1 ? 's' : ''}`;
  if (target <= 0) {
    resultCountEl.textContent = `0${suffix}`;
    return;
  }

  const duration = 450;
  const startTime = performance.now();
  const startValue = Number(resultCountEl.dataset.countValue || 0);

  const tick = now => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (target - startValue) * eased);
    resultCountEl.textContent = `${current}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      resultCountEl.dataset.countValue = String(target);
    }
  };

  requestAnimationFrame(tick);
}

function setupPremiumCardTracking() {
  resultsListEl?.addEventListener('mousemove', event => {
    const card = event.target.closest('.result-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', `${x.toFixed(1)}%`);
    card.style.setProperty('--my', `${y.toFixed(1)}%`);
  });
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
  document.body.classList.toggle('theme-light', !isDark);

  if (!themeToggleEl) return;
  themeToggleEl.classList.toggle('show-sun', isDark);
  themeToggleEl.setAttribute('aria-pressed', String(isDark));
  themeToggleEl.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
}

function initThemeToggle() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {}

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (!themeToggleEl) return;
  themeToggleEl.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
  });
}

function renderPagination(totalPages) {
  if (!paginationEl) return;
  paginationEl.innerHTML = '';

  if (totalPages <= 1) return;

  const createButton = (label, page, isActive = false) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pagination-btn${isActive ? ' active' : ''}`;
    btn.textContent = label;
    btn.disabled = isActive;
    btn.addEventListener('click', () => goToPage(page));
    return btn;
  };

  const isVerySmallPagination = window.innerWidth <= 400;
  const prevBtn = createButton('Anterior', currentPage - 1);
  prevBtn.disabled = currentPage === 1;
  paginationEl.appendChild(prevBtn);

  const isCompactPagination = window.innerWidth <= 920;
  const PAGE_WINDOW_SIZE = isVerySmallPagination ? 4 : (isCompactPagination ? 6 : 9);
  const PAGE_WINDOW_STEP = PAGE_WINDOW_SIZE - 1;
  const windowStart = Math.floor((currentPage - 1) / PAGE_WINDOW_STEP) * PAGE_WINDOW_STEP + 1;
  const windowEnd = Math.min(windowStart + PAGE_WINDOW_SIZE - 1, totalPages);

  for (let page = windowStart; page <= windowEnd; page += 1) {
    paginationEl.appendChild(createButton(String(page), page, page === currentPage));
  }

  const nextBtn = createButton('Siguiente', currentPage + 1);
  nextBtn.disabled = currentPage === totalPages;
  paginationEl.appendChild(nextBtn);
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredAyudas.length / RESULTS_PER_PAGE);
  if (!totalPages) return;
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderResultados();
  resultsSectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Limpiar filtros ──────────────────────────────────────────────────────────
function limpiarFiltros() {
  // Reset checkboxes and selects created for filters
  document.querySelectorAll('[data-filter]').forEach(el => {
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) el.checked = false;
    if (el.tagName === 'SELECT') {
      el.value = '';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  aplicarFiltros();
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
function getChecked(filterKey) {
  return [...document.querySelectorAll(`[data-filter="${filterKey}"]:checked`)].map(cb => cb.value);
}
function unique(arr) { return [...new Set(arr.filter(Boolean))]; }
function resetUI() {
  hide(mainContent); hide(noResultsEl); hide(errorEl);
  resultsListEl.innerHTML = '';
  if (paginationEl) paginationEl.innerHTML = '';
  allAyudas = [];
  filteredAyudas = [];
  currentPage = 1;
  if (resultsSectionEl) hide(resultsSectionEl);
}
function mostrarError(msg) { errorTextEl.textContent = msg; show(errorEl); }
function show(el) { el.hidden = false; }
function hide(el) { el.hidden = true; }

// ─── Cargar filtros iniciales al cargar la página ───────────────────────────
async function loadInitialFilters() {
  applyRoleAccessUI();

  // If static lists are enabled, build selects from them immediately
  if (USE_STATIC_FILTERS) {
    renderSelect('sectorFilters', 'sector', BOE_STATIC_SECTORES, 'Elige...');
    renderSelect('tipoFilters',   'tipo',   BOE_STATIC_TIPOS,    'Elige...');
    show(mainContent);
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) hide(resultsSection);
    return;
  }

  try {
    const res = await fetch(buildApiUrl(`/api/ayudas/sumario?role=${currentRole}`), {
      headers: { 'x-user-role': currentRole }
    });
    const json = await parseApiResponse(res);
    if (!res.ok) return;
    const disposiciones = json.data || [];
    if (disposiciones.length) {
      // construirFiltros funciona con objetos que tengan 'departamento' y 'tipo'
      construirFiltros(disposiciones);
      // mostrar panel de filtros (pero ocultar la sección de resultados hasta buscar)
      show(mainContent);
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) hide(resultsSection);
    }
  } catch (e) {
    console.warn('No se pudieron cargar filtros iniciales:', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCustomSelects();
  initThemeToggle();
  loadInitialFilters();
  setupPremiumCardTracking();
});
