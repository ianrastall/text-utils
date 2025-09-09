document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const mainText = document.getElementById('mainText');
    const entityTypeSelect = document.getElementById('entityTypeSelect');
    const encodeBtn = document.getElementById('encodeBtn');
    const decodeBtn = document.getElementById('decodeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    // A map of common characters to their named entities
    const NAMED_ENTITY_MAP = {
        "'": "&apos;", "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;",
        " ": "&nbsp;", "¡": "&iexcl;", "¢": "&cent;", "£": "&pound;", "¤": "&curren;",
        "¥": "&yen;", "¦": "&brvbar;", "§": "&sect;", "¨": "&uml;", "©": "&copy;",
        "ª": "&ordf;", "«": "&laquo;", "¬": "&not;", "­": "&shy;", "®": "&reg;",
        "¯": "&macr;", "°": "&deg;", "±": "&plusmn;", "²": "&sup2;", "³": "&sup3;",
        "´": "&acute;", "µ": "&micro;", "¶": "&para;", "·": "&middot;", "¸": "&cedil;",
        "¹": "&sup1;", "º": "&ordm;", "»": "&raquo;", "¼": "&frac14;", "½": "&frac12;",
        "¾": "&frac34;", "¿": "&iquest;", "À": "&Agrave;", "Á": "&Aacute;", "Â": "&Acirc;",
        "Ã": "&Atilde;", "Ä": "&Auml;", "Å": "&Aring;", "Æ": "&AElig;", "Ç": "&Ccedil;",
        "È": "&Egrave;", "É": "&Eacute;", "Ê": "&Ecirc;", "Ë": "&Euml;", "Ì": "&Igrave;",
        "Í": "&Iacute;", "Î": "&Icirc;", "Ï": "&Iuml;", "Ð": "&ETH;", "Ñ": "&Ntilde;",
        "Ò": "&Ograve;", "Ó": "&Oacute;", "Ô": "&Ocirc;", "Õ": "&Otilde;", "Ö": "&Ouml;",
        "×": "&times;", "Ø": "&Oslash;", "Ù": "&Ugrave;", "Ú": "&Uacute;", "Û": "&Ucirc;",
        "Ü": "&Uuml;", "Ý": "&Yacute;", "Þ": "&THORN;", "ß": "&szlig;", "à": "&agrave;",
        "á": "&aacute;", "â": "&acirc;", "ã": "&atilde;", "ä": "&auml;", "å": "&aring;",
        "æ": "&aelig;", "ç": "&ccedil;", "è": "&egrave;", "é": "&eacute;", "ê": "&ecirc;",
        "ë": "&euml;", "ì": "&igrave;", "í": "&iacute;", "î": "&icirc;", "ï": "&iuml;",
        "ð": "&eth;", "ñ": "&ntilde;", "ò": "&ograve;", "ó": "&oacute;", "ô": "&ocirc;",
        "õ": "&otilde;", "ö": "&ouml;", "÷": "&divide;", "ø": "&oslash;", "ù": "&ugrave;",
        "ú": "&uacute;", "û": "&ucirc;", "ü": "&uuml;", "ý": "&yacute;", "þ": "&thorn;",
        "ÿ": "&yuml;", "Œ": "&OElig;", "œ": "&oelig;", "Š": "&Scaron;", "š": "&scaron;",
        "Ÿ": "&Yuml;", "ƒ": "&fnof;", "ˆ": "&circ;", "˜": "&tilde;", "–": "&ndash;",
        "—": "&mdash;", "‘": "&lsquo;", "’": "&rsquo;", "‚": "&sbquo;", "“": "&ldquo;",
        "”": "&rdquo;", "„": "&bdquo;", "†": "&dagger;", "‡": "&Dagger;", "•": "&bull;",
        "…": "&hellip;", "‰": "&permil;", "′": "&prime;", "″": "&Prime;", "‹": "&lsaquo;",
        "›": "&rsaquo;", "‾": "&oline;", "⁄": "&frasl;", "€": "&euro;", "ℑ": "&image;",
        "℘": "&weierp;", "ℜ": "&real;", "™": "&trade;", "ℵ": "&alefsym;", "←": "&larr;",
        "↑": "&uarr;", "→": "&rarr;", "↓": "&darr;", "↔": "&harr;", "↵": "&crarr;",
        "⇐": "&lArr;", "⇑": "&uArr;", "⇒": "&rArr;", "⇓": "&dArr;", "⇔": "&hArr;",
        "∀": "&forall;", "∂": "&part;", "∃": "&exist;", "∅": "&empty;", "∇": "&nabla;",
        "∈": "&isin;", "∉": "&notin;", "∋": "&ni;", "∏": "&prod;", "∑": "&sum;",
        "−": "&minus;", "∗": "&lowast;", "√": "&radic;", "∝": "&prop;", "∞": "&infin;",
        "∠": "&ang;", "∧": "&and;", "∨": "&or;", "∩": "&cap;", "∪": "&cup;",
        "∫": "&int;", "∴": "&there4;", "∼": "&sim;", "≅": "&cong;", "≈": "&asymp;",
        "≠": "&ne;", "≡": "&equiv;", "≤": "&le;", "≥": "&ge;", "⊂": "&sub;",
        "⊃": "&sup;", "⊄": "&nsub;", "⊆": "&sube;", "⊇": "&supe;", "⊕": "&oplus;",
        "⊗": "&otimes;", "⊥": "&perp;", "⋅": "&sdot;", "⌈": "&lceil;", "⌉": "&rceil;",
        "⌊": "&lfloor;", "⌋": "&rfloor;", "⟨": "&lang;", "⟩": "&rang;", "◊": "&loz;",
        "♠": "&spades;", "♣": "&clubs;", "♥": "&hearts;", "♦": "&diams;"
    };

    const encodeEntities = (text, type) => {
        if (!text) return '';
        try {
            return [...text].map(char => {
                const cp = char.codePointAt(0);
                if (cp <= 127) return char; // Keep ASCII as is

                switch(type) {
                    case 'decimal':
                        return `&#${cp};`;
                    case 'named':
                        // Fallback to hex if no named entity exists
                        return NAMED_ENTITY_MAP[char] || `&#x${cp.toString(16).toUpperCase()};`;
                    case 'hex':
                    default:
                        return `&#x${cp.toString(16).toUpperCase()};`;
                }
            }).join('');
        } catch (e) {
            showToast("Encoding failed.", "danger");
            return text;
        }
    };

    const decodeHtmlEntities = (text) => {
        if (!text) return '';
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<!DOCTYPE html><html><body>${text}</body></html>`, 'text/html');
            return doc.body.textContent || doc.body.innerText || '';
        } catch (e) {
            showToast("Decoding failed.", "danger");
            return text;
        }
    };

    encodeBtn.addEventListener('click', () => {
        if (!mainText.value) { 
            showToast('Nothing to encode.', 'info'); 
            return; 
        }
        const entityType = entityTypeSelect.value;
        mainText.value = encodeEntities(mainText.value, entityType);
        showToast(`Encoded non-ASCII characters to ${entityType} entities.`, "success");
        mainText.focus();
    });

    decodeBtn.addEventListener('click', () => {
        if (!mainText.value) { 
            showToast('Nothing to decode.', 'info'); 
            return; 
        }
        mainText.value = decodeHtmlEntities(mainText.value);
        showToast("Decoded all HTML entities.", "success");
        mainText.focus();
    });

    copyBtn.addEventListener('click', async () => {
        if (!mainText.value) { 
            showToast('Nothing to copy.', 'warning'); 
            return; 
        }
        try {
            await navigator.clipboard.writeText(mainText.value);
            showToast('Result copied!', 'success');
        } catch (err) { 
            showToast('Copy failed.', 'danger'); 
        }
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            mainText.value = await navigator.clipboard.readText();
            showToast('Pasted from clipboard.', 'info');
            mainText.focus();
        } catch (err) { 
            showToast('Paste failed. Check permissions.', 'warning');
        }
    });

    clearBtn.addEventListener('click', () => {
        mainText.value = '';
        showToast('Cleared text.', 'info');
        mainText.focus();
    });
    
    // Toast notification function
    function showToast(message, variant = 'info') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
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
});
