// Vite's magic import feature: this statically prepares all JSON files during build time.
// They are split into dynamic chunks and lazy-loaded only when requested!
const snippetLoaders = import.meta.glob('../data/snippets/*.json');

// Dictionaries to categorize and label the files
const CATEGORY_MAP: Record<string, string[]> = {
    functional: ["clojure", "commonlisp", "elixir", "elm", "erlang", "fsharp", "haskell", "ocaml", "scheme"],
    imperative: ["ada", "c", "cobol", "cpp", "d", "fortran", "oberon", "pascal", "rexx"],
    oop: ["ceylon", "csharp", "crystal", "dart", "groovy", "java", "janet", "kotlin", "objectivec", "php", "python", "raku", "ruby", "scala", "swift", "vbnet"],
    other: ["apl", "asm", "forth", "go", "graphql", "hcl", "mercury", "matlab", "prolog", "rust", "sql", "zig"],
    scripting: ["bash", "coffeescript", "javascript", "julia", "lua", "nim", "perl", "powershell", "r", "tcl", "typescript", "vba", "vbscript"]
};

const LANG_NAMES: Record<string, string> = {
    ada: 'Ada', apl: 'APL', asm: 'Assembly', bash: 'Bash', c: 'C', ceylon: 'Ceylon', clojure: 'Clojure', cobol: 'COBOL', coffeescript: 'CoffeeScript', commonlisp: 'Common Lisp', cpp: 'C++', crystal: 'Crystal', csharp: 'C#', d: 'D', dart: 'Dart', elixir: 'Elixir', elm: 'Elm', erlang: 'Erlang', forth: 'Forth', fortran: 'Fortran', fsharp: 'F#', go: 'Go', graphql: 'GraphQL', groovy: 'Groovy', haskell: 'Haskell', hcl: 'HCL', janet: 'Janet', java: 'Java', javascript: 'JavaScript', julia: 'Julia', kotlin: 'Kotlin', lua: 'Lua', matlab: 'MATLAB', mercury: 'Mercury', nim: 'Nim', oberon: 'Oberon', objectivec: 'Objective-C', ocaml: 'OCaml', pascal: 'Pascal', perl: 'Perl', php: 'PHP', powershell: 'PowerShell', prolog: 'Prolog', python: 'Python', r: 'R', raku: 'Raku', rexx: 'Rexx', ruby: 'Ruby', rust: 'Rust', scala: 'Scala', scheme: 'Scheme', sql: 'SQL', swift: 'Swift', tcl: 'Tcl', typescript: 'TypeScript', vba: 'VBA', vbnet: 'VB.NET', vbscript: 'VBScript', zig: 'Zig'
};

// Determine which files actually exist in the snippets folder
const availableLangs = Object.keys(snippetLoaders).map(path => {
    const parts = path.split('/');
    return parts[parts.length - 1].replace('.json', '');
});

let activeSnippetData: any = null;
let currentRawContent = '';

const mainCategorySelect = document.getElementById('mainCategory') as HTMLSelectElement;
const languageSelect = document.getElementById('language') as HTMLSelectElement;
const snippetTypeSelect = document.getElementById('snippetType') as HTMLSelectElement;
const mainOutput = document.getElementById('mainOutput') as HTMLDivElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLSpanElement;

function showStatus(message: string, isError = false) {
    status.textContent = message;
    status.style.color = isError ? 'var(--danger)' : 'var(--success)';
    setTimeout(() => {
        status.textContent = 'Ready';
        status.style.color = 'var(--text-muted)';
    }, 3000);
}

function populateCategories() {
    mainCategorySelect.innerHTML = '<option value="">-- Select Category --</option>';
    
    // Only show categories that have at least one available snippet file
    const activeCategories = Object.keys(CATEGORY_MAP).filter(cat => {
        return CATEGORY_MAP[cat].some(lang => availableLangs.includes(lang));
    }).sort();

    activeCategories.forEach(catKey => {
        let displayName = catKey.charAt(0).toUpperCase() + catKey.slice(1);
        if (catKey === 'oop') displayName = 'OOP';
        mainCategorySelect.add(new Option(displayName, catKey));
    });
}

function populateLanguages(category: string) {
    languageSelect.innerHTML = '<option value="">-- Select Language --</option>';
    languageSelect.disabled = true;
    resetAndClear();

    if (!category || !CATEGORY_MAP[category]) return;
    
    // Only show languages in this category that actually exist in our folder
    const options = CATEGORY_MAP[category]
        .filter(langKey => availableLangs.includes(langKey))
        .map(langKey => ({
            text: LANG_NAMES[langKey] || langKey,
            value: langKey
        }))
        .sort((a, b) => a.text.localeCompare(b.text));
    
    options.forEach(opt => languageSelect.add(new Option(opt.text, opt.value)));
    
    if (options.length > 0) {
        languageSelect.disabled = false;
    } else {
        showStatus('No snippets found for this category yet.', true);
    }
}

function resetAndClear() {
    snippetTypeSelect.innerHTML = '<option value="">-- Select Snippet --</option>';
    snippetTypeSelect.disabled = true;
    mainOutput.innerHTML = '<span style="color: var(--text-muted); white-space: normal;">Select a snippet...</span>';
    copyBtn.disabled = true;
    currentRawContent = '';
    activeSnippetData = null;
}

async function loadSnippetsForLanguage(langKey: string) {
    resetAndClear();
    if (!langKey) return;
    
    const loaderPath = `../data/snippets/${langKey}.json`;
    const loader = snippetLoaders[loaderPath];
    
    if (!loader) {
        showStatus(`Error: File ${langKey}.json not found.`, true);
        return;
    }

    try {
        status.textContent = 'Loading...';
        // Dynamically fetch the JSON chunk generated by Vite
        const module: any = await loader();
        activeSnippetData = module.default;
        
        // Populate the Snippet dropdown
        const sortedSnippets = Object.keys(activeSnippetData).map(key => ({
            key: key,
            displayName: activeSnippetData[key].displayName || key
        })).sort((a, b) => a.displayName.localeCompare(b.displayName));

        sortedSnippets.forEach(snippet => snippetTypeSelect.add(new Option(snippet.displayName, snippet.key)));
        snippetTypeSelect.disabled = false;
        showStatus(`Loaded ${sortedSnippets.length} snippets for ${LANG_NAMES[langKey] || langKey}.`);

    } catch (error: any) {
        console.error("Failed to load snippets:", error);
        showStatus('Error loading snippet data.', true);
    }
}

function updateSnippetView() {
    const type = snippetTypeSelect.value;

    if (!type || !activeSnippetData || !activeSnippetData[type]) {
        mainOutput.innerHTML = '<span style="color: var(--text-muted); white-space: normal;">Select a snippet...</span>';
        copyBtn.disabled = true;
        currentRawContent = '';
        return;
    }

    const snippetData = activeSnippetData[type];
    const snippetContent = snippetData.template?.trim() || snippetData; // fallback if string
    
    if (snippetContent) {
        mainOutput.innerText = snippetContent;
        currentRawContent = snippetContent;
        copyBtn.disabled = false;
    }
}

// Event Listeners
mainCategorySelect.addEventListener('change', (e) => populateLanguages((e.target as HTMLSelectElement).value));
languageSelect.addEventListener('change', (e) => loadSnippetsForLanguage((e.target as HTMLSelectElement).value));
snippetTypeSelect.addEventListener('change', updateSnippetView);

copyBtn.addEventListener('click', async () => {
    if (!currentRawContent) return;
    try {
        await navigator.clipboard.writeText(currentRawContent);
        showStatus('Copied to clipboard!');
    } catch (err) {
        showStatus('Failed to copy.', true);
    }
});

clearBtn.addEventListener('click', () => {
    mainCategorySelect.value = '';
    languageSelect.innerHTML = '<option value="">-- Select Language --</option>';
    languageSelect.disabled = true;
    resetAndClear();
    showStatus('Cleared selection.');
});

// Initialize UI
populateCategories();
