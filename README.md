# Text Utilities

A collection of interactive web-based tools and educational tutorials for text processing, programming, and developer productivity.

Designed by me, but coded by LLMs such as Gemini, Qwen, and Claude, at my own direction.

## Features

- **Text Tools:**  
  - Case converter, find & replace, line operations, remove accents, curly quotes, hashing, random number and sequence generators, and more.
- **Font & Icon Choosers:**  
  - Font Awesome and Google Material icon choosers, font preview tools.
- **IP & Unicode Info:**  
  - IP information lookup, Unicode character explorer.
- **Unit Converters:**  
  - CSS unit converter and other developer-focused utilities.
- **Programming Tutorials:**  
  - In-depth, multi-part tutorials for Ada and other languages, with a focus on safety-critical and high-integrity software engineering.
- **Modern UI:**  
  - Responsive, mobile-friendly design using Bootstrap and custom CSS.

## Project Structure

```text
.
├── components/         # Shared HTML components (header, footer, etc.)
├── config/             # Tool and tutorial configuration files
├── css/                # Stylesheets (Bootstrap, custom, tutorials)
├── font-awesome-categories/  # Font Awesome icon category lists
├── google-icon-categories/   # Google icon category lists
├── img/                # Site images and logos
├── includes/           # Data files (trivia, unicode, user data, etc.)
├── js/                 # JavaScript for tools, tutorials, and UI
│   └── cdn/            # Prettier and other CDN JS dependencies
├── tutorials/          # Programming tutorials (Ada, etc.)
│   └── ada/            # Ada tutorial HTML and index
├── *.html              # Main tool and landing pages
├── README.md           # This file
└── LICENSE             # License information
```

## Getting Started

1. **Clone the repository:**

   ```sh
   git clone https://github.com/ianrastall/text-utils.git
   ```

2. **Run a local web server (recommended):**

   Many tools and tutorials load data files (JSON, text, etc.) using JavaScript. Most browsers block these requests when opening files directly from disk (`file://`).

   To avoid errors, run a simple local server in the project directory. For example:

   - **Python 3:**

     ```sh
     python -m http.server 8000
     ```

     Then open [http://localhost:8000/](http://localhost:8000/) in your browser.

   - **Node.js (http-server):**

     ```sh
     npx http-server -p 8000
     ```

   - **VS Code Live Server extension** also works well.

3. **Open `index.html` in your browser** (via the local server) to access the main landing page and explore available tools and tutorials.

4. **Browse tutorials:**

   - Visit `coding-tutorials.html` for the interactive programming tutorial navigator.
   - Ada tutorials are in `tutorials/ada/`.
   - Assembly language tutorials are in `tutorials/asm/`.
   - C language tutorials are in `tutorials/c/`.
   - Etc.

## Development

- All tools are written in vanilla JavaScript and HTML, with Bootstrap for layout and styling.
- Tutorials are modular HTML files, easily extensible for new languages or topics.
- Configuration and data are stored in JSON or plain text for easy editing.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
