// js/ip-info.js: IP Info Tool Logic
(function() {
  'use strict';
  const dom = {};

  function init() {
    cacheDOM();
    bindSidebar();
    bindHeaderFooter();
    bindEvents();
    fetchAllInfo();
  }

  function cacheDOM() {
    dom.publicIpEl = document.getElementById('public-ip-val');
    dom.hostnameEl = document.getElementById('hostname-val');
    dom.asnEl = document.getElementById('asn-val');
    dom.locationEl = document.getElementById('location-val');
    dom.userAgentVal = document.getElementById('user-agent-val');
    dom.browserVal = document.getElementById('browser-val');
    dom.osVal = document.getElementById('os-val');
    dom.deviceTypeVal = document.getElementById('device-type-val');
    dom.screenResolutionVal = document.getElementById('screen-resolution-val');
    dom.colorDepthVal = document.getElementById('color-depth-val');
    dom.pixelRatioVal = document.getElementById('pixel-ratio-val');
    dom.cookiesEnabledVal = document.getElementById('cookies-enabled-val');
    dom.javascriptEnabledVal = document.getElementById('javascript-enabled-val');
    dom.languageVal = document.getElementById('language-val');
    dom.timezoneVal = document.getElementById('timezone-val');
    dom.refreshBtn = document.getElementById('refreshBtn');
  }

  async function fetchAllInfo() {
    // Network info
    dom.publicIpEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching...';
    dom.hostnameEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Fetching...';
    dom.asnEl.textContent = 'Loading...';
    dom.locationEl.textContent = 'Loading...';
    try {
      const ipinfo = await fetch('https://ipinfo.io/json').then(r => r.json());
      dom.publicIpEl.textContent = ipinfo.ip || 'Not available';
      dom.hostnameEl.textContent = ipinfo.hostname || 'Not available';
      dom.asnEl.textContent = ipinfo.org || 'Not available';
      let locationText = 'Not available';
      if (ipinfo.city && ipinfo.country) {
        locationText = `${ipinfo.city}, ${ipinfo.region}, ${ipinfo.country}`;
        if (ipinfo.postal) locationText += ` (${ipinfo.postal})`;
      }
      dom.locationEl.textContent = locationText;
    } catch (e) {
      dom.publicIpEl.textContent = 'Error loading';
      dom.hostnameEl.textContent = 'Error loading';
      dom.asnEl.textContent = 'Error loading';
      dom.locationEl.textContent = 'Error loading';
    }
    // Browser/device info
    dom.userAgentVal.textContent = navigator.userAgent || 'Unavailable';
    dom.browserVal.textContent = getBrowserName();
    dom.osVal.textContent = getOSName();
    dom.deviceTypeVal.textContent = getDeviceType();
    // Screen info
    dom.screenResolutionVal.textContent = `${screen.width} × ${screen.height}`;
    dom.colorDepthVal.textContent = `${screen.colorDepth} bit`;
    dom.pixelRatioVal.textContent = window.devicePixelRatio || 'Not available';
    // Capabilities
    dom.cookiesEnabledVal.textContent = navigator.cookieEnabled ? 'Yes' : 'No';
    dom.javascriptEnabledVal.textContent = 'Yes';
    dom.languageVal.textContent = navigator.language || navigator.userLanguage || 'Not available';
    dom.timezoneVal.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
          showToast('Copied to clipboard!', 'success');
        } catch (err) {
          showToast('Copy failed.', 'danger');
        }
      });
    });
    dom.refreshBtn.addEventListener('click', () => {
      fetchAllInfo();
      showToast('Information refreshed successfully!', 'success');
    });
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

  // Browser/OS/device helpers
  function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1 && ua.indexOf('OPR') === -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edg') > -1) return 'Edge';
    if (ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('MSIE') > -1 || !!document.documentMode) return 'IE';
    return 'Unknown';
  }
  function getOSName() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('like Mac') > -1) return 'iOS';
    return 'Unknown';
  }
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Mobile') > -1) return 'Mobile';
    if (ua.indexOf('Tablet') > -1) return 'Tablet';
    return 'Desktop';
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
