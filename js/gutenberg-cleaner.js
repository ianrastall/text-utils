const GutenbergCleaner = (() => {
  const dom = {
    form: null,
    input: null,
    output: null,
    options: {},
    buttons: {},
    stats: {},
    status: null
  };

  const statusClasses = {
    success: 'text-success',
    info: 'text-white-50',
    warning: 'text-warning',
    danger: 'text-danger'
  };

  function init() {
    cacheDom();
    if (!dom.form) return;
    bindEvents();
    updateStats('');
    toggleOutputButtons(true);
    showStatus('Paste Gutenberg text to get started.', 'info');
  }

  function cacheDom() {
    dom.form = document.getElementById('gutenbergForm');
    dom.input = document.getElementById('gutenbergInput');
    dom.output = document.getElementById('gutenbergOutput');
    dom.options = {
      boilerplate: document.getElementById('optionBoilerplate'),
      toc: document.getElementById('optionToc'),
      flatten: document.getElementById('optionFlatten')
    };
    dom.buttons = {
      clean: document.getElementById('cleanText'),
      copy: document.getElementById('copyCleaned'),
      use: document.getElementById('useCleaned'),
      clear: document.getElementById('clearAll')
    };
    dom.stats = {
      words: document.getElementById('statWords'),
      chars: document.getElementById('statChars'),
      paragraphs: document.getElementById('statParagraphs')
    };
    dom.status = document.getElementById('gutenbergStatus');
  }

  function bindEvents() {
    dom.buttons.clean?.addEventListener('click', handleClean);
    dom.buttons.copy?.addEventListener('click', handleCopy);
    dom.buttons.use?.addEventListener('click', sendOutputToInput);
    dom.buttons.clear?.addEventListener('click', clearAll);

    dom.input?.addEventListener('input', () => {
      if (dom.output) dom.output.value = '';
      toggleOutputButtons(true);
      updateStats('');
      showStatus('Ready to clean Gutenberg text.', 'info');
    });
  }

  function handleClean() {
    if (!dom.input || !dom.output) return;
    const raw = dom.input.value || '';
    if (!raw.trim()) {
      showStatus('Paste a Project Gutenberg file (HTML or TXT) to clean.', 'warning');
      toggleOutputButtons(true);
      dom.output.value = '';
      updateStats('');
      return;
    }

    let text = raw.replace(/\r\n/g, '\n');
    const changes = [];

    if (dom.options.boilerplate?.checked) {
      const before = text.length;
      text = removeBoilerplate(text);
      if (text.length !== before) changes.push('boilerplate removed');
    }

    if (dom.options.toc?.checked) {
      const before = text.length;
      text = removeTableOfContents(text);
      if (text.length !== before) changes.push('TOC removed');
    }

    if (dom.options.flatten?.checked) {
      text = flattenParagraphs(text);
      changes.push('paragraphs flattened');
    }

    const cleaned = text.trim();
    dom.output.value = cleaned;
    updateStats(cleaned);
    const disable = !cleaned;
    toggleOutputButtons(disable);

    if (disable) {
      showStatus('All visible content was removed. Try disabling one of the options.', 'warning');
      return;
    }

    const summary = changes.length ? changes.join(' | ') : 'no visible changes were required';
    showStatus(`Cleaned text (${summary}).`, changes.length ? 'success' : 'info');
  }

  function handleCopy() {
    if (!dom.output || !dom.output.value) {
      showStatus('Nothing to copy yet.', 'warning');
      return;
    }
    navigator.clipboard.writeText(dom.output.value)
      .then(() => showStatus('Cleaned text copied to clipboard.', 'success'))
      .catch(() => showStatus('Clipboard copy was blocked. Copy manually if needed.', 'danger'));
  }

  function sendOutputToInput() {
    if (!dom.output || !dom.output.value.trim()) {
      showStatus('There is no cleaned text to send back to the input.', 'warning');
      return;
    }
    dom.input.value = dom.output.value;
    dom.output.value = '';
    toggleOutputButtons(true);
    updateStats('');
    dom.input.focus();
    showStatus('Cleaned text moved to the input area for another pass.', 'success');
  }

  function clearAll() {
    dom.form?.reset();
    if (dom.input) dom.input.value = '';
    if (dom.output) dom.output.value = '';
    toggleOutputButtons(true);
    updateStats('');
    showStatus('Cleared the form. Paste a new Gutenberg file to continue.', 'info');
  }

  function toggleOutputButtons(disabled) {
    if (dom.buttons.copy) dom.buttons.copy.disabled = disabled;
    if (dom.buttons.use) dom.buttons.use.disabled = disabled;
  }

  function updateStats(text) {
    const trimmed = (text || '').trim();
    const chars = trimmed.length;
    const words = trimmed ? (trimmed.match(/[^\s]+/g) || []).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n{2,}/).filter(block => block.trim().length).length : 0;

    if (dom.stats.words) dom.stats.words.textContent = words.toLocaleString();
    if (dom.stats.chars) dom.stats.chars.textContent = chars.toLocaleString();
    if (dom.stats.paragraphs) dom.stats.paragraphs.textContent = paragraphs.toLocaleString();
  }

  function showStatus(message, variant = 'info') {
    if (!dom.status) return;
    const tone = statusClasses[variant] || statusClasses.info;
    dom.status.className = `small mt-2 ${tone}`;
    dom.status.textContent = message;
  }

  function removeBoilerplate(text) {
    let cleaned = text;
    const boilerplateSections = [
      /<section[^>]+id=["']pg-header["'][\s\S]*?<\/section>/gi,
      /<section[^>]+id=["']pg-footer["'][\s\S]*?<\/section>/gi,
      /<section[^>]+class=["'][^"']*pg-boilerplate[^"']*["'][\s\S]*?<\/section>/gi,
      /<div[^>]+class=["'][^"']*(?:pgheader|pgfooter|pgboilerplate)[^"']*["'][\s\S]*?<\/div>/gi
    ];
    boilerplateSections.forEach(regex => {
      cleaned = cleaned.replace(regex, '');
    });

    cleaned = stripMarkerBlocks(cleaned);

    cleaned = cleaned.replace(/This eBook is for the use of anyone anywhere[\s\S]{0,4000}?www\.gutenberg\.org\/license/gi, '');
    cleaned = cleaned.replace(/End of (the )?Project Gutenberg[\s\S]*$/i, '');

    return cleaned;
  }

  function stripMarkerBlocks(text) {
    let processed = text;
    let upper = processed.toUpperCase();
    const startIdx = upper.indexOf('*** START OF');
    if (startIdx !== -1) {
      const afterLineBreak = processed.indexOf('\n', startIdx);
      processed = afterLineBreak !== -1 ? processed.slice(afterLineBreak + 1) : processed.slice(startIdx);
    }

    upper = processed.toUpperCase();
    const endIdx = upper.indexOf('*** END OF');
    if (endIdx !== -1) {
      processed = processed.slice(0, endIdx);
    }

    return processed;
  }

  function removeTableOfContents(text) {
    let cleaned = text;
    const htmlTocRegexes = [
      /<div[^>]+class=["'][^"']*\btoc\b[^"']*["'][\s\S]*?<\/div>/gi,
      /<section[^>]+class=["'][^"']*\btoc\b[^"']*["'][\s\S]*?<\/section>/gi,
      /<nav[^>]+class=["'][^"']*\btoc\b[^"']*["'][\s\S]*?<\/nav>/gi,
      /<p[^>]+class=["'][^"']*\btoc\b[^"']*["'][\s\S]*?<\/p>/gi,
      /<h[1-6][^>]*>\s*(?:TABLE OF )?CONTENTS\s*<\/h[1-6]>[\s\S]{0,2400}?<\/(?:ul|ol)>/gi
    ];
    htmlTocRegexes.forEach(regex => {
      cleaned = cleaned.replace(regex, '');
    });

    cleaned = cleaned.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, block => {
      const looksLikeToc = /(?:TABLE OF CONTENTS|CONTENTS)\b/i.test(block) && (/<a\b/i.test(block) || /<br\s*\/?>/i.test(block));
      return looksLikeToc && block.length < 4000 ? '' : block;
    });

    const previewLength = 60000;
    const preview = cleaned.slice(0, previewLength);
    const headingRegex = /(?:^|\n)[\t ]*(?:TABLE OF CONTENTS|CONTENTS)\b[^\n]*\n/gi;
    const headingMatch = headingRegex.exec(preview);

    if (headingMatch) {
      const start = headingMatch.index;
      const fromHeading = cleaned.slice(start + headingMatch[0].length);
      const endRegex = /\n{2,}(?=(?:CHAPTER|BOOK|PART|SECTION|STAVE|CANTO|ACT|SCENE)\b|(?:[IVXLCDM]+\.)|(?:\d+\.)|<h[1-6][^>]*>)/i;
      const endMatch = endRegex.exec(fromHeading);
      const fallbackEnd = Math.min(fromHeading.length, 4000);
      const cutIndex = endMatch ? endMatch.index : fallbackEnd;
      cleaned = cleaned.slice(0, start) + fromHeading.slice(cutIndex);
    }

    return cleaned;
  }

  function flattenParagraphs(text) {
    if (!text.trim()) return '';
    return text
      .split(/\n{2,}/)
      .map(block => block.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', GutenbergCleaner.init);



