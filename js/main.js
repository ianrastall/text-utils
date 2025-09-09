// js/main.js

// Function to get current page slug from URL
function getCurrentPageSlug() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    // Handle index.html being the root
    if (page === 'index.html' || page === '') {
        return 'index';
    }
    return page.replace('.html', '');
}

// Function to load and render the sidebar
async function loadSidebar() {
    try {
        const response = await fetch('config/tools.json');
        if (!response.ok) throw new Error('Failed to load tools.json');
        const tools = await response.json();

        // Sort tools alphabetically by name
        tools.sort((a, b) => a.name.localeCompare(b.name));

        // Get the current page slug for active state
        const currentPage = getCurrentPageSlug();

        // Generate the sidebar
        const sidebarHtml = tools.map(tool => {
            const isActive = tool.slug === currentPage;
            const activeClass = isActive ? ' active' : '';
            const iconHtml = tool.icon ?
                (tool.icon.endsWith('.svg') || tool.icon.endsWith('.png') ?
                    `<img src="${tool.icon}" alt="" class="icon me-2" aria-hidden="true" />` :
                    `<span class="material-icons me-2" aria-hidden="true">${tool.icon}</span>`) :
                `<span class="me-2" style="width: 24px;"></span>`;

            return `
                <a class="nav-link d-flex align-items-center${activeClass}" href="${tool.slug}.html">
                    ${iconHtml}
                    <span>${tool.name}</span>
                </a>
            `;
        }).join('');

        const sidebarElement = document.getElementById('dynamic-sidebar');
        if (sidebarElement) {
            sidebarElement.innerHTML = sidebarHtml;
        }

    } catch (error) {
        console.error('Error loading sidebar:', error);
        const sidebarElement = document.getElementById('dynamic-sidebar');
        if (sidebarElement) {
            sidebarElement.innerHTML = `<div class="alert alert-danger m-2">Failed to load tools.</div>`;
        }
    }
}

// Initialize theme switcher
function initThemeSwitcher() {
    const themes = [
        'burlywood', 'cadetblue', 'cornflowerblue', 'dodgerblue', 'lightcoral', 'lightgreen', 'plum', 'thistle', 'tomato', 'violet',
        'goldenyellow', 'mutedcoral', 'softpink', 'lightcyan', 'lightgray', 'neongreen', 'brightyellow'
    ];
    const themeDropdown = document.getElementById('accentColorDropdownMenu');
    const htmlElement = document.documentElement;

    function applyTheme(theme) {
        htmlElement.className = ''; // Remove all existing classes
        htmlElement.classList.add('theme-' + theme);
        localStorage.setItem('accentTheme', theme);
    }

    // Populate the dropdown menu
    if (themeDropdown) {
        themes.forEach(theme => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.type = 'button';
            button.textContent = theme;
            button.onclick = () => applyTheme(theme);
            li.appendChild(button);
            themeDropdown.appendChild(li);
        });
    }

    // Set initial theme
    const savedTheme = localStorage.getItem('accentTheme') || 'burlywood';
    applyTheme(savedTheme);
}


// Main initialization function
async function initializePage() {
    // Load header and footer components first
    await ComponentLoader.loadAll();
    
    // Initialize theme switcher after header is loaded
    initThemeSwitcher();
    
    // Load sidebar
    loadSidebar();
    
    // Set current year
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
