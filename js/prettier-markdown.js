document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const dom = {
        editor: document.getElementById('markdownEditor'),
        formatBtn: document.getElementById('formatBtn'),
        copyBtn: document.getElementById('copyBtn'),
        pasteBtn: document.getElementById('pasteBtn'),
        clearBtn: document.getElementById('clearBtn'),
        announcer: document.getElementById('sr-announcer')
    };

    if (!dom.editor || !dom.formatBtn) {
        console.warn('Prettier Markdown tool: required DOM elements not found.');
        return;
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
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        container.appendChild(toastEl);
        if (window.bootstrap?.Toast) {
            const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
            toast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        } else {
            setTimeout(() => toastEl.remove(), 3000);
        }
    }

    function announce(message) {
        if (!dom.announcer) return;
        dom.announcer.textContent = '';
        setTimeout(() => {
            dom.announcer.textContent = message;
        }, 100);
    }

    function ensurePrettierReady() {
        const prettier = window.prettier;
        const markdownPlugin = window.prettierPlugins?.markdown;
        if (!prettier || !markdownPlugin) {
            showToast('Prettier failed to load. Check your internet connection.', 'danger');
            return null;
        }
        return { prettier, markdownPlugin };
    }

    function formatMarkdown() {
        const state = ensurePrettierReady();
        if (!state) return;
        const { prettier, markdownPlugin } = state;
        const source = dom.editor.value;
        if (!source.trim()) {
            showToast('Nothing to format yet.', 'info');
            return;
        }
        dom.formatBtn.disabled = true;
        dom.formatBtn.classList.add('disabled');
        try {
            const formatted = prettier.format(source, {
                parser: 'markdown',
                plugins: [markdownPlugin],
                proseWrap: 'preserve',
                tabWidth: 2,
                useTabs: false,
                singleQuote: false,
                printWidth: 80
            });
            dom.editor.value = formatted;
            showToast('Markdown formatted.', 'success');
            announce('Markdown formatting complete.');
        } catch (error) {
            console.error('Prettier formatting failed', error);
            showToast('Formatting failed. Check console for details.', 'danger');
            announce('Formatting failed.');
        } finally {
            dom.formatBtn.disabled = false;
            dom.formatBtn.classList.remove('disabled');
        }
    }

    async function pasteClipboard() {
        if (!navigator.clipboard?.readText) {
            showToast('Clipboard paste is not supported in this browser.', 'warning');
            return;
        }
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                showToast('Clipboard is empty.', 'info');
                return;
            }
            dom.editor.value = text;
            dom.editor.focus();
            showToast('Pasted from clipboard.', 'success');
            announce('Markdown pasted from clipboard.');
        } catch (error) {
            console.error('Clipboard paste failed', error);
            showToast('Paste failed. Check permissions.', 'danger');
        }
    }

    async function copyAll() {
        const text = dom.editor.value;
        if (!text) {
            showToast('Nothing to copy.', 'info');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showToast('Markdown copied to clipboard.', 'success');
            announce('Markdown copied to clipboard.');
        } catch (error) {
            console.error('Clipboard copy failed', error);
            showToast('Copy failed. Check permissions.', 'danger');
        }
    }

    function clearEditor() {
        dom.editor.value = '';
        dom.editor.focus();
        showToast('Cleared Markdown.', 'info');
        announce('Markdown cleared.');
    }

    dom.formatBtn.addEventListener('click', formatMarkdown);
    dom.copyBtn?.addEventListener('click', copyAll);
    dom.pasteBtn?.addEventListener('click', pasteClipboard);
    dom.clearBtn?.addEventListener('click', clearEditor);

    dom.editor.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key.toLowerCase() === 'enter') {
            event.preventDefault();
            formatMarkdown();
        }
    });
});
