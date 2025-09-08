// --- Google Fonts List (curated, as in PHP) ---
const googleFontsData = {"items": [
  // SANS-SERIF
  {"family": "Roboto", "category": "sans-serif", "variants": ["100", "300", "400", "500", "700", "900"]},
  {"family": "Open Sans", "category": "sans-serif", "variants": ["300", "400", "500", "600", "700", "800"]},
  {"family": "Lato", "category": "sans-serif", "variants": ["100", "300", "400", "700", "900"]},
  {"family": "Montserrat", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Poppins", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Inter", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Raleway", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Ubuntu", "category": "sans-serif", "variants": ["300", "400", "500", "700"]},
  {"family": "Nunito", "category": "sans-serif", "variants": ["200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Work Sans", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Rubik", "category": "sans-serif", "variants": ["300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Noto Sans", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Quicksand", "category": "sans-serif", "variants": ["300", "400", "500", "600", "700"]},
  {"family": "Nunito Sans", "category": "sans-serif", "variants": ["200", "300", "400", "600", "700", "800", "900"]},
  {"family": "Mukta", "category": "sans-serif", "variants": ["200", "300", "400", "500", "600", "700", "800"]},
  {"family": "Josefin Sans", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700"]},
  {"family": "Cabin", "category": "sans-serif", "variants": ["400", "500", "600", "700"]},
  {"family": "Oxygen", "category": "sans-serif", "variants": ["300", "400", "700"]},
  {"family": "Karla", "category": "sans-serif", "variants": ["200", "300", "400", "500", "600", "700", "800"]},
  {"family": "Hind", "category": "sans-serif", "variants": ["300", "400", "500", "600", "700"]},
  {"family": "Source Sans Pro", "category": "sans-serif", "variants": ["200", "300", "400", "600", "700", "900"]},
  {"family": "Barlow", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "DM Sans", "category": "sans-serif", "variants": ["400", "500", "700"]},
  {"family": "Mulish", "category": "sans-serif", "variants": ["200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Manrope", "category": "sans-serif", "variants": ["200", "300", "400", "500", "600", "700", "800"]},
  {"family": "Plus Jakarta Sans", "category": "sans-serif", "variants": ["200", "300", "400", "500", "600", "700", "800"]},
  {"family": "Outfit", "category": "sans-serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  // SERIF
  {"family": "Playfair Display", "category": "serif", "variants": ["400", "500", "600", "700", "800", "900"]},
  {"family": "Lora", "category": "serif", "variants": ["400", "500", "600", "700"]},
  {"family": "Merriweather", "category": "serif", "variants": ["300", "400", "700", "900"]},
  {"family": "PT Serif", "category": "serif", "variants": ["400", "700"]},
  {"family": "Crimson Text", "category": "serif", "variants": ["400", "600", "700"]},
  {"family": "Libre Baskerville", "category": "serif", "variants": ["400", "700"]},
  {"family": "EB Garamond", "category": "serif", "variants": ["400", "500", "600", "700", "800"]},
  {"family": "Roboto Slab", "category": "serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Noto Serif", "category": "serif", "variants": ["400", "700"]},
  {"family": "Source Serif Pro", "category": "serif", "variants": ["200", "300", "400", "600", "700", "900"]},
  {"family": "Bitter", "category": "serif", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Crimson Pro", "category": "serif", "variants": ["200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Cormorant Garamond", "category": "serif", "variants": ["300", "400", "500", "600", "700"]},
  {"family": "Domine", "category": "serif", "variants": ["400", "700"]},
  {"family": "Vollkorn", "category": "serif", "variants": ["400", "500", "600", "700", "800", "900"]},
  {"family": "Literata", "category": "serif", "variants": ["200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Cardo", "category": "serif", "variants": ["400", "700"]},
  {"family": "Spectral", "category": "serif", "variants": ["200", "300", "400", "500", "600", "700", "800"]},
  // DISPLAY
  {"family": "Bebas Neue", "category": "display", "variants": ["400"]},
  {"family": "Oswald", "category": "display", "variants": ["200", "300", "400", "500", "600", "700"]},
  {"family": "Anton", "category": "display", "variants": ["400"]},
  {"family": "Righteous", "category": "display", "variants": ["400"]},
  {"family": "Fredoka One", "category": "display", "variants": ["400"]},
  {"family": "Passion One", "category": "display", "variants": ["400", "700", "900"]},
  {"family": "Russo One", "category": "display", "variants": ["400"]},
  {"family": "Archivo Black", "category": "display", "variants": ["400"]},
  {"family": "Teko", "category": "display", "variants": ["300", "400", "500", "600", "700"]},
  {"family": "Barlow Condensed", "category": "display", "variants": ["100", "200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Yanone Kaffeesatz", "category": "display", "variants": ["200", "300", "400", "500", "600", "700"]},
  {"family": "Fjalla One", "category": "display", "variants": ["400"]},
  {"family": "Staatliches", "category": "display", "variants": ["400"]},
  {"family": "Alfa Slab One", "category": "display", "variants": ["400"]},
  {"family": "Black Ops One", "category": "display", "variants": ["400"]},
  {"family": "Bungee", "category": "display", "variants": ["400"]},
  {"family": "Bowlby One SC", "category": "display", "variants": ["400"]},
  // MONOSPACE
  {"family": "Roboto Mono", "category": "monospace", "variants": ["100", "200", "300", "400", "500", "600", "700"]},
  {"family": "Source Code Pro", "category": "monospace", "variants": ["200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Fira Code", "category": "monospace", "variants": ["300", "400", "500", "600", "700"]},
  {"family": "JetBrains Mono", "category": "monospace", "variants": ["100", "200", "300", "400", "500", "600", "700", "800"]},
  {"family": "IBM Plex Mono", "category": "monospace", "variants": ["100", "200", "300", "400", "500", "600", "700"]},
  {"family": "Inconsolata", "category": "monospace", "variants": ["200", "300", "400", "500", "600", "700", "800", "900"]},
  {"family": "Space Mono", "category": "monospace", "variants": ["400", "700"]},
  {"family": "Ubuntu Mono", "category": "monospace", "variants": ["400", "700"]},
  {"family": "Overpass Mono", "category": "monospace", "variants": ["300", "400", "600", "700"]},
  {"family": "Red Hat Mono", "category": "monospace", "variants": ["300", "400", "500", "600", "700"]},
  {"family": "Cousine", "category": "monospace", "variants": ["400", "700"]},
  {"family": "Anonymous Pro", "category": "monospace", "variants": ["400", "700"]},
  {"family": "VT323", "category": "monospace", "variants": ["400"]},
  {"family": "Share Tech Mono", "category": "monospace", "variants": ["400"]},
  // HANDWRITING
  {"family": "Dancing Script", "category": "handwriting", "variants": ["400", "500", "600", "700"]},
  {"family": "Pacifico", "category": "handwriting", "variants": ["400"]},
  {"family": "Caveat", "category": "handwriting", "variants": ["400", "500", "600", "700"]},
  {"family": "Satisfy", "category": "handwriting", "variants": ["400"]},
  {"family": "Great Vibes", "category": "handwriting", "variants": ["400"]},
  {"family": "Cookie", "category": "handwriting", "variants": ["400"]},
  {"family": "Permanent Marker", "category": "handwriting", "variants": ["400"]},
  {"family": "Kalam", "category": "handwriting", "variants": ["300", "400", "700"]},
  {"family": "Patrick Hand", "category": "handwriting", "variants": ["400"]},
  {"family": "Shadows Into Light", "category": "handwriting", "variants": ["400"]},
  {"family": "Indie Flower", "category": "handwriting", "variants": ["400"]},
  {"family": "Amatic SC", "category": "handwriting", "variants": ["400", "700"]},
  {"family": "Handlee", "category": "handwriting", "variants": ["400"]},
  {"family": "Sacramento", "category": "handwriting", "variants": ["400"]},

  {"family": "Courgette", "category": "handwriting", "variants": ["400"]}
]};

const systemFonts = {
  all: {
    'Arial': 'Arial, Helvetica, sans-serif',
    'Georgia': 'Georgia, serif',
    'Courier New': '"Courier New", Courier, monospace',
    'Times New Roman': '"Times New Roman", Times, serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Tahoma': 'Tahoma, Geneva, sans-serif',
    'Trebuchet MS': '"Trebuchet MS", Helvetica, sans-serif',
    'Impact': 'Impact, Charcoal, sans-serif',
    'Comic Sans MS': '"Comic Sans MS", cursive',
  },
  windows: {
    'Segoe UI': '"Segoe UI", Tahoma, Geneva, sans-serif',
    'Calibri': 'Calibri, Candara, sans-serif',
    'Cambria': 'Cambria, Georgia, serif',
    'Consolas': 'Consolas, Monaco, monospace',
  },
  mac: {
    'San Francisco': '-apple-system, BlinkMacSystemFont, sans-serif',
    'Helvetica Neue': '"Helvetica Neue", Helvetica, Arial, sans-serif',
    'Avenir': 'Avenir, "Avenir Next", sans-serif',
    'Monaco': 'Monaco, Consolas, monospace',
  },
  linux: {
    'Ubuntu': 'Ubuntu, "Noto Sans", sans-serif',
    'DejaVu Sans': '"DejaVu Sans", Verdana, sans-serif',
    'Liberation Sans': '"Liberation Sans", Arial, sans-serif',
  }
};

// Font Chooser Application - JS Version
class FontChooser {
  constructor() {
    this.currentFont = null;
    this.currentSource = 'google';
    this.googleFonts = googleFontsData?.items || [];
    this.availableWeights = ['400'];
    this.pendingFontLoad = null; // Track pending font loads
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.detectOS();
    this.loadFontList();
  }

  detectOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      this.os = 'windows';
    } else if (userAgent.includes('mac')) {
      this.os = 'mac';
    } else if (userAgent.includes('linux')) {
      this.os = 'linux';
    } else {
      this.os = 'all';
    }
  }

  setupEventListeners() {
    document.querySelectorAll('input[name="fontSource"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentSource = e.target.value;
        this.loadFontList();
        const categoryFilter = document.getElementById('categoryFilter');
        if (e.target.value === 'google') {
          categoryFilter.style.display = 'block';
        } else {
          categoryFilter.style.display = 'none';
          document.getElementById('fontCategory').value = '';
        }
      });
    });

    let searchTimer;
    document.getElementById('fontSearch').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => this.filterFonts(e.target.value), 300);
    });

    document.getElementById('fontCategory').addEventListener('change', (e) => {
      this.filterFonts(document.getElementById('fontSearch').value);
    });

    ['fontSize', 'fontSizeRange'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('fontSize').value = value;
        document.getElementById('fontSizeRange').value = value;
        this.updatePreview();
      });
    });

    ['lineHeight', 'lineHeightRange'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('lineHeight').value = value;
        document.getElementById('lineHeightRange').value = value;
        this.updatePreview();
      });
    });

    ['letterSpacing', 'letterSpacingRange'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('letterSpacing').value = value;
        document.getElementById('letterSpacingRange').value = value;
        this.updatePreview();
      });
    });

    document.getElementById('fontWeight').addEventListener('change', () => this.updatePreview());

    ['textColor', 'textColorHex'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        const value = e.target.value;
        if (id === 'textColorHex' && !/^#[0-9A-F]{6}$/i.test(value)) {
          return;
        }
        document.getElementById('textColor').value = value;
        document.getElementById('textColorHex').value = value;
        this.updatePreview();
        this.checkContrast();
      });
    });

    ['bgColor', 'bgColorHex'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        const value = e.target.value;
        if (id === 'bgColorHex' && !/^#[0-9A-F]{6}$/i.test(value)) {
          return;
        }
        document.getElementById('bgColor').value = value;
        document.getElementById('bgColorHex').value = value;
        this.updatePreview();
        this.checkContrast();
      });
    });

    document.getElementById('textSample').addEventListener('change', (e) => {
      this.updateTextSample(e.target.value);
    });

    document.getElementById('customText').addEventListener('input', () => {
      if (document.getElementById('textSample').value === 'custom') {
        this.updateTextSample('custom');
      }
    });

    document.getElementById('devicePreview').addEventListener('change', (e) => {
      this.updateDevicePreview(e.target.value);
    });

    document.getElementById('resetPreview').addEventListener('click', () => {
      this.resetSettings();
    });

    document.querySelectorAll('.copy-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-target');
        this.copyToClipboard(document.getElementById(targetId).textContent);
      });
    });
  }

  loadFontList() {
    const listElement = document.getElementById('fontList');
    if (this.currentSource === 'google') {
      this.displayGoogleFonts();
    } else {
      this.displaySystemFonts();
    }
  }

  displayGoogleFonts() {
    const listElement = document.getElementById('fontList');
    if (!this.googleFonts || this.googleFonts.length === 0) {
      listElement.innerHTML = '<div class="text-center py-3 text-muted">No Google Fonts available. Try System Fonts instead.</div>';
      return;
    }
    const grouped = {};
    this.googleFonts.forEach(font => {
      const category = font.category || 'other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(font);
    });
    let html = '';
    const categoryFilter = document.getElementById('fontCategory').value;
    Object.keys(grouped).sort().forEach(category => {
      if (categoryFilter && category !== categoryFilter) return;
      html += `<div class="font-category-header">${category} (${grouped[category].length})</div>`;
      grouped[category].forEach(font => {
        html += `
          <div class="font-list-item" data-font="${font.family}" data-source="google" data-category="${category}">
            <div class="d-flex justify-content-between align-items-center">
              <span style="font-family: '${font.family}', sans-serif;">${font.family}</span>
              <small class="text-muted">${font.variants.length} styles</small>
            </div>
          </div>
        `;
      });
    });
    if (html === '') {
      html = '<div class="text-center py-3 text-muted">No fonts found matching your criteria.</div>';
    }
    listElement.innerHTML = html;
    listElement.querySelectorAll('.font-list-item').forEach(item => {
      item.addEventListener('click', () => this.selectFont(item));
      item.addEventListener('mouseenter', () => {
        if (!item.classList.contains('active')) {
          item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
      });
      item.addEventListener('mouseleave', () => {
        if (!item.classList.contains('active')) {
          item.style.backgroundColor = 'transparent';
        }
      });
    });
    const firstItem = listElement.querySelector('.font-list-item');
    if (firstItem && !this.currentFont) {
      this.selectFont(firstItem);
    }
  }

  displaySystemFonts() {
    const listElement = document.getElementById('fontList');
    let html = '';
    html += '<div class="font-category-header">Web Safe Fonts</div>';
    Object.keys(systemFonts.all).forEach(fontName => {
      html += `
        <div class="font-list-item" data-font="${fontName}" data-source="system">
          <div class="d-flex justify-content-between align-items-center">
            <span style="font-family: ${systemFonts.all[fontName]};">${fontName}</span>
            <small class="text-success">✓ Universal</small>
          </div>
        </div>
      `;
    });
    if (systemFonts[this.os]) {
      html += `<div class="font-category-header">Your System (${this.os})</div>`;
      Object.keys(systemFonts[this.os]).forEach(fontName => {
        html += `
          <div class="font-list-item" data-font="${fontName}" data-source="system" data-os="${this.os}">
            <div class="d-flex justify-content-between align-items-center">
              <span style="font-family: ${systemFonts[this.os][fontName]};">${fontName}</span>
              <small class="text-info">✓ ${this.os}</small>
            </div>
          </div>
        `;
      });
    }
    listElement.innerHTML = html;
    listElement.querySelectorAll('.font-list-item').forEach(item => {
      item.addEventListener('click', () => this.selectFont(item));
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      });
      item.addEventListener('mouseleave', () => {
        if (!item.classList.contains('active')) {
          item.style.backgroundColor = 'transparent';
        }
      });
    });
    const firstItem = listElement.querySelector('.font-list-item');
    if (firstItem && !this.currentFont) {
      this.selectFont(firstItem);
    }
  }

  filterFonts(searchTerm) {
    const category = document.getElementById('fontCategory').value;
    const items = document.querySelectorAll('.font-list-item');
    let visibleCount = 0;
    items.forEach(item => {
      const fontName = item.getAttribute('data-font').toLowerCase();
      const fontCategory = item.getAttribute('data-category');
      const matchesSearch = !searchTerm || fontName.includes(searchTerm.toLowerCase());
      const matchesCategory = !category || fontCategory === category || !fontCategory;
      const shouldShow = matchesSearch && matchesCategory;
      item.style.display = shouldShow ? 'block' : 'none';
      if (shouldShow) visibleCount++;
    });
    if (visibleCount === 0 && items.length > 0) {
      const listElement = document.getElementById('fontList');
      const noResultsMsg = listElement.querySelector('.no-results-msg');
      if (!noResultsMsg) {
        const msg = document.createElement('div');
        msg.className = 'no-results-msg text-center py-3 text-muted';
        msg.textContent = 'No fonts match your search criteria.';
        listElement.appendChild(msg);
      }
    } else {
      const noResultsMsg = document.querySelector('.no-results-msg');
      if (noResultsMsg) noResultsMsg.remove();
    }
  }

  selectFont(element) {
    document.querySelectorAll('.font-list-item').forEach(item => {
      item.classList.remove('active');
      item.style.backgroundColor = 'transparent';
      item.style.borderLeft = 'none';
    });
    element.classList.add('active');
    element.style.backgroundColor = 'rgba(33, 37, 41, 0.8)';
    element.style.borderLeft = '3px solid #0d6efd';
    const fontName = element.getAttribute('data-font');
    const source = element.getAttribute('data-source');
    const os = element.getAttribute('data-os');
    this.currentFont = {
      name: fontName,
      source: source,
      os: os
    };
    if (this.pendingFontLoad) {
      clearTimeout(this.pendingFontLoad);
    }
    if (source === 'google') {
      const fontData = this.googleFonts.find(f => f.family === fontName);
      if (fontData) {
        this.updateAvailableWeights(fontData.variants);
      }
      const preview = document.getElementById('fontPreview');
      preview.classList.add('font-loading');
      this.loadGoogleFont(fontName, () => {
        preview.classList.remove('font-loading');
        this.updatePreview();
      });
    } else {
      this.updateAvailableWeights(['300', '400', '500', '600', '700']);
      this.updatePreview();
    }
    this.generateCode();
  }

  loadGoogleFont(fontFamily, callback) {
    const linkId = 'google-font-link';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const weights = this.availableWeights.filter(w => w !== 'regular').join(';');
    const encodedFamily = encodeURIComponent(fontFamily);
    link.href = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weights}&display=swap`;
    if ('fonts' in document) {
      if (this.pendingFontLoad) {
        clearTimeout(this.pendingFontLoad);
      }
      this.pendingFontLoad = setTimeout(() => {
        document.fonts.load(`400 10px "${fontFamily}"`).then(() => {
          if (callback) callback();
        }).catch((err) => {
          setTimeout(() => {
            if (callback) callback();
          }, 500);
        });
      }, 100);
    } else {
      setTimeout(() => {
        if (callback) callback();
      }, 800);
    }
    link.onerror = () => {
      const preview = document.getElementById('fontPreview');
      preview.classList.remove('font-loading');
      if (callback) callback();
    };
  }

  updateAvailableWeights(variants) {
    const weightSelect = document.getElementById('fontWeight');
    const currentWeight = weightSelect.value;
    this.availableWeights = variants.filter(v => !v.includes('italic')).map(v => v === 'regular' ? '400' : v).sort((a, b) => parseInt(a) - parseInt(b));
    weightSelect.innerHTML = '';
    const weightNames = {
      '100': 'Thin',
      '200': 'Extra Light',
      '300': 'Light',
      '400': 'Regular',
      '500': 'Medium',
      '600': 'Semi Bold',
      '700': 'Bold',
      '800': 'Extra Bold',
      '900': 'Black'
    };
    this.availableWeights.forEach(weight => {
      const option = document.createElement('option');
      option.value = weight;
      option.textContent = `${weight} - ${weightNames[weight] || 'Custom'}`;
      if (weight === currentWeight || (currentWeight === '400' && weight === '400')) {
        option.selected = true;
      }
      weightSelect.appendChild(option);
    });
    if (!this.availableWeights.includes(currentWeight)) {
      weightSelect.value = this.availableWeights[0] || '400';
    }
  }

  updatePreview() {
    const preview = document.getElementById('fontPreview');
    if (this.currentFont) {
      let fontFamily = this.currentFont.name;
      if (this.currentFont.source === 'system') {
        if (systemFonts[this.currentFont.os]) {
          fontFamily = systemFonts[this.currentFont.os][this.currentFont.name];
        } else {
          fontFamily = systemFonts.all[this.currentFont.name];
        }
      } else {
        fontFamily = `'${fontFamily}', sans-serif`;
      }
      preview.style.fontFamily = fontFamily;
    }
    preview.style.fontSize = document.getElementById('fontSize').value + 'px';
    preview.style.fontWeight = document.getElementById('fontWeight').value;
    preview.style.lineHeight = document.getElementById('lineHeight').value;
    preview.style.letterSpacing = document.getElementById('letterSpacing').value + 'px';
    preview.style.color = document.getElementById('textColor').value;
    preview.style.backgroundColor = document.getElementById('bgColor').value;
  }

  updateTextSample(type) {
    const content = document.getElementById('previewContent');
    const customContainer = document.getElementById('customTextContainer');
    customContainer.style.display = type === 'custom' ? 'block' : 'none';
    let html = '';
    switch(type) {
      case 'custom':
        html = `<p>${document.getElementById('customText').value}</p>`;
        break;
      case 'alphabet':
        html = `
          <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
          <p>abcdefghijklmnopqrstuvwxyz</p>
          <p>0123456789</p>
          <p>!@#$%^&*()_+-=[]{}|;':",./<>?</p>
        `;
        break;
      case 'paragraph':
        html = `
          <p>The quick brown fox jumps over the lazy dog.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Pack my box with five dozen liquor jugs.</p>
        `;
        break;
      case 'headings':
        html = `
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
          <p>Body text paragraph</p>
        `;
        break;
      case 'numbers':
        html = `
          <p>0123456789</p>
          <p>$1,234.56 | €987.65 | £543.21</p>
          <p>+ - × ÷ = ≠ < > ≤ ≥ ± ∞</p>
          <p>!@#$%^&*()_+-=[]{}|;':",./<>?</p>
        `;
        break;
    }
    content.innerHTML = html;
  }

  updateDevicePreview(device) {
    const preview = document.getElementById('fontPreview');
    preview.className = 'font-preview-area';
    if (device === 'mobile') {
      preview.classList.add('device-frame', 'mobile');
    } else if (device === 'tablet') {
      preview.classList.add('device-frame', 'tablet');
    }
  }

  checkContrast() {
    const textColor = this.hexToRgb(document.getElementById('textColor').value);
    const bgColor = this.hexToRgb(document.getElementById('bgColor').value);
    if (!textColor || !bgColor) return;
    const ratio = this.getContrastRatio(textColor, bgColor);
    const ratioElement = document.getElementById('contrastRatio');
    let badge = '';
    if (ratio >= 7) {
      badge = `<span class="contrast-badge contrast-pass">${ratio.toFixed(1)}:1 AAA</span>`;
    } else if (ratio >= 4.5) {
      badge = `<span class="contrast-badge contrast-aa">${ratio.toFixed(1)}:1 AA</span>`;
    } else if (ratio >= 3) {
      badge = `<span class="contrast-badge contrast-aa">${ratio.toFixed(1)}:1 AA Large</span>`;
    } else {
      badge = `<span class="contrast-badge contrast-fail">${ratio.toFixed(1)}:1 Fail</span>`;
    }
    ratioElement.innerHTML = badge;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  generateCode() {
    if (!this.currentFont) return;
    const fontSize = document.getElementById('fontSize').value;
    const fontWeight = document.getElementById('fontWeight').value;
    const lineHeight = document.getElementById('lineHeight').value;
    const letterSpacing = document.getElementById('letterSpacing').value;
    const textColor = document.getElementById('textColor').value;
    let fontFamily = this.currentFont.name;
    let importCode = '';
    if (this.currentFont.source === 'google') {
      const weights = this.availableWeights.filter(w => w !== 'regular').join(';');
      importCode = `/* Google Fonts Import */\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@${weights}&display=swap" rel="stylesheet">`;
      fontFamily = `'${fontFamily}', sans-serif`;
    } else {
      if (systemFonts[this.currentFont.os]) {
        fontFamily = systemFonts[this.currentFont.os][this.currentFont.name];
      } else {
        fontFamily = systemFonts.all[this.currentFont.name];
      }
      importCode = `/* System Font Stack - No import needed */\n/* ${this.currentFont.name} is a ${this.currentFont.os || 'web-safe'} system font */`;
    }
    const textColorRgb = this.hexToRgb(textColor);
    const bgColorRgb = this.hexToRgb(document.getElementById('bgColor').value);
    const contrastRatio = textColorRgb && bgColorRgb ? this.getContrastRatio(textColorRgb, bgColorRgb) : 0;
    const contrastWarning = contrastRatio < 4.5 ? '\n  /* WARNING: Low contrast ratio (' + contrastRatio.toFixed(1) + ':1) - may fail accessibility standards */' : '';
    const cssCode = `/* ${this.currentFont.name} Font Styles */\nbody {\n  font-family: ${fontFamily};\n  font-size: ${fontSize}px;\n  font-weight: ${fontWeight};\n  line-height: ${lineHeight};\n  letter-spacing: ${letterSpacing}px;\n  color: ${textColor};${contrastWarning}\n  \n  /* Performance optimization */\n  font-display: swap;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n/* Responsive font sizing */\n@media (max-width: 768px) {\n  body {\n    font-size: ${Math.max(14, fontSize - 2)}px;\n  }\n}`;
    const scssCode = `// ${this.currentFont.name} Font Variables\n$font-family-base: ${fontFamily};\n$font-size-base: ${fontSize}px;\n$font-weight-base: ${fontWeight};\n$line-height-base: ${lineHeight};\n$letter-spacing-base: ${letterSpacing}px;\n$text-color: ${textColor};\n\n// Mixin for font styles\n@mixin font-base {\n  font-family: $font-family-base;\n  font-size: $font-size-base;\n  font-weight: $font-weight-base;\n  line-height: $line-height-base;\n  letter-spacing: $letter-spacing-base;\n  color: $text-color;${contrastWarning}\n  font-display: swap;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n// Apply styles\nbody {\n  @include font-base;\n}`;
    document.getElementById('cssCode').textContent = cssCode;
    document.getElementById('importCode').textContent = importCode;
    document.getElementById('scssCode').textContent = scssCode;
  }

  resetSettings() {
    document.getElementById('fontSize').value = 16;
    document.getElementById('fontSizeRange').value = 16;
    document.getElementById('fontWeight').value = 400;
    document.getElementById('lineHeight').value = 1.5;
    document.getElementById('lineHeightRange').value = 1.5;
    document.getElementById('letterSpacing').value = 0;
    document.getElementById('letterSpacingRange').value = 0;
    document.getElementById('textColor').value = '#ffffff';
    document.getElementById('textColorHex').value = '#ffffff';
    document.getElementById('bgColor').value = '#1a1a1a';
    document.getElementById('bgColorHex').value = '#1a1a1a';
    document.getElementById('textSample').value = 'paragraph';
    document.getElementById('devicePreview').value = 'desktop';
    this.updateTextSample('paragraph');
    this.updateDevicePreview('desktop');
    this.updatePreview();
    this.checkContrast();
    if (this.currentFont) {
      this.generateCode();
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = new bootstrap.Toast(document.getElementById('copyToast'));
      toast.show();
    }).catch(err => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        toast.show();
      } catch (err) {}
      document.body.removeChild(textarea);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FontChooser();
});
