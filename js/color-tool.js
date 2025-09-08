/* global document, navigator */
import { generatePalette, wcagRating } from './color-math.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

const basePicker = $('#basePicker');
const baseHex    = $('#baseHex');
const harmonySel = $('#harmony');
const paletteOl  = $('#palette');

const render = () => {
  paletteOl.innerHTML = '';
  const base = basePicker.value;
  const type = harmonySel.value;
  const colors = generatePalette(type, base);

  colors.forEach(c => {
    const li = document.createElement('li');
    li.className = 'color-swatch d-flex justify-content-between align-items-center p-3 rounded';
    li.style.background = c.hex;
    li.style.color = c.contrastText;

    li.innerHTML = `
      <span>
        <strong>${c.label}</strong>
        <code class="ms-2">${c.hex}</code>
      </span>
      <span class="badge" style="background:${c.rating.bg};color:${c.rating.fg}">
        ${c.rating.text}
      </span>`;

    li.addEventListener('click', () => navigator.clipboard.writeText(c.hex));
    paletteOl.append(li);
  });
};

/* ----  bindings  ---- */
[basePicker, harmonySel].forEach(el => el.addEventListener('input', render));
baseHex.addEventListener('input', e => {
  const val = e.target.value;
  if (/^#[0-9A-F]{6}$/i.test(val)) { basePicker.value = val; render(); }
});
$('#randomBtn').addEventListener('click', () => {
  basePicker.value = '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
  render();
});

render();   // first paint