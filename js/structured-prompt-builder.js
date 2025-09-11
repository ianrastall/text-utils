// Structured Prompt Builder JavaScript
(function() {
  'use strict';

  const dom = {};

  function init() {
    cacheDOM();
    bindEventListeners();
    generatePrompt(); // Initial generation on load
  }

  function cacheDOM() {
    dom.form = document.getElementById('prompt-form');
    dom.outputPrompt = document.getElementById('output-prompt');
    dom.addFieldBtn = document.getElementById('add-field-btn');
    dom.customFieldsContainer = document.getElementById('custom-fields-container');
    dom.copyBtn = document.getElementById('copy-btn');
    dom.toastContainer = document.getElementById('toastContainer');
    dom.codeFieldsContainer = document.getElementById('code-fields-container');
    dom.addCodeBtn = document.getElementById('add-code-btn');
    dom.lineCount = document.getElementById('line-count');
    dom.charCount = document.getElementById('char-count');
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

  const generatePrompt = () => {
    let promptString = '---\n';
    // Standard fields (excluding code fields)
    const standardInputs = dom.form.querySelectorAll('input[type="text"], textarea:not(.code-field)');
    standardInputs.forEach(input => {
      if (input.value.trim() !== '') {
        const labelEl = dom.form.querySelector(`label[for="${input.id}"]`);
        if (labelEl) {
          const label = labelEl.textContent.replace('(one per line)', '').trim();
          if (input.id === 'key-points') {
            const points = input.value.trim().split('\n').map(p => `  - ${p.trim()}`).join('\n');
            promptString += `${label}:\n${points}\n`;
          } else {
            promptString += `${label}: ${input.value.trim()}\n`;
          }
        }
      }
    });

    // Custom fields
    const customFields = dom.customFieldsContainer.querySelectorAll('.custom-field');
    customFields.forEach(field => {
      const key = field.querySelector('.custom-key').value.trim();
      const value = field.querySelector('.custom-value').value.trim();
      if (key && value) {
        promptString += `${key}: ${value}\n`;
      }
    });

    // Code fields
    const codeFields = dom.codeFieldsContainer.querySelectorAll('.code-field');
    codeFields.forEach((field, idx) => {
      const code = field.value.trim();
      if (code) {
        promptString += `Code Block ${idx + 1}: |\n`;
        promptString += code.split('\n').map(line => '  ' + line).join('\n') + '\n';
      }
    });

    promptString += '---';
    dom.outputPrompt.value = promptString;

    // Update line and character count
    if (dom.lineCount && dom.charCount) {
      const lines = promptString.split(/\r?\n/).length;
      const chars = promptString.length;
      dom.lineCount.textContent = lines;
      dom.charCount.textContent = chars;
    }
  };

  function bindEventListeners() {
    dom.form.addEventListener('input', generatePrompt);
    dom.customFieldsContainer.addEventListener('input', generatePrompt);
    if (dom.codeFieldsContainer) {
      dom.codeFieldsContainer.addEventListener('input', generatePrompt);
    }

    dom.addFieldBtn.addEventListener('click', () => {
      const newField = document.createElement('div');
      newField.className = 'custom-field input-group input-group-sm mb-2';
      newField.innerHTML = `
        <input type="text" class="form-control custom-key" placeholder="Field Name">
        <span class="input-group-text">:</span>
        <input type="text" class="form-control custom-value" placeholder="Field Value">
        <button type="button" class="btn btn-outline-danger remove-field-btn">&times;</button>
      `;
      dom.customFieldsContainer.appendChild(newField);
      newField.querySelector('.remove-field-btn').addEventListener('click', (e) => {
        e.target.closest('.custom-field').remove();
        generatePrompt();
      });
    });

    // Add code block functionality
    if (dom.addCodeBtn && dom.codeFieldsContainer) {
      dom.addCodeBtn.addEventListener('click', () => {
        const codeBlock = document.createElement('div');
        codeBlock.className = 'mb-3 code-block-wrapper';
        codeBlock.innerHTML = `
          <div class="d-flex align-items-center mb-1">
            <span class="material-icons me-2" aria-hidden="true">code</span>
            <span>Code Block</span>
            <button type="button" class="btn btn-outline-danger btn-sm ms-auto remove-code-btn" title="Remove Code Block">&times;</button>
          </div>
          <textarea class="form-control code-field font-monospace" rows="6" placeholder="Paste code here..."></textarea>
        `;
        dom.codeFieldsContainer.appendChild(codeBlock);
        codeBlock.querySelector('.remove-code-btn').addEventListener('click', (e) => {
          e.target.closest('.code-block-wrapper').remove();
          generatePrompt();
        });
        // Focus the new code field
        codeBlock.querySelector('textarea').focus();
        generatePrompt();
      });
      // Add two code blocks by default
      for (let i = 0; i < 2; i++) {
        dom.addCodeBtn.click();
      }
    }

    dom.copyBtn.addEventListener('click', () => {
      const textToCopy = dom.outputPrompt.value;
      if (!textToCopy) {
        showToast('Nothing to copy.', 'warning');
        return;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Prompt copied!', 'success');
      }).catch(err => {
        showToast('Copy failed. Check browser permissions.', 'danger');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
