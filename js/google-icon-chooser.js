// google-icon-chooser.js
// Loads categories and icons from google-icon-categories/*.txt and implements the chooser UI

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    const categorySelect = document.getElementById('categorySelect');
    const languageSelect = document.getElementById('languageSelect');
    const searchFilter = document.getElementById('searchFilter');
    const iconsGrid = document.getElementById('iconsGrid');
    const outputText = document.getElementById('outputText');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const iconCountEl = document.getElementById('iconCount');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const gridPlaceholder = document.getElementById('gridPlaceholder');

    let selectedIcon = null;
    let currentCategoryIcons = [];
    let categoriesData = {};
    let iconData = {};

    // Utility: fetch all .txt files in google-icon-categories
    async function loadCategoriesAndIcons() {
        // List of category files (hardcoded, or you can generate this list server-side and fetch it)
        const categoryFiles = [
            'action', 'alert', 'av', 'communication', 'content', 'device', 'editor', 'file', 'hardware', 'home', 'image', 'maps', 'navigation', 'notification', 'places', 'search', 'social', 'toggle'
        ];
        categoriesData = {};
        iconData = {};
        for (const slug of categoryFiles) {
            const display = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            categoriesData[slug] = display;
            try {
                const resp = await fetch(`google-icon-categories/${slug}.txt`);
                if (!resp.ok) continue;
                const text = await resp.text();
                const icons = [];
                text.split(/\r?\n/).forEach(line => {
                    if (!line.trim()) return;
                    const parts = line.split('\t');
                    if (parts.length === 2) {
                        let name = parts[0].trim();
                        let codepoint = parts[1].trim().toLowerCase();
                        if (/^[a-z0-9_]+$/.test(name) && /^[0-9a-f]{4,5}$/.test(codepoint)) {
                            icons.push({ name, codepoint });
                        }
                    }
                });
                if (icons.length) iconData[slug] = icons;
            } catch (e) { /* ignore */ }
        }
    }

    function populateCategorySelect() {
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        for (const [slug, display] of Object.entries(categoriesData)) {
            const opt = document.createElement('option');
            opt.value = slug;
            opt.textContent = display;
            categorySelect.appendChild(opt);
        }
    }

    const toPascalCase = (str) => str.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const debounce = (func, delay) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => func.apply(this, args), delay); }; };

    function renderIcons() {
        const query = searchFilter.value.toLowerCase();
        const filteredIcons = query ? currentCategoryIcons.filter(icon => icon.name.includes(query)) : currentCategoryIcons;
        iconsGrid.innerHTML = '';
        iconCountEl.textContent = String(filteredIcons.length);
        if (filteredIcons.length === 0) {
            gridPlaceholder.textContent = 'No icons found for this filter.';
            iconsGrid.appendChild(gridPlaceholder);
            return;
        }
        const fragment = document.createDocumentFragment();
        filteredIcons.forEach(icon => {
            const item = document.createElement('div');
            item.className = 'icon-item';
            item.title = `${icon.name} (U+${icon.codepoint.toUpperCase()})`;
            item.tabIndex = 0;
            item.setAttribute('role', 'gridcell');
            item.setAttribute('aria-label', icon.name);
            item.setAttribute('aria-selected', 'false');
            const iconEl = document.createElement('i');
            iconEl.className = 'material-icons';
            iconEl.textContent = icon.name;
            iconEl.setAttribute('aria-hidden', 'true');
            item.appendChild(iconEl);
            item.addEventListener('click', () => selectIcon(icon, item));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectIcon(icon, item); }
            });
            fragment.appendChild(item);
        });
        iconsGrid.appendChild(fragment);
    }
    const debouncedRender = debounce(renderIcons, 250);

    function handleCategoryChange() {
        const cat = categorySelect.value;
        searchFilter.value = '';
        selectedIcon = null;
        outputText.value = '';
        gridPlaceholder.style.display = 'none';
        if (!cat || !iconData[cat]) {
            iconCountEl.textContent = '0';
            iconsGrid.innerHTML = '';
            gridPlaceholder.textContent = 'Select a category to view icons.';
            gridPlaceholder.style.display = 'block';
            searchFilter.disabled = true;
            return;
        }
        currentCategoryIcons = iconData[cat];
        searchFilter.disabled = false;
        searchFilter.placeholder = `Filter ${currentCategoryIcons.length} icons...`;
        loadingIndicator.style.display = 'block';
        setTimeout(() => {
            renderIcons();
            loadingIndicator.style.display = 'none';
        }, 50);
    }

    function selectIcon(iconObj, domEl) {
        const activeEl = iconsGrid.querySelector('[aria-selected="true"]');
        if (activeEl) {
            activeEl.classList.remove('active');
            activeEl.setAttribute('aria-selected', 'false');
        }
        domEl.classList.add('active');
        domEl.setAttribute('aria-selected', 'true');
        selectedIcon = iconObj;
        generateCode();
    }

    function generateCode() {
        if (!selectedIcon) return;
        const { name, codepoint } = selectedIcon;
        const format = languageSelect.value;
        let snippet = '';
        let comment = `/* Icon: ${name} | Codepoint: ${codepoint} */`;
        switch (format) {
            case 'html':
                snippet = `<span class=\"material-icons\">${name}</span>`;
                break;
            case 'css_content':
                snippet = `.your-selector::before {\n  content: '\\${codepoint}';\n  font-family: 'Material Icons';\n  /* ... other required styles ... */\n}`;
                break;
            case 'react_mui':
                const reactName = toPascalCase(name);
                comment = `// 1. import ${reactName}Icon from '@mui/icons-material/${reactName}';\n// 2. Use in JSX:`;
                snippet = `<${reactName}Icon />`;
                break;
            case 'js_dom':
                 comment = `// Create icon element with JavaScript:`;
                 snippet = `const iconEl = document.createElement('span');\niconEl.className = 'material-icons';\niconEl.textContent = '${name}';\ndocument.body.appendChild(iconEl);`;
                 break;
            case 'icon_name':
                comment = `/* Icon name: */`;
                snippet = name;
                break;
            case 'codepoint':
                comment = `/* Hex Codepoint: */`;
                snippet = codepoint;
                break;
        }
        outputText.value = `${comment}\n\n${snippet}`;
    }

    async function copySnippet() {
        if (!outputText.value || outputText.value.startsWith('Select an icon')) {
            showToast('Nothing to copy.', 'warning');
            return;
        }
        try {
            await navigator.clipboard.writeText(outputText.value);
            showToast('Snippet copied!', 'success');
        } catch (err) { showToast('Copy failed.', 'danger'); }
    }

    function clearSelection() {
        const activeEl = iconsGrid.querySelector('[aria-selected="true"]');
        if (activeEl) {
            activeEl.classList.remove('active');
            activeEl.setAttribute('aria-selected', 'false');
        }
        selectedIcon = null;
        outputText.value = '';
        showToast('Selection cleared.', 'info');
        categorySelect.focus();
    }

    function showToast(message, variant = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '1100';
            document.body.appendChild(container);
        }
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-bg-${variant} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        const dFlex = document.createElement('div');
        dFlex.className = 'd-flex';
        const toastBody = document.createElement('div');
        toastBody.className = 'toast-body';
        toastBody.textContent = message; // Use textContent for security
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn-close btn-close-white me-2 m-auto';
        closeBtn.setAttribute('data-bs-dismiss', 'toast');
        closeBtn.setAttribute('aria-label', 'Close');
        dFlex.appendChild(toastBody);
        dFlex.appendChild(closeBtn);
        toastEl.appendChild(dFlex);
        container.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }

    categorySelect.addEventListener('change', handleCategoryChange);
    searchFilter.addEventListener('input', debouncedRender);
    languageSelect.addEventListener('change', generateCode);
    copyBtn.addEventListener('click', copySnippet);
    clearBtn.addEventListener('click', clearSelection);

    // Initial load
    (async function() {
        loadingIndicator.style.display = 'block';
        await loadCategoriesAndIcons();
        populateCategorySelect();
        loadingIndicator.style.display = 'none';
        handleCategoryChange();
    })();
});
