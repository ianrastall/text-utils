'use strict';

// DOM elements
const processBtn = document.getElementById('processBtn');
const processLabel = document.getElementById('processLabel');
const copyBtn = document.getElementById('copyOutput');
const clearBtn = document.getElementById('clearBtn');
const exampleBtn = document.getElementById('exampleBtn');
const backBtn = document.getElementById('backButton');
const modeTabs = document.querySelectorAll('.mode-tab');
const indentSelect = document.getElementById('indentSelect');
const sortKeysCheck = document.getElementById('sortKeysCheck');
const errorPanel = document.getElementById('errorPanel');
const errorTitleText = document.getElementById('errorTitleText');
const errorMessage = document.getElementById('errorMessage');
const statsPanel = document.getElementById('statsPanel');
const optionsPanel = document.getElementById('optionsPanel');
const queryPanel = document.getElementById('queryPanel');
const schemaPanel = document.getElementById('schemaPanel');
const jmespathQuery = document.getElementById('jmespathQuery');
const infoTitle = document.getElementById('infoTitle');
const infoText = document.getElementById('infoText');
const inputLabelText = document.getElementById('inputLabelText');
const outputLabel = document.getElementById('outputLabel');
const statusMessage = document.getElementById('statusMessage');
const processingTime = document.getElementById('processingTime');
const inputStats = document.getElementById('inputStats');
const outputStats = document.getElementById('outputStats');
const statObjects = document.getElementById('statObjects');
const statArrays = document.getElementById('statArrays');
const statKeys = document.getElementById('statKeys');
const statDepth = document.getElementById('statDepth');
const fileDropZone = document.getElementById('fileDropZone');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const fileInput = document.getElementById('fileInput');
const fileMeta = document.getElementById('fileMeta');
const inputEditorHost = document.getElementById('inputEditor');
const outputEditorHost = document.getElementById('outputEditor');
const schemaEditorHost = document.getElementById('schemaEditor');

// State
let currentMode = 'format';
let inputEditor = null;
let outputEditor = null;
let schemaEditor = null;
let jsonWorker = null;
let workerJobCounter = 0;
let isProcessing = false;
let inputStatsRaf = 0;
let statsDebounceTimer = 0;
let latestStatsTicket = 0;
let activeFileLoadId = 0;
let themeObserver = null;
const pendingWorkerJobs = new Map();

const LARGE_FILE_THRESHOLD_BYTES = 5 * 1024 * 1024;
const STREAM_READ_YIELD_INTERVAL = 8;
const ANALYZE_DEBOUNCE_MS = 300;
const DEFAULT_FILE_META = 'Supports `.json`, `.jsonl`, `.ndjson`, and plain text files.';
const WORKER_PATH = 'js/json-worker.js';
const ACE_BASE_PATH = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.3/';

const exampleJSON = {
    users: [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, active: true },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, active: false },
        { id: 3, name: 'Carol White', email: 'carol@example.com', age: 31, active: true }
    ],
    metadata: {
        total: 3,
        page: 1,
        timestamp: '2024-01-15T10:30:00Z'
    }
};

const exampleJSONL = [
    '{"id":1,"name":"Alice Johnson","active":true}',
    '{"id":2,"name":"Bob Smith","active":false}',
    '{"id":3,"name":"Carol White","active":true}'
].join('\n');

const exampleSchema = {
    type: 'object',
    required: ['users', 'metadata'],
    properties: {
        users: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name', 'email', 'active'],
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    age: { type: 'integer' },
                    active: { type: 'boolean' }
                }
            }
        },
        metadata: {
            type: 'object',
            required: ['total'],
            properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                timestamp: { type: 'string' }
            }
        }
    }
};

const modeInfo = {
    format: {
        title: 'JSON Formatting',
        text: 'Format JSON with optional key sorting and optional JMESPath pre-filtering. Syntax parsing and structural analysis run in a background worker.',
        inputLabel: 'Input JSON',
        outputLabel: 'Formatted Output',
        outputAceMode: 'ace/mode/json',
        showOptions: true,
        showQuery: true,
        showSchema: false,
        actionLabel: 'Format',
        actionIcon: 'play_arrow'
    },
    jsonl: {
        title: 'JSON to JSONL Conversion',
        text: 'Convert JSON (typically arrays) to JSON Lines. Use a JMESPath query to pre-filter or extract a subset before conversion.',
        inputLabel: 'Input JSON',
        outputLabel: 'JSONL Output',
        outputAceMode: 'ace/mode/json',
        showOptions: false,
        showQuery: true,
        showSchema: false,
        actionLabel: 'Convert',
        actionIcon: 'play_arrow'
    },
    jsonlToJson: {
        title: 'JSONL to JSON Conversion',
        text: 'Parse JSON Lines (one JSON value per line), skip empty lines, and re-stringify as a valid JSON array. Large inputs are processed in a background worker.',
        inputLabel: 'Input JSONL',
        outputLabel: 'JSON Output',
        outputAceMode: 'ace/mode/json',
        showOptions: true,
        showQuery: false,
        showSchema: false,
        actionLabel: 'Convert',
        actionIcon: 'play_arrow'
    },
    validate: {
        title: 'JSON Validation',
        text: 'Validate JSON syntax with JSONLint for precise line/character errors. Optionally validate against a JSON Schema using Ajv.',
        inputLabel: 'Input JSON',
        outputLabel: 'Validation Result',
        outputAceMode: 'ace/mode/text',
        showOptions: false,
        showQuery: false,
        showSchema: true,
        actionLabel: 'Validate',
        actionIcon: 'check_circle'
    }
};

function initAceEditors() {
    if (!window.ace) {
        throw new Error('Ace Editor failed to load from CDN.');
    }

    ace.config.set('basePath', ACE_BASE_PATH);
    ace.config.set('modePath', ACE_BASE_PATH);
    ace.config.set('themePath', ACE_BASE_PATH);

    inputEditor = ace.edit(inputEditorHost);
    outputEditor = ace.edit(outputEditorHost);
    schemaEditor = ace.edit(schemaEditorHost);

    configureEditor(inputEditor, { readOnly: false, mode: 'ace/mode/json' });
    configureEditor(outputEditor, { readOnly: true, mode: 'ace/mode/json' });
    outputEditor.setOptions({
        highlightActiveLine: false,
        highlightGutterLine: false
    });
    configureEditor(schemaEditor, { readOnly: false, mode: 'ace/mode/json' });

    inputEditor.commands.addCommand({
        name: 'process-json-tool',
        bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
        exec: () => processJSON()
    });
}

function configureEditor(editor, options) {
    editor.setOptions({
        readOnly: Boolean(options.readOnly),
        showPrintMargin: false,
        useWorker: false,
        wrap: true,
        fontSize: '14px',
        tabSize: 2,
        useSoftTabs: true,
        displayIndentGuides: true,
        behavioursEnabled: true
    });
    editor.session.setMode(options.mode || 'ace/mode/json');
    editor.session.setUseWorker(false);
    editor.session.setUseWrapMode(true);
    editor.session.setTabSize(2);
    editor.session.setUseSoftTabs(true);
    editor.renderer.setShowPrintMargin(false);
    editor.renderer.setScrollMargin(8, 8, 8, 8);
}
function applyEditorTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const aceTheme = isLight ? 'ace/theme/github' : 'ace/theme/monokai';
    [inputEditor, outputEditor, schemaEditor].forEach(editor => {
        if (editor) {
            editor.setTheme(aceTheme);
        }
    });
}

function setupThemeSync() {
    applyEditorTheme();

    if (themeObserver) {
        themeObserver.disconnect();
    }

    themeObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                applyEditorTheme();
                break;
            }
        }
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

function ensureWorker() {
    if (jsonWorker) {
        return jsonWorker;
    }

    if (!window.Worker) {
        throw new Error('Web Workers are not supported in this browser.');
    }

    jsonWorker = new Worker(WORKER_PATH);

    jsonWorker.addEventListener('message', event => {
        const data = event.data || {};
        const pending = pendingWorkerJobs.get(data.jobId);
        if (!pending) {
            return;
        }

        pendingWorkerJobs.delete(data.jobId);
        if (data.ok) {
            pending.resolve(data);
        } else {
            pending.reject(data);
        }
    });

    jsonWorker.addEventListener('error', event => {
        console.error('JSON worker error:', event);
        const fatalPayload = {
            error: {
                errorType: 'processing',
                title: 'Worker Error',
                message: event.message || 'The background JSON worker failed.'
            }
        };

        for (const pending of pendingWorkerJobs.values()) {
            pending.reject(fatalPayload);
        }
        pendingWorkerJobs.clear();

        try {
            jsonWorker.terminate();
        } catch (_) {
            // Ignore terminate failures.
        }
        jsonWorker = null;
    });

    return jsonWorker;
}

function runWorkerJob(action, payload) {
    const worker = ensureWorker();
    return new Promise((resolve, reject) => {
        const jobId = ++workerJobCounter;
        pendingWorkerJobs.set(jobId, { resolve, reject });
        worker.postMessage({ jobId, action, payload });
    });
}

function setActiveTab(activeTab) {
    modeTabs.forEach(tab => {
        const isActive = tab === activeTab;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });
}

function setOutputEditorMode(modePath) {
    if (!outputEditor) {
        return;
    }
    outputEditor.session.setMode(modePath || 'ace/mode/text');
    outputEditor.session.setUseWorker(false);
}

function updateModeUI() {
    const info = modeInfo[currentMode];
    if (!info) {
        throw new Error(`Unknown mode: ${currentMode}`);
    }

    infoTitle.textContent = info.title;
    infoText.textContent = info.text;
    inputLabelText.textContent = info.inputLabel;
    outputLabel.textContent = info.outputLabel;

    optionsPanel.style.display = info.showOptions ? 'block' : 'none';
    queryPanel.classList.toggle('show', info.showQuery);
    schemaPanel.classList.toggle('show', info.showSchema);

    const processIcon = processBtn.querySelector('.material-icons');
    if (processIcon) {
        processIcon.textContent = info.actionIcon;
    }
    processLabel.textContent = info.actionLabel;
    setOutputEditorMode(info.outputAceMode);

    hideError();
    hideStats();
    scheduleAsyncInputAnalysis();

    requestAnimationFrame(() => {
        inputEditor.resize(true);
        outputEditor.resize(true);
        if (info.showSchema) {
            schemaEditor.resize(true);
        }
    });
}

function displayStats(stats) {
    if (!stats) {
        hideStats();
        return;
    }

    statObjects.textContent = Number.isFinite(stats.objects) ? stats.objects : 0;
    statArrays.textContent = Number.isFinite(stats.arrays) ? stats.arrays : 0;
    statKeys.textContent = Number.isFinite(stats.keys) ? stats.keys : 0;
    statDepth.textContent = Number.isFinite(stats.maxDepth) ? stats.maxDepth : 0;
    statsPanel.style.display = 'grid';
}

function hideStats() {
    statsPanel.style.display = 'none';
}

function hideError() {
    errorPanel.classList.remove('show');
    errorPanel.setAttribute('aria-hidden', 'true');
    errorTitleText.textContent = 'Syntax Error';
    errorMessage.textContent = '';
}

function getErrorTitle(error) {
    switch (error && error.errorType) {
        case 'schema':
            return 'Schema Validation Failed';
        case 'schemaSyntax':
            return 'Schema Syntax Error';
        case 'query':
            return 'JMESPath Query Error';
        case 'processing':
            return 'Processing Error';
        default:
            return 'Syntax Error';
    }
}

function showErrorPanel(error) {
    const normalized = error && typeof error === 'object'
        ? error
        : { message: String(error) };

    errorTitleText.textContent = normalized.title || getErrorTitle(normalized);

    const lines = [];
    const message = normalized.message ? String(normalized.message) : 'An unknown error occurred.';
    lines.push(message);

    if (normalized.line || normalized.column) {
        const parts = [];
        if (normalized.line) {
            parts.push(`Line ${normalized.line}`);
        }
        if (normalized.column) {
            parts.push(`Character ${normalized.column}`);
        }
        const hasLineInMessage = /line\s+\d+/i.test(message);
        const hasColumnInMessage = /(?:column|character)\s+\d+/i.test(message);
        const shouldAppendLocation = parts.length > 0
            && (!hasLineInMessage || (normalized.column && !hasColumnInMessage));
        if (shouldAppendLocation) {
            lines.push(`Location: ${parts.join(', ')}`);
        }
    }

    if (normalized.source === 'schema') {
        lines.push('Source: Schema input');
    }

    errorMessage.textContent = lines.join('\n\n');
    errorPanel.classList.add('show');
    errorPanel.setAttribute('aria-hidden', 'false');
}

function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = type;
}
function formatCounts(chars, lines) {
    return `${chars} chars, ${lines} lines`;
}

function updateInputStatsLabel(rawInput) {
    const text = typeof rawInput === 'string' ? rawInput : inputEditor.getValue();
    const lines = text.length === 0 ? 0 : inputEditor.session.getLength();
    inputStats.textContent = formatCounts(text.length, lines);
}

function updateOutputStatsLabel(rawOutput) {
    const text = typeof rawOutput === 'string' ? rawOutput : outputEditor.getValue();
    const lines = text.length === 0 ? 0 : outputEditor.session.getLength();
    outputStats.textContent = formatCounts(text.length, lines);
}

function queueInputStatsLabelUpdate() {
    if (inputStatsRaf) {
        return;
    }

    inputStatsRaf = requestAnimationFrame(() => {
        inputStatsRaf = 0;
        updateInputStatsLabel();
    });
}

function setInputEditorValue(text) {
    inputEditor.setValue(text || '', -1);
    inputEditor.clearSelection();
    queueInputStatsLabelUpdate();
    scheduleAsyncInputAnalysis();
}

function setOutputEditorValue(text, modePath) {
    if (modePath) {
        setOutputEditorMode(modePath);
    }
    outputEditor.setValue(text || '', -1);
    outputEditor.clearSelection();
    updateOutputStatsLabel(text || '');
}

function setProcessingState(busy) {
    isProcessing = Boolean(busy);
    processBtn.disabled = isProcessing;
    chooseFileBtn.disabled = isProcessing;

    modeTabs.forEach(tab => {
        tab.disabled = isProcessing;
    });

    fileDropZone.setAttribute('aria-disabled', isProcessing ? 'true' : 'false');
}

function buildWorkerPayload(rawInput) {
    return {
        rawInput,
        mode: currentMode,
        options: {
            indent: indentSelect.value,
            sortKeys: Boolean(sortKeysCheck.checked),
            query: jmespathQuery.value || '',
            schemaText: schemaEditor.getValue()
        }
    };
}

function safeFirstLine(text) {
    return String(text || '').split(/\r?\n/, 1)[0] || 'Processing failed';
}

async function processJSON() {
    const rawInput = inputEditor.getValue();

    if (!rawInput.trim()) {
        hideError();
        setOutputEditorValue('', modeInfo[currentMode].outputAceMode);
        hideStats();
        showStatus('Please enter some JSON/JSONL to process.', 'warning');
        processingTime.textContent = 'No operations yet';
        return;
    }

    hideError();
    setProcessingState(true);
    const startedAt = performance.now();

    try {
        const response = await runWorkerJob('process', buildWorkerPayload(rawInput));

        if (response.stats) {
            displayStats(response.stats);
        } else {
            hideStats();
        }

        setOutputEditorValue(
            response.resultText || '',
            response.outputMode || modeInfo[currentMode].outputAceMode
        );

        showStatus(response.message || 'Success!', 'success');

        const totalMs = Math.round(performance.now() - startedAt);
        const workerMs = Number.isFinite(response.durationMs)
            ? ` (worker ${Math.round(response.durationMs)}ms)`
            : '';
        processingTime.textContent = `Processed in ${totalMs}ms${workerMs}`;
    } catch (failure) {
        console.error('Processing error:', failure);

        const payload = failure && typeof failure === 'object' ? failure : {};
        const error = payload.error || { message: String(failure), errorType: 'processing' };

        if (payload.stats) {
            displayStats(payload.stats);
        } else {
            hideStats();
        }

        if (typeof payload.validationReport === 'string') {
            setOutputEditorValue(payload.validationReport, 'ace/mode/text');
        } else {
            setOutputEditorValue('', modeInfo[currentMode].outputAceMode);
        }

        showErrorPanel(error);
        showStatus(`Error: ${safeFirstLine(error.message)}`, 'error');
        processingTime.textContent = `Processing failed after ${Math.round(performance.now() - startedAt)}ms`;
    } finally {
        setProcessingState(false);
    }
}

function buildExampleInputForMode(mode) {
    return mode === 'jsonlToJson'
        ? exampleJSONL
        : JSON.stringify(exampleJSON, null, 2);
}

function loadExample() {
    hideError();
    setInputEditorValue(buildExampleInputForMode(currentMode));
    setOutputEditorValue('', modeInfo[currentMode].outputAceMode);
    hideStats();

    if (currentMode === 'validate' && !schemaEditor.getValue().trim()) {
        schemaEditor.setValue(JSON.stringify(exampleSchema, null, 2), -1);
        schemaEditor.clearSelection();
    }

    fileMeta.textContent = DEFAULT_FILE_META;
    showStatus('Example loaded', 'success');
    processingTime.textContent = 'Ready to process example';
}

function clearAll() {
    activeFileLoadId += 1;
    latestStatsTicket += 1;
    clearTimeout(statsDebounceTimer);

    hideError();
    hideStats();
    jmespathQuery.value = '';
    schemaEditor.setValue('', -1);
    schemaEditor.clearSelection();
    setInputEditorValue('');
    setOutputEditorValue('', modeInfo[currentMode].outputAceMode);
    fileMeta.textContent = DEFAULT_FILE_META;
    showStatus('Cleared', 'success');
    processingTime.textContent = 'No operations yet';
}

async function copyToClipboard() {
    const text = outputEditor.getValue();
    if (!text) {
        showStatus('Nothing to copy', 'warning');
        return;
    }

    try {
        if (typeof window.textUtilsClipboardWrite === 'function') {
            await window.textUtilsClipboardWrite(text);
        } else if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(text);
        } else {
            throw new Error('Clipboard API unavailable');
        }
        showStatus('Copied to clipboard!', 'success');
    } catch {
        showStatus('Copy failed', 'error');
    }
}

function scheduleAsyncInputAnalysis() {
    if (!inputEditor) {
        return;
    }

    const rawInput = inputEditor.getValue();
    if (!rawInput.trim()) {
        hideStats();
        return;
    }

    latestStatsTicket += 1;
    const ticket = latestStatsTicket;
    clearTimeout(statsDebounceTimer);

    statsDebounceTimer = window.setTimeout(async () => {
        try {
            const response = await runWorkerJob('analyzeInput', {
                rawInput: inputEditor.getValue(),
                mode: currentMode
            });

            if (ticket !== latestStatsTicket) {
                return;
            }

            if (response.valid && response.stats) {
                displayStats(response.stats);
            } else if (!isProcessing) {
                hideStats();
            }
        } catch {
            if (ticket === latestStatsTicket && !isProcessing) {
                hideStats();
            }
        }
    }, ANALYZE_DEBOUNCE_MS);
}
function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }
    return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function shouldUseStreamRead(file) {
    return Boolean(
        file
        && typeof file.stream === 'function'
        && (file.size >= LARGE_FILE_THRESHOLD_BYTES
            || currentMode === 'jsonl'
            || currentMode === 'jsonlToJson')
    );
}

function waitForNextTick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

async function readFileAsTextStream(file, loadId) {
    const reader = file.stream().getReader();
    const decoder = new TextDecoder();
    const chunks = [];
    let bytesRead = 0;
    let chunkCount = 0;

    try {
        while (true) {
            if (loadId !== activeFileLoadId) {
                try {
                    await reader.cancel();
                } catch (_) {
                    // Ignore cancel failures when a newer load starts.
                }
                throw new Error('File load superseded.');
            }

            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            bytesRead += value.byteLength;
            chunks.push(decoder.decode(value, { stream: true }));
            fileMeta.textContent = `${file.name} • ${formatBytes(bytesRead)} / ${formatBytes(file.size)} (streaming)`;

            chunkCount += 1;
            if (chunkCount % STREAM_READ_YIELD_INTERVAL === 0) {
                await waitForNextTick();
            }
        }

        chunks.push(decoder.decode());
        return chunks.join('');
    } finally {
        try {
            reader.releaseLock();
        } catch (_) {
            // Ignore release failures.
        }
    }
}

async function readFileAsText(file, loadId) {
    if (shouldUseStreamRead(file)) {
        return readFileAsTextStream(file, loadId);
    }

    return file.text();
}

async function loadFileIntoEditor(file) {
    if (!file) {
        return;
    }

    if (isProcessing) {
        showStatus('Please wait for the current operation to finish before loading a file.', 'warning');
        return;
    }

    const loadId = ++activeFileLoadId;
    hideError();
    showStatus(`Loading ${file.name}...`, 'success');
    processingTime.textContent = 'Loading file from disk...';
    fileMeta.textContent = `${file.name} • ${formatBytes(file.size)}`;

    try {
        const rawText = await readFileAsText(file, loadId);
        if (loadId !== activeFileLoadId) {
            return;
        }

        setInputEditorValue(rawText);
        setOutputEditorValue('', modeInfo[currentMode].outputAceMode);
        hideError();

        fileMeta.textContent = `${file.name} • ${formatBytes(file.size)} • loaded`;
        processingTime.textContent = `Loaded ${formatBytes(file.size)} from disk`;

        const largeHint = rawText.length >= LARGE_FILE_THRESHOLD_BYTES
            ? ' Large input loaded; processing will run in the background worker.'
            : '';
        showStatus(`Loaded ${file.name}.${largeHint}`, 'success');
    } catch (error) {
        if (String(error && error.message).includes('superseded')) {
            return;
        }

        console.error('File load error:', error);
        const message = error && error.message ? error.message : String(error);
        showErrorPanel({
            errorType: 'processing',
            title: 'File Load Error',
            message
        });
        showStatus(`Error: ${safeFirstLine(message)}`, 'error');
        processingTime.textContent = 'File load failed';
    }
}

function handleModeTabClick(tab) {
    if (isProcessing) {
        return;
    }
    setActiveTab(tab);
    currentMode = tab.dataset.mode;
    updateModeUI();
}

function setupModeTabs() {
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => handleModeTabClick(tab));
    });

    modeTabs.forEach((tab, index) => {
        tab.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                return;
            }

            event.preventDefault();
            let nextIndex = index;

            if (event.key === 'ArrowRight') {
                nextIndex = (index + 1) % modeTabs.length;
            } else if (event.key === 'ArrowLeft') {
                nextIndex = (index - 1 + modeTabs.length) % modeTabs.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = modeTabs.length - 1;
            }

            const nextTab = modeTabs[nextIndex];
            nextTab.focus();
            nextTab.click();
        });
    });
}

function setupFileDropZone() {
    function preventDefaults(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropZone.addEventListener(eventName, event => {
            preventDefaults(event);
            if (!isProcessing) {
                fileDropZone.classList.add('drag-active');
            }
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropZone.addEventListener(eventName, event => {
            preventDefaults(event);
            fileDropZone.classList.remove('drag-active');
        });
    });

    fileDropZone.addEventListener('drop', event => {
        if (isProcessing) {
            return;
        }
        const files = event.dataTransfer && event.dataTransfer.files;
        if (files && files.length > 0) {
            loadFileIntoEditor(files[0]);
        }
    });
    fileDropZone.addEventListener('click', event => {
        if (isProcessing) {
            return;
        }
        if (event.target.closest('#chooseFileBtn')) {
            return;
        }
        fileInput.click();
    });

    fileDropZone.addEventListener('keydown', event => {
        if (isProcessing) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    });

    chooseFileBtn.addEventListener('click', event => {
        event.stopPropagation();
        if (!isProcessing) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (file) {
            loadFileIntoEditor(file);
        }
        fileInput.value = '';
    });
}

function setupEventListeners() {
    processBtn.addEventListener('click', processJSON);
    copyBtn.addEventListener('click', copyToClipboard);
    clearBtn.addEventListener('click', clearAll);
    exampleBtn.addEventListener('click', loadExample);
    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    jmespathQuery.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            processJSON();
        }
    });

    inputEditor.session.on('change', () => {
        queueInputStatsLabelUpdate();
        scheduleAsyncInputAnalysis();
    });

    inputEditor.on('paste', pastedText => {
        if (typeof pastedText === 'string' && pastedText.length >= LARGE_FILE_THRESHOLD_BYTES) {
            showStatus('Large paste detected. Parsing and formatting will run in a background worker.', 'warning');
        }
    });

    window.addEventListener('beforeunload', () => {
        if (jsonWorker) {
            try {
                jsonWorker.terminate();
            } catch (_) {
                // Ignore terminate failures.
            }
        }

        if (themeObserver) {
            themeObserver.disconnect();
        }
    });
}

function initialize() {
    initAceEditors();
    setupThemeSync();
    setupModeTabs();
    setupFileDropZone();
    setupEventListeners();

    const initialTab = Array.from(modeTabs).find(tab => tab.dataset.mode === currentMode);
    if (initialTab) {
        setActiveTab(initialTab);
    }

    updateInputStatsLabel('');
    updateOutputStatsLabel('');
    fileMeta.textContent = DEFAULT_FILE_META;
    updateModeUI();
    setOutputEditorValue('', modeInfo[currentMode].outputAceMode);

    // Warm up the worker so the first process call has less startup overhead.
    try {
        ensureWorker();
    } catch (error) {
        console.error(error);
        showStatus('Worker initialization failed. Processing may not be available.', 'error');
    }
}

initialize();
