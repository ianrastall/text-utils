// js/case-converter.js: Case Converter Tool Logic
// Loads title_case_rules.json, populates UI, and handles all tool logic

(function() {
  'use strict';
  const dom = {};
  let titleCaseRules = {};

  function init() {
    cacheDOM();
    loadTitleCaseRules();
    bindSidebar();
    bindHeaderFooter();
    bindEvents();
  }

  function cacheDOM() {
    dom.textEditor = document.getElementById('textEditor');
    dom.convertBtn = document.getElementById('convertBtn');
    dom.copyBtn = document.getElementById('copyBtn');
    dom.pasteBtn = document.getElementById('pasteBtn');
    dom.clearBtn = document.getElementById('clearBtn');
    dom.toastContainer = document.getElementById('toastContainer');
    dom.titleCaseOptionsDiv = document.getElementById('titleCaseOptions');
    dom.titleCaseLang = document.getElementById('titleCaseLang');
  }

  function loadTitleCaseRules() {
    fetch('config/title_case_rules.json')
      .then(r => r.json())
      .then(rules => {
        titleCaseRules = rules;
        populateTitleCaseLang();
      });
  }

  function populateTitleCaseLang() {
    dom.titleCaseLang.innerHTML = '';
    Object.entries(titleCaseRules).forEach(([code, details]) => {
      if (details.style !== 'notApplicable') {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = details.name;
        dom.titleCaseLang.appendChild(opt);
      }
    });
  }

  function showToast(message, variant = 'info') {
    if (!dom.toastContainer || typeof bootstrap === 'undefined') {
      console.log(`Toast (${variant}): ${message}`);
      return;
    }
    const bgVariant = `bg-${variant}`;
    const textVariant = (variant === 'light' || variant === 'warning' || variant === 'info') ? 'text-dark' : 'text-white';
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center ${textVariant} ${bgVariant} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close me-2 m-auto ${textVariant === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    dom.toastContainer.appendChild(toastEl);
    try {
      const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });
      toast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } catch (e) {
      console.error("Bootstrap Toast error:", e);
      toastEl.remove();
    }
  }

  function toTitleCase(str) {
    const lang = dom.titleCaseLang.value;
    const rules = titleCaseRules[lang];
    if (!rules) return str;
    switch (rules.style) {
      case 'capitalizeAll':
        return str.replace(/\p{L}+/gu, word => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase());
      case 'minorWords':
        const minorWords = new Set(rules.minorWords || []);
        const words = str.split(/(\s+)/);
        let result = words.map((word, index) => {
          if (index % 2 !== 0) return word;
          const lowerWord = word.toLocaleLowerCase();
          const firstWordIndex = words.findIndex(w => w.trim() !== '');
          const lastWordIndex = words.length - 1 - [...words].reverse().findIndex(w => w.trim() !== '');
          if (index === firstWordIndex || index === lastWordIndex || !minorWords.has(lowerWord)) {
            return word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();
          }
          return lowerWord;
        });
        return result.join('');
      default:
        return str;
    }
  }

  function capitalizeEveryWord(str) {
    return str.replace(/\b\p{L}/gu, char => char.toLocaleUpperCase());
  }

  function toSentenceCase(str) {
    let lower = str.toLocaleLowerCase();
    return lower.replace(/(^\s*\p{L}|[.!?]\s*\p{L})/gu, char => char.toLocaleUpperCase());
  }

  function applyCase() {
    if (!dom.textEditor) {
      showToast("Error: Text editor not found.", "danger");
      return;
    }
    const originalText = dom.textEditor.value;
    const selectedOption = document.querySelector('input[name="caseOption"]:checked').value;
    let result = "";
    try {
      switch(selectedOption) {
        case "uppercase": result = originalText.toLocaleUpperCase(); break;
        case "lowercase": result = originalText.toLocaleLowerCase(); break;
        case "titlecase": result = toTitleCase(originalText); break;
        case "sentencecase": result = toSentenceCase(originalText); break;
        case "capitalize": result = capitalizeEveryWord(originalText); break;
        default: result = originalText;
      }
      dom.textEditor.value = result;
      if (originalText && !result) {
        showToast("Conversion resulted in empty text.", "warning");
      }
    } catch (e) {
      console.error("Error during case conversion:", e);
      showToast("An error occurred during conversion.", "danger");
    }
  }

  function bindEvents() {
    document.querySelectorAll('input[name="caseOption"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const isTitleCase = document.querySelector('input[name="caseOption"]:checked').value === 'titlecase';
        dom.titleCaseOptionsDiv.style.display = isTitleCase ? 'block' : 'none';
      });
    });
    if (dom.convertBtn) dom.convertBtn.addEventListener('click', applyCase);
    if (dom.copyBtn) {
      dom.copyBtn.addEventListener('click', () => {
        if (!dom.textEditor.value) {
          showToast('Nothing to copy.', 'warning');
          return;
        }
        navigator.clipboard.writeText(dom.textEditor.value).then(() => {
          showToast('Text copied!', 'success');
        }).catch(err => {
          showToast('Copy failed. Check browser permissions.', 'danger');
        });
      });
    }
    if (dom.pasteBtn) {
      dom.pasteBtn.addEventListener('click', async () => {
        try {
          const clipText = await navigator.clipboard.readText();
          if(clipText) {
            dom.textEditor.value = clipText;
            showToast('Pasted from clipboard.', 'info');
          } else {
            showToast('Clipboard is empty or permissions are denied.', 'warning');
          }
        } catch (err) {
          showToast('Paste failed. Check browser permissions.', 'warning');
        }
      });
    }
    if (dom.clearBtn) {
      dom.clearBtn.addEventListener('click', () => {
        dom.textEditor.value = '';
        showToast('Cleared.', 'secondary');
      });
    }
    if(dom.textEditor) {
      dom.textEditor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          dom.convertBtn.click();
        }
      });
    }
  }

  // Sidebar, header, and footer loading
  function bindSidebar() {
    if (window.loadSidebar) {
      window.loadSidebar(document.getElementById('dynamic-sidebar'), 'case-converter');
    } else if (window.ComponentLoader) {
      window.ComponentLoader.loadSidebar(document.getElementById('dynamic-sidebar'), 'case-converter');
    } else {
      fetch('components/sidebar-content.html').then(r => r.text()).then(html => { document.getElementById('dynamic-sidebar').innerHTML = html; });
    }
  }
  function bindHeaderFooter() {
    if (window.ComponentLoader) {
      window.ComponentLoader.loadHeader(document.getElementById('header-container'));
      window.ComponentLoader.loadFooter(document.getElementById('footer-container'));
    } else {
      fetch('components/header-content.html').then(r => r.text()).then(html => { document.getElementById('header-container').innerHTML = html; });
      fetch('components/footer-content.html').then(r => r.text()).then(html => { document.getElementById('footer-container').innerHTML = html; });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
