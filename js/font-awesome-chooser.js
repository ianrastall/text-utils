// font-awesome-chooser.js
// Loads categories and icons from font-awesome-categories/*.txt and implements the chooser UI

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    const categorySelect = document.getElementById('categorySelect');
    const codeFormatSelect = document.getElementById('codeFormatSelect');
    const searchFilter = document.getElementById('searchFilter');
    const iconsGrid = document.getElementById('iconsGrid');
    const iconCountEl = document.getElementById('iconCount');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const gridPlaceholder = document.getElementById('gridPlaceholder');
    const outputSnippet = document.getElementById('outputSnippet');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    let selectedIcon = null;
    let currentCategoryIcons = [];
    let categoriesData = {};
    let iconData = {};

    // Utility: fetch all .txt files in font-awesome-categories
    async function loadCategoriesAndIcons() {
        // List of category files (hardcoded, or you can generate this list server-side and fetch it)
        const categoryFiles = [
            'accessibility', 'brand', 'chart', 'currency', 'directional', 'file-type', 'form-control', 'gender', 'hand', 'payment', 'spinner', 'text-editor', 'transportation', 'video-player', 'web-application'
        ];
        categoriesData = {};
        iconData = {};
        for (const slug of categoryFiles) {
            const display = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            categoriesData[slug] = display;
            try {
                const resp = await fetch(`font-awesome-categories/${slug}.txt`);
                if (!resp.ok) continue;
                const text = await resp.text();
                const icons = [];
                text.split(/\r?\n/).forEach(line => {
                    if (!line.trim()) return;
                    const parts = line.split('\t');
                    if (parts.length === 2) {
                        let rawName = parts[0].trim().toLowerCase().replace(/\s*\(alias\)\s*/i, '');
                        let codepointEntity = parts[1].trim();
                        const m = codepointEntity.match(/^&#x([0-9a-f]+);?$/i);
                        if (!m) return;
                        const codepoint = m[1].toLowerCase();
                        if (!rawName.startsWith('fa-')) rawName = 'fa-' + rawName;
                        icons.push({ name: rawName, codepoint });
                    }
                });
                if (icons.length) iconData[slug] = icons;
            } catch (e) { /* ignore */ }
        }
    }

    function populateCategorySelect() {
        categorySelect.innerHTML = '<option value="">-- Select a Category --</option>';
        for (const [slug, display] of Object.entries(categoriesData)) {
            const opt = document.createElement('option');
            opt.value = slug;
            opt.textContent = display;
            categorySelect.appendChild(opt);
        }
    }

    const toCamelCase = (str) => 'fa' + str.replace(/^fa-/,'').replace(/-(\w)/g, (_, c) => c.toUpperCase());
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
            item.title = `${icon.name} (\\${icon.codepoint})`;
            item.tabIndex = 0;
            item.setAttribute('role', 'gridcell');
            item.setAttribute('aria-label', icon.name);
            item.setAttribute('aria-selected', 'false');
            const iconEl = document.createElement('i');
            iconEl.className = `fa ${icon.name}`;
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
        outputSnippet.value = '';
        gridPlaceholder.style.display = 'block';
        if (!cat || !iconData[cat]) {
            iconCountEl.textContent = '0';
            iconsGrid.innerHTML = '';
            gridPlaceholder.textContent = 'Select a category to view icons.';
            iconsGrid.appendChild(gridPlaceholder);
            searchFilter.disabled = true;
            return;
        }
        currentCategoryIcons = iconData[cat];
        searchFilter.disabled = false;
        searchFilter.placeholder = `Filter ${currentCategoryIcons.length} icons...`;
        loadingIndicator.style.display = 'block';
        gridPlaceholder.style.display = 'none';
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
        generateSnippet();
    }

    function generateSnippet() {
        if (!selectedIcon) return;
        const { name, codepoint } = selectedIcon;
        const format = codeFormatSelect.value;
        let snippet = '';
        let comment = ``;
        switch (format) {
            case 'html':
                snippet = `<i class="fa ${name}" aria-hidden="true"></i>`;
                break;
            case 'css_before':
                comment = `/* CSS for icon: ${name} */`;
                snippet = `.my-icon::before {\n  font-family: 'FontAwesome';\n  content: '\\${codepoint}';\n  display: inline-block;\n}`;
                break;
            case 'react':
                comment = `// 1. Import: import { ${toCamelCase(name)} } from '@fortawesome/free-solid-svg-icons';\n// 2. Use in JSX:`;
                snippet = `<FontAwesomeIcon icon={${toCamelCase(name)}} />`;
                break;
            case 'js_dom':
                 comment = `// Create icon with JavaScript:`;
                 snippet = `const icon = document.createElement('i');\nicon.className = 'fa ${name}';\nicon.setAttribute('aria-hidden', 'true');\ndocument.body.appendChild(icon);`;
                 break;
            case 'icon_name':
                comment = `/* Icon name: */`;
                snippet = name;
                break;
            case 'codepoint':
                comment = `/* CSS Codepoint: */`;
                snippet = `'\\${codepoint}'`;
                break;
        }
        outputSnippet.value = `${comment}\n${snippet}`;
    }

    function copySnippet() {
        if (!outputSnippet.value || outputSnippet.value.startsWith('Select an icon')) {
            showToast('Nothing to copy.', 'warning');
            return;
        }
        navigator.clipboard.writeText(outputSnippet.value).then(
            () => showToast('Snippet copied!', 'success'),
            () => showToast('Copy failed.', 'danger')
        );
    }

    function clearSelection() {
        const activeEl = iconsGrid.querySelector('[aria-selected="true"]');
        if (activeEl) {
            activeEl.classList.remove('active');
            activeEl.setAttribute('aria-selected', 'false');
        }
        selectedIcon = null;
        outputSnippet.value = '';
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
        toastBody.textContent = message;
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

    // Event listeners
    categorySelect.addEventListener('change', handleCategoryChange);
    searchFilter.addEventListener('input', debouncedRender);
    codeFormatSelect.addEventListener('change', generateSnippet);
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
