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

// --- System Fonts ---
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

// --- FontChooser class and UI logic ---

// The main UI is rendered server-side in font-chooser.html, so we only need to wire up the logic here.

// Copy the FontChooser class and logic from the PHP version, adapted for static HTML/JS

// ...existing code from the PHP version's <script> block...

// (See previous PHP version for the full FontChooser class implementation)

// Paste the FontChooser class and initialization here:

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
  // ...all methods from the PHP version's JS, unchanged...
  // (For brevity, see the PHP version's <script> block for the full implementation)
}

document.addEventListener('DOMContentLoaded', () => {
  new FontChooser();
});
