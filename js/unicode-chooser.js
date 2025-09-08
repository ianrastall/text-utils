// js/unicode-chooser.js: Unicode Chooser Tool Logic
// Loads unicode-data.json, populates UI, and handles all tool logic

(function() {
  'use strict';
  const dom = {};
  const state = {
    data: null,
    activeItems: [],
    lastSelectedCp: null,
    focusedIndex: -1,
    rowHeight: 55,
    itemsPerRow: 10
  };

  function init() {
    cacheDOM();
    loadUnicodeData();
    bindSidebar();
    bindHeaderFooter();
  }

  function cacheDOM() {
    dom.categorySelect = document.getElementById("categorySelect");
    dom.blockSelect = document.getElementById("blockSelect");
    dom.searchInput = document.getElementById("searchInput");
    dom.langSelect = document.getElementById("langSelect");
    dom.gridContainer = document.getElementById("charGridContainer");
    dom.gridSizer = document.getElementById("charGridSizer");
    dom.grid = document.getElementById("charGrid");
    dom.codeOutput = document.getElementById("codeOutput");
    dom.copyCodeBtn = document.getElementById("copyCodeBtn");
    dom.clearCodeBtn = document.getElementById("clearCodeBtn");
    dom.sidebar = document.getElementById("sidebar-container");
    dom.header = document.getElementById("header-container");
    dom.footer = document.getElementById("footer-container");
  }

  function loadUnicodeData() {
    fetch('includes/unicode-data.json')
      .then(r => r.json())
      .then(data => {
        state.data = data;
        populateCategories();
        populateBlocks();
        bindEventListeners();
        filterAndRender();
        setTimeout(() => {
          if (dom.codeOutput) {
            dom.codeOutput.style.minHeight = '120px';
            dom.codeOutput.style.height = '120px';
          }
        }, 100);
      });
  }

  function populateCategories() {
    dom.categorySelect.innerHTML = '';
    Object.keys(state.data.categories).forEach(categoryName => {
      const opt = document.createElement('option');
      opt.value = categoryName;
      opt.textContent = categoryName;
      dom.categorySelect.appendChild(opt);
    });
  }

  function populateBlocks() {
    const category = dom.categorySelect.value;
    const blocksInCategory = state.data.categories[category] || [];
    dom.blockSelect.innerHTML = '';
    blocksInCategory.forEach(blockName => {
      if (state.data.blocks[blockName]) {
        const option = document.createElement('option');
        option.value = blockName;
        option.textContent = blockName;
        dom.blockSelect.appendChild(option);
      }
    });
  }

  function bindEventListeners() {
    dom.categorySelect.addEventListener("change", () => { populateBlocks(); filterAndRender(); });
    dom.blockSelect.addEventListener("change", () => { dom.searchInput.value = ''; filterAndRender(); });
    dom.searchInput.addEventListener('input', debounce(filterAndRender, 300));
    dom.langSelect.addEventListener("change", () => generateCode(state.lastSelectedCp));
    dom.copyCodeBtn.addEventListener("click", () => copyToClipboard(dom.codeOutput.value, "Output copied!"));
    dom.clearCodeBtn.addEventListener("click", clearCode);
    dom.gridContainer.addEventListener("scroll", renderGrid);
    dom.gridContainer.addEventListener("keydown", handleGridKeyDown);
  }

  function filterAndRender() {
    const searchTerm = dom.searchInput.value.toLowerCase();
    state.activeItems = [];
    if (searchTerm) {
      for (const [name, range] of Object.entries(state.data.blocks)) {
        if (name.toLowerCase().includes(searchTerm)) {
          for (let cp = range[0]; cp <= range[1]; cp++) state.activeItems.push(cp);
        }
      }
    } else {
      const blockName = dom.blockSelect.value;
      const range = state.data.blocks[blockName];
      if (range) {
        for (let cp = range[0]; cp <= range[1]; cp++) state.activeItems.push(cp);
      }
    }
    dom.gridContainer.scrollTop = 0;
    renderGrid();
  }

  function renderGrid() {
    dom.grid.innerHTML = '';
    state.activeItems.forEach((cp, i) => {
      if (cp === undefined || (cp >= 0xD800 && cp <= 0xDFFF)) return;
      const char = String.fromCodePoint(cp);
      const isCombining = (cp >= 0x0300 && cp <= 0x036F);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'char-cell';
      cell.textContent = isCombining ? `\u25CC${char}` : char;
      cell.dataset.cp = cp;
      cell.dataset.index = i;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Character: ${char}, Codepoint: U+${cp.toString(16).toUpperCase()}`);
      cell.addEventListener('click', () => handleCharClick(cp, i));
      dom.grid.appendChild(cell);
    });
  }

  function handleGridKeyDown(e) {
    let newIndex = state.focusedIndex;
    if (newIndex === -1) newIndex = 0;
    switch (e.key) {
      case 'ArrowRight': newIndex++; break;
      case 'ArrowLeft': newIndex--; break;
      case 'ArrowDown': newIndex += state.itemsPerRow; break;
      case 'ArrowUp': newIndex -= state.itemsPerRow; break;
      case 'Enter': case ' ': handleCharClick(state.activeItems[state.focusedIndex], state.focusedIndex); break;
      default: return;
    }
    e.preventDefault();
    if (newIndex >= 0 && newIndex < state.activeItems.length) {
      state.focusedIndex = newIndex;
      const targetButton = dom.grid.querySelector(`[data-index='${newIndex}']`);
      if (targetButton) {
        targetButton.focus();
      } else {
        const targetTop = Math.floor(newIndex / state.itemsPerRow) * state.rowHeight;
        dom.gridContainer.scrollTop = targetTop;
        setTimeout(() => dom.grid.querySelector(`[data-index='${newIndex}']`)?.focus(), 50);
      }
    }
  }

  function handleCharClick(cp, index) {
    state.lastSelectedCp = cp;
    state.focusedIndex = index;
    generateCode(cp);
  }

  function generateCode(cp) {
    if (cp === null || isNaN(cp)) { dom.codeOutput.value = ''; return; }
    const char = String.fromCodePoint(cp);
    const hex = cp.toString(16).toUpperCase();
    const lang = dom.langSelect.value;
    let output = '';
    // Try to get block info from data
    let blockName = findBlockName(cp);
    let blockInfo = '';
    if (state.data && state.data.blocks && state.data.blocks[blockName]) {
      const blockArr = state.data.blocks[blockName];
      if (blockArr && blockArr.length > 2) blockInfo = blockArr[2];
    }
    if (lang === "info") {
      dom.codeOutput.value = `Character: ${char}\nBlock: ${blockName}${blockInfo ? ` (${blockInfo})` : ''}\nCodepoint: U+${hex}\nDecimal: ${cp}`;
      return;
    }
    if (lang === 'raw') { dom.codeOutput.value = char; return; }
    let jsEscape = cp > 0xFFFF ? `\\u{${hex}}` : `\\u${hex.padStart(4, "0")}`;
    switch (lang) {
      case "html": output = `&#${cp};`; break;
      case "css": output = `\\${hex}`; break;
      case "javascript": output = `'${jsEscape}'`; break;
      case "python": output = `u'\\U${hex.padStart(8, "0")}'`; break;
      case "php": output = `"\\u{${hex}}"`; break;
      case "json": output = `"${jsEscape.replace(/\{|\}/g, '')}"`; break;
    }
    dom.codeOutput.value = `${output}\n\nCharacter: ${char}\nBlock: ${blockName}${blockInfo ? ` (${blockInfo})` : ''}\nCodepoint: U+${hex}\nDecimal: ${cp}`;
  }

  function findBlockName(cp) {
    for (const [name, range] of Object.entries(state.data.blocks)) {
      if (cp >= range[0] && cp <= range[1]) return name;
    }
    return "Unknown";
  }

  function clearCode() {
    dom.codeOutput.value = '';
    state.lastSelectedCp = null;
  }

  function debounce(func, delay) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; }
  async function copyToClipboard(text, msg) { if(!text) { showToast('Nothing to copy', 'info'); return; } await navigator.clipboard.writeText(text); showToast(msg, 'success'); }
  function showToast(msg, type='success') {
    const containerId = 'toast-container-unicode';
    let container = document.getElementById(containerId);
    if (!container) { container = document.createElement('div'); container.id = containerId; container.className = 'toast-container position-fixed bottom-0 end-0 p-3'; container.style.zIndex = '1100'; document.body.appendChild(container); }
    const toastEl = document.createElement('div'); toastEl.className = `toast align-items-center text-bg-${type} border-0 show`; toastEl.setAttribute('role', 'alert');
    const dFlex = document.createElement('div'); dFlex.className = 'd-flex';
    const body = document.createElement('div'); body.className = 'toast-body'; body.textContent = msg;
    const closeBtn = document.createElement('button'); closeBtn.type = 'button'; closeBtn.className = 'btn-close btn-close-white me-2 m-auto'; closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = () => toastEl.remove();
    dFlex.appendChild(body); dFlex.appendChild(closeBtn); toastEl.appendChild(dFlex); container.appendChild(toastEl);
    setTimeout(() => { if (toastEl) toastEl.remove(); }, 3000);
  }

  // Sidebar, header, and footer loading
  function bindSidebar() {
    if (window.loadSidebar) {
      window.loadSidebar(dom.sidebar, 'unicode-chooser');
    } else if (window.ComponentLoader) {
      window.ComponentLoader.loadSidebar(dom.sidebar, 'unicode-chooser');
    } else {
      fetch('components/sidebar-content.html').then(r => r.text()).then(html => { dom.sidebar.innerHTML = html; });
    }
  }
  function bindHeaderFooter() {
    if (window.ComponentLoader) {
      window.ComponentLoader.loadHeader(dom.header);
      window.ComponentLoader.loadFooter(dom.footer);
    } else {
      fetch('components/header-content.html').then(r => r.text()).then(html => { dom.header.innerHTML = html; });
      fetch('components/footer-content.html').then(r => r.text()).then(html => { dom.footer.innerHTML = html; });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
