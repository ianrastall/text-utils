<?php
/**
 * code-snippets.php
 * A tool to browse and copy common code snippets and tutorials for various programming languages.
 */

require_once __DIR__ . '/templates/header.php';

// NEW: Added a style block to override the default code color for this page.
echo <<<HTML
<style>
    /* Target code blocks inside our specific output area */
    #mainOutput pre,
    #mainOutput code {
        color: var(--accent-color, #DEB887) !important; /* Use a theme variable with fallback */
        background-color: transparent !important;
    }
</style>
HTML;

$toolName = 'Code Snippets & Tutorials';
$toolIcon = 'data_object';
$toolDescription = 'Pick from reusable code snippets or read short tutorials for common programming tasks.';
?>

<div class="container-fluid my-4">
    <div class="row gx-3 gy-3">
        <main class="col-md-9">
            <div class="card bg-dark border-secondary shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex align-items-center mb-3">
                        <span class="material-icons me-3" aria-hidden="true" style="font-size: 36px;"><?= htmlspecialchars($toolIcon) ?></span>
                        <h2 class="m-0"><?= htmlspecialchars($toolName) ?></h2>
                    </div>
                    <p class="text-white-50 mb-4"><?= htmlspecialchars($toolDescription) ?></p>

                    <form id="snippetForm" onsubmit="return false;" class="d-flex flex-column flex-grow-1">
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="mainCategory" class="form-label">Category</label>
                                <select id="mainCategory" class="form-select"></select>
                            </div>
                            <div class="col-md-6">
                                <label for="language" class="form-label">Language / Syntax</label>
                                <select id="language" class="form-select" disabled></select>
                            </div>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="snippetType" class="form-label">Snippet Type</label>
                                <select id="snippetType" class="form-select" disabled></select>
                            </div>
                            <div class="col-md-6">
                                <label for="tutorialSelect" class="form-label">Tutorial Topic</label>
                                <select id="tutorialSelect" class="form-select" disabled></select>
                            </div>
                        </div>

                        <div class="mb-3 flex-grow-1 d-flex flex-column">
                            <label for="mainOutput" class="form-label">Output:</label>
                            <div id="mainOutput" class="form-control flex-grow-1" style="min-height: 300px; background-color: #212529; color: #dee2e6; border: 1px solid #495057; font-family: var(--bs-font-monospace); white-space: pre-wrap;">
                                <span class="text-white-50" style="white-space: normal;">Select a snippet or tutorial...</span>
                            </div>
                        </div>

                        <div class="d-flex gap-2 flex-wrap">
                            <button type="button" id="copyBtn" class="btn btn-primary" disabled>
                                <span class="material-icons me-1">content_copy</span>Copy
                            </button>
                            <button type="button" id="clearBtn" class="btn btn-danger">
                                <span class="material-icons me-1">delete_sweep</span>Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        <aside class="col-md-3">
            <?php require_once __DIR__ . '/templates/sidebar.php'; ?>
        </aside>
    </div>
</div>

<div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {

    const categories = {
        functional: ["clojure", "commonlisp", "elixir", "elm", "erlang", "fsharp", "haskell", "ocaml", "scheme"],
        imperative: ["ada", "c", "cobol", "cpp", "d", "fortran", "oberon", "pascal", "rexx"],
        oop: ["ceylon", "csharp", "crystal", "dart", "groovy", "java", "janet", "kotlin", "objectivec", "php", "python", "raku", "ruby", "scala", "swift", "vbnet"],
        other: ["apl", "asm", "forth", "go", "graphql", "hcl", "mercury", "matlab", "prolog", "rust", "sql", "zig"],
        scripting: ["bash", "coffeescript", "javascript", "julia", "lua", "nim", "perl", "powershell", "r", "tcl", "typescript", "vba", "vbscript"]
    };

    const languageNames = {
        ada: 'Ada', apl: 'APL', asm: 'Assembly', bash: 'Bash', c: 'C', ceylon: 'Ceylon', clojure: 'Clojure', cobol: 'COBOL', coffeescript: 'CoffeeScript', commonlisp: 'Common Lisp', cpp: 'C++', crystal: 'Crystal', csharp: 'C#', d: 'D', dart: 'Dart', elixir: 'Elixir', elm: 'Elm', erlang: 'Erlang', forth: 'Forth', fortran: 'Fortran', fsharp: 'F#', go: 'Go', graphql: 'GraphQL', groovy: 'Groovy', haskell: 'Haskell', hcl: 'HCL', janet: 'Janet', java: 'Java', javascript: 'JavaScript', julia: 'Julia', kotlin: 'Kotlin', lua: 'Lua', matlab: 'MATLAB', mercury: 'Mercury', nim: 'Nim', oberon: 'Oberon', objectivec: 'Objective-C', ocaml: 'OCaml', pascal: 'Pascal', perl: 'Perl', php: 'PHP', powershell: 'PowerShell', prolog: 'Prolog', python: 'Python', r: 'R', raku: 'Raku', rexx: 'Rexx', ruby: 'Ruby', rust: 'Rust', scala: 'Scala', scheme: 'Scheme', sql: 'SQL', swift: 'Swift', tcl: 'Tcl', typescript: 'TypeScript', vba: 'VBA', vbnet: 'VB.NET', vbscript: 'VBScript', zig: 'Zig'
    };

    let loadedSnippets = {};
    let loadedTutorials = {};
    let currentRawContent = '';

    const mainCategorySelect = document.getElementById('mainCategory');
    const languageSelect = document.getElementById('language');
    const snippetTypeSelect = document.getElementById('snippetType');
    const tutorialSelect = document.getElementById('tutorialSelect');
    const mainOutput = document.getElementById('mainOutput');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    function showToast(message, variant = 'info') {
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${variant} border-0`;
        toast.id = toastId;
        toast.role = 'alert';
        toast.ariaLive = 'assertive';
        toast.ariaAtomic = 'true';
        toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
        document.getElementById('toastContainer').appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    function populateCategories() {
        mainCategorySelect.innerHTML = '<option value="">-- Select --</option>';
        Object.keys(categories).sort().forEach(catKey => {
            let displayName = catKey.charAt(0).toUpperCase() + catKey.slice(1);
            if (catKey === 'oop') displayName = 'OOP';
            mainCategorySelect.add(new Option(displayName, catKey));
        });
    }

    function resetAndClear() {
        snippetTypeSelect.innerHTML = '<option value="">-- Select --</option>';
        snippetTypeSelect.disabled = true;
        tutorialSelect.innerHTML = '<option value="">-- Select --</option>';
        tutorialSelect.disabled = true;
        mainOutput.innerHTML = '<span class="text-white-50" style="white-space: normal;">Select a snippet or tutorial...</span>';
        copyBtn.disabled = true;
        currentRawContent = '';
    }

    async function populateLanguages(category) {
        languageSelect.innerHTML = '<option value="">-- Select --</option>';
        languageSelect.disabled = true;
        resetAndClear();

        if (!category || !categories[category]) return;
        
        const options = [];
        for (const langKey of categories[category]) {
            if (langKey === 'asm') {
                const isLoaded = await ensureSnippetsAreLoaded(langKey);
                if (isLoaded && loadedSnippets.asm) {
                    Object.keys(loadedSnippets.asm).forEach(archKey => {
                        Object.keys(loadedSnippets.asm[archKey].syntaxes).forEach(syntaxKey => {
                            const arch = loadedSnippets.asm[archKey];
                            const syntax = arch.syntaxes[syntaxKey];
                            options.push({ text: `${arch.displayName} (${syntax.displayName})`, value: `asm:${archKey}:${syntaxKey}` });
                        });
                    });
                }
            } else {
                options.push({ text: languageNames[langKey] || langKey, value: langKey });
            }
        }
        
        options.sort((a, b) => a.text.localeCompare(b.text));
        options.forEach(opt => languageSelect.add(new Option(opt.text, opt.value)));
        languageSelect.disabled = false;
    }

    async function ensureSnippetsAreLoaded(langKey) {
        const baseLangKey = langKey.split(':')[0];
        if (loadedSnippets[baseLangKey]) return true;
        try {
            const response = await fetch(`api/snippets.php?lang=${baseLangKey}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Data for '${languageNames[baseLangKey]}' not found.`);
            }
            loadedSnippets[baseLangKey] = await response.json();
            return true;
        } catch (error) {
            console.error("Failed to load snippets:", error);
            showToast(error.message, 'danger');
            return false;
        }
    }

    async function ensureTutorialsAreLoaded(langKey) {
        const baseLangKey = langKey.split(':')[0];
        if (loadedTutorials[baseLangKey]) return true;
        try {
            const response = await fetch(`api/snippets.php?tut=${baseLangKey}`);
            if (!response.ok) {
                console.log(`Tutorial data for '${languageNames[baseLangKey]}' not found. This may be expected.`);
                loadedTutorials[baseLangKey] = null;
                return false;
            }
            loadedTutorials[baseLangKey] = await response.json();
            return true;
        } catch (error) {
            console.error("Failed to load tutorials:", error);
            loadedTutorials[baseLangKey] = null;
            return false;
        }
    }
    
    async function populateSnippetTypes(selectedValue) {
        const isLoaded = await ensureSnippetsAreLoaded(selectedValue);
        if (!isLoaded) return;

        let langKey, archKey, syntaxKey, snippetsData;
        if (selectedValue.includes(':')) {
            [langKey, archKey, syntaxKey] = selectedValue.split(':');
            snippetsData = loadedSnippets[langKey]?.[archKey]?.syntaxes?.[syntaxKey]?.snippets;
        } else {
            langKey = selectedValue;
            snippetsData = loadedSnippets[langKey];
        }

        if (snippetsData) {
            const sortedSnippets = Object.keys(snippetsData).map(key => ({
                key: key,
                displayName: snippetsData[key].displayName || key
            })).sort((a, b) => a.displayName.localeCompare(b.displayName));

            sortedSnippets.forEach(snippet => snippetTypeSelect.add(new Option(snippet.displayName, snippet.key)));
            snippetTypeSelect.disabled = false;
        }
    }
    
    async function populateTutorials(langKey) {
        const isLoaded = await ensureTutorialsAreLoaded(langKey);
        if (!isLoaded || !loadedTutorials[langKey]) return;

        const tutorialData = loadedTutorials[langKey];
        if (tutorialData) {
            // MODIFIED: Sort by the 'order' property in the JSON, not alphabetically.
            const sortedTopics = Object.keys(tutorialData).map(key => ({
                key: key,
                displayName: tutorialData[key].displayName || key,
                order: tutorialData[key].order || 999 // Use 999 for items without an order
            })).sort((a, b) => a.order - b.order);

            sortedTopics.forEach(topic => tutorialSelect.add(new Option(topic.displayName, topic.key)));
            tutorialSelect.disabled = false;
        }
    }

    function updateSnippet() {
        if (snippetTypeSelect.value) {
            tutorialSelect.value = '';
        }

        const langValue = languageSelect.value;
        const type = snippetTypeSelect.value;

        // If the user selects the default "-- Select --" option, just clear the output.
        if (!type) {
            mainOutput.innerHTML = '<span class="text-white-50" style="white-space: normal;">Select a snippet or tutorial...</span>';
            copyBtn.disabled = true;
            currentRawContent = '';
            return;
        }

        let snippetData;
        if (langValue.includes(':')) {
            const [langKey, archKey, syntaxKey] = langValue.split(':');
            snippetData = loadedSnippets[langKey]?.[archKey]?.syntaxes?.[syntaxKey]?.snippets?.[type];
        } else {
            snippetData = loadedSnippets[langValue]?.[type];
        }

        const snippetContent = snippetData?.template?.trim();
        if (snippetContent) {
            mainOutput.innerText = snippetContent;
            currentRawContent = snippetContent;
            copyBtn.disabled = false;
        }
    }

    function updateTutorial() {
        if (tutorialSelect.value) {
            snippetTypeSelect.value = '';
        }

        const langKey = languageSelect.value.split(':')[0];
        const topicKey = tutorialSelect.value;

        // If the user selects the default "-- Select --" option, just clear the output.
        if (!topicKey) {
            mainOutput.innerHTML = '<span class="text-white-50" style="white-space: normal;">Select a snippet or tutorial...</span>';
            copyBtn.disabled = true;
            currentRawContent = '';
            return;
        }

        const tutorial = loadedTutorials[langKey]?.[topicKey];
        const tutorialContent = tutorial?.content?.trim();

        if (tutorialContent) {
            mainOutput.innerHTML = marked.parse(tutorialContent);
            currentRawContent = tutorialContent;
            copyBtn.disabled = false;
        }
    }
    
    async function handleLanguageChange(selectedValue) {
        resetAndClear();
        if (!selectedValue) return;
        const langKey = selectedValue.split(':')[0];
        await Promise.all([
            populateSnippetTypes(selectedValue),
            populateTutorials(langKey)
        ]);
    }
    
    mainCategorySelect.addEventListener('change', (e) => populateLanguages(e.target.value));
    languageSelect.addEventListener('change', (e) => handleLanguageChange(e.target.value));
    snippetTypeSelect.addEventListener('change', updateSnippet);
    tutorialSelect.addEventListener('change', updateTutorial);

    copyBtn.addEventListener('click', () => {
        if (!currentRawContent) return;
        navigator.clipboard.writeText(currentRawContent).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            showToast('Failed to copy.', 'danger');
        });
    });

    clearBtn.addEventListener('click', () => {
        mainCategorySelect.value = '';
        languageSelect.innerHTML = '<option value="">-- Select --</option>';
        languageSelect.disabled = true;
        resetAndClear();
    });

    function initialize() {
        populateCategories();
    }

    initialize();
});
</script>

<?php
require_once __DIR__ . '/templates/footer.php';
?>