// js/ip-info.js: IP Info Tool Logic
(function() {
  'use strict';
  const dom = {};

  function init() {
    cacheDOM();
    bindSidebar();
    bindHeaderFooter();
    dom.userAgentVal.textContent = navigator.userAgent || 'Unavailable';
    bindEvents();
    fetchClientInfo();
  }

  function cacheDOM() {
    dom.publicIpEl = document.getElementById('public-ip-val');
    dom.hostnameEl = document.getElementById('hostname-val');
    dom.userAgentVal = document.getElementById('user-agent-val');
    dom.refreshBtn = document.getElementById('refreshBtn');
  }

  async function fetchClientInfo() {
    dom.publicIpEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching...';
    dom.hostnameEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching...';
    try {
      const ipResponse = await fetch('https://api64.ipify.org?format=json');
      if (!ipResponse.ok) throw new Error('Failed to fetch IP');
      const ipData = await ipResponse.json();
      const publicIp = ipData.ip;
      dom.publicIpEl.textContent = publicIp;
      try {
        const ptrResponse = await fetch(`https://dns.google/resolve?name=${publicIp.split('.').reverse().join('.')}.in-addr.arpa&type=PTR`);
        if (!ptrResponse.ok) throw new Error('Failed to fetch hostname');
        const ptrData = await ptrResponse.json();
        if (ptrData.Answer && ptrData.Answer.length > 0) {
          dom.hostnameEl.textContent = ptrData.Answer[0].data.slice(0, -1);
        } else {
          dom.hostnameEl.textContent = 'No PTR Record Found';
        }
      } catch (e) {
        dom.hostnameEl.textContent = 'Hostname lookup failed';
      }
    } catch (error) {
      dom.publicIpEl.textContent = 'Unavailable';
      dom.hostnameEl.textContent = 'Unavailable';
      showToast('Could not fetch public IP information.', 'danger');
    }
  }

  function bindEvents() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetEl = document.getElementById(btn.dataset.target);
        const textToCopy = targetEl ? targetEl.textContent : '';
        if (!textToCopy || textToCopy.toLowerCase().includes('loading') || textToCopy.toLowerCase().includes('fetching')) {
          showToast('Content is not available to copy yet.', 'info');
          return;
        }
        try {
          await navigator.clipboard.writeText(textToCopy);
          showToast(`'${textToCopy.substring(0, 20)}...' copied!`, 'success');
        } catch (err) {
          showToast('Copy failed.', 'danger');
        }
      });
    });
    dom.refreshBtn.addEventListener('click', fetchClientInfo);
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
    toastEl.setAttribute('aria-live', 'polite');
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

  // Sidebar, header, and footer loading
  function bindSidebar() {
    if (window.loadSidebar) {
      window.loadSidebar(document.getElementById('dynamic-sidebar'), 'ip-info');
    } else if (window.ComponentLoader) {
      window.ComponentLoader.loadSidebar(document.getElementById('dynamic-sidebar'), 'ip-info');
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
