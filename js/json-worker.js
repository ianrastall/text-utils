'use strict';

// Load optional heavy libraries inside the worker so parsing/validation/querying stays off the UI thread.
const CDN_URLS = {
    jsonlint: 'https://cdnjs.cloudflare.com/ajax/libs/jsonlint/1.6.0/jsonlint.min.js',
    ajv: 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.12.0/ajv7.min.js',
    jmespath: 'https://cdnjs.cloudflare.com/ajax/libs/jmespath.js/0.16.0/jmespath.min.js'
};

const libraryStatus = {
    jsonlint: false,
    ajv: false,
    jmespath: false
};

const MAX_RECURSION_DEPTH = 1000;

safeImport('jsonlint', CDN_URLS.jsonlint);
safeImport('ajv', CDN_URLS.ajv);
safeImport('jmespath', CDN_URLS.jmespath);

self.addEventListener('message', event => {
    const data = event.data || {};
    const jobId = data.jobId;
    const action = data.action;
    const payload = data.payload || {};

    if (typeof jobId !== 'number' || typeof action !== 'string') {
        return;
    }

    const startedAt = now();

    try {
        let result;
        if (action === 'process') {
            result = processRequest(payload);
        } else if (action === 'analyzeInput') {
            result = analyzeInputRequest(payload);
        } else {
            throw makeCustomError('processing', `Unknown worker action: ${action}`);
        }

        self.postMessage({
            jobId,
            action,
            ok: true,
            durationMs: now() - startedAt,
            ...result
        });
    } catch (error) {
        const normalized = normalizeThrownError(error);
        const response = {
            jobId,
            action,
            ok: false,
            durationMs: now() - startedAt,
            error: normalized.error || normalized
        };

        if (normalized.stats) {
            response.stats = normalized.stats;
        }
        if (typeof normalized.validationReport === 'string') {
            response.validationReport = normalized.validationReport;
        }

        self.postMessage(response);
    }
});

function safeImport(key, url) {
    try {
        importScripts(url);
        libraryStatus[key] = true;
    } catch (error) {
        libraryStatus[key] = false;
        // Keep running with fallbacks where possible.
    }
}

function now() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        return performance.now();
    }
    return Date.now();
}

function processRequest(payload) {
    const rawInput = typeof payload.rawInput === 'string' ? payload.rawInput : '';
    const mode = typeof payload.mode === 'string' ? payload.mode : 'format';
    const options = payload.options && typeof payload.options === 'object' ? payload.options : {};

    switch (mode) {
        case 'format':
            return processFormatMode(rawInput, options);
        case 'jsonl':
            return processJsonToJsonlMode(rawInput, options);
        case 'jsonlToJson':
            return processJsonlToJsonMode(rawInput, options);
        case 'validate':
            return processValidateMode(rawInput, options);
        default:
            throw makeCustomError('processing', `Unknown mode: ${mode}`);
    }
}

function analyzeInputRequest(payload) {
    const rawInput = typeof payload.rawInput === 'string' ? payload.rawInput : '';
    const mode = typeof payload.mode === 'string' ? payload.mode : 'format';

    if (!rawInput.trim()) {
        return { valid: false };
    }

    try {
        let value;
        if (mode === 'jsonlToJson') {
            value = parseJsonLines(rawInput).data;
        } else {
            value = parseJsonText(rawInput, 'input');
        }
        return {
            valid: true,
            stats: analyzeJSON(value)
        };
    } catch {
        return { valid: false };
    }
}

function processFormatMode(rawInput, options) {
    let value = parseJsonText(rawInput, 'input');
    value = applyQueryIfPresent(value, options.query);

    if (options.sortKeys) {
        value = sortObjectKeys(value);
    }

    const stats = analyzeJSON(value);
    const resultText = stringifyJson(value, options.indent);

    return {
        resultText,
        outputMode: 'ace/mode/json',
        stats,
        message: 'JSON formatted successfully.'
    };
}

function processJsonToJsonlMode(rawInput, options) {
    let value = parseJsonText(rawInput, 'input');
    const hasQuery = typeof options.query === 'string' && options.query.trim().length > 0;
    value = applyQueryIfPresent(value, options.query);

    const stats = analyzeJSON(value);
    const conversion = convertJsonToJsonl(value, { allowSingleValue: hasQuery });

    return {
        resultText: conversion.text,
        outputMode: 'ace/mode/json',
        stats,
        message: `Converted ${conversion.count} record(s) to JSONL.`
    };
}

function processJsonlToJsonMode(rawInput, options) {
    const parsed = parseJsonLines(rawInput);
    let value = parsed.data;

    if (options.sortKeys) {
        value = sortObjectKeys(value);
    }

    const stats = analyzeJSON(value);
    const resultText = stringifyJson(value, options.indent);

    return {
        resultText,
        outputMode: 'ace/mode/json',
        stats,
        message: `Converted ${parsed.recordCount} JSONL line(s) to a JSON array.`
    };
}

function processValidateMode(rawInput, options) {
    const value = parseJsonText(rawInput, 'input');
    const stats = analyzeJSON(value);
    const schemaText = typeof options.schemaText === 'string' ? options.schemaText : '';

    if (schemaText.trim()) {
        let schemaValue;
        let validation;

        try {
            schemaValue = parseSchemaText(schemaText);
            validation = validateWithSchema(value, schemaValue);
        } catch (error) {
            if (error && typeof error === 'object') {
                if (error.error && typeof error.error === 'object') {
                    error.stats = error.stats || stats;
                } else if (error.errorType === 'schemaSyntax' || error.errorType === 'schema') {
                    throw { error, stats };
                }
            }
            throw error;
        }

        if (!validation.valid) {
            throw {
                error: {
                    errorType: 'schema',
                    title: 'Schema Validation Failed',
                    message: `JSON is valid but failed schema validation (${validation.errors.length} violation(s)).`
                },
                stats,
                validationReport: buildSchemaFailureReport(validation.errors, stats)
            };
        }

        return {
            resultText: buildValidationSuccessReport(value, stats, {
                schemaChecked: true,
                schemaErrorCount: 0
            }),
            outputMode: 'ace/mode/text',
            stats,
            message: 'JSON and schema validation passed.'
        };
    }

    return {
        resultText: buildValidationSuccessReport(value, stats, {
            schemaChecked: false,
            schemaErrorCount: 0
        }),
        outputMode: 'ace/mode/text',
        stats,
        message: 'JSON is valid.'
    };
}
function parseJsonText(text, source) {
    try {
        return parseJsonStrict(text);
    } catch (error) {
        throw makeParseError(error, text, source || 'input', 'syntax');
    }
}

function parseSchemaText(text) {
    try {
        return parseJsonStrict(text);
    } catch (error) {
        throw makeParseError(error, text, 'schema', 'schemaSyntax');
    }
}

function parseJsonStrict(text) {
    if (self.jsonlint && typeof self.jsonlint.parse === 'function') {
        return self.jsonlint.parse(text);
    }
    return JSON.parse(text);
}

function parseJsonLines(text) {
    const records = [];
    let lineNumber = 1;
    let startIndex = 0;

    while (startIndex <= text.length) {
        let endIndex = text.indexOf('\n', startIndex);
        if (endIndex === -1) {
            endIndex = text.length;
        }

        let line = text.slice(startIndex, endIndex);
        if (line.endsWith('\r')) {
            line = line.slice(0, -1);
        }

        if (line.trim()) {
            try {
                records.push(parseJsonStrict(line));
            } catch (error) {
                const lineError = makeParseError(error, line, 'input', 'syntax');
                lineError.line = lineNumber;
                if (!lineError.message.toLowerCase().includes('jsonl')) {
                    lineError.message = `JSONL parse error on line ${lineNumber}: ${lineError.message}`;
                }
                throw lineError;
            }
        }

        if (endIndex === text.length) {
            break;
        }

        startIndex = endIndex + 1;
        lineNumber += 1;
    }

    return { data: records, recordCount: records.length };
}

function convertJsonToJsonl(value, options) {
    const allowSingleValue = Boolean(options && options.allowSingleValue);

    if (Array.isArray(value)) {
        return {
            text: value.map(item => stringifyLine(item)).join('\n'),
            count: value.length
        };
    }

    if (!allowSingleValue) {
        throw makeCustomError(
            'processing',
            'Input must be a JSON array for JSONL conversion. Apply a JMESPath query that returns an array, or switch to Format mode.'
        );
    }

    return {
        text: stringifyLine(value),
        count: 1
    };
}

function stringifyLine(value) {
    const text = JSON.stringify(value);
    if (typeof text !== 'string') {
        throw makeCustomError('processing', 'Unable to serialize a JSONL line (query returned an unsupported value).');
    }
    return text;
}

function stringifyJson(value, indentOption) {
    const indent = resolveIndent(indentOption);
    const text = JSON.stringify(value, null, indent);
    if (typeof text !== 'string') {
        throw makeCustomError('processing', 'Unable to serialize output JSON.');
    }
    return text;
}

function resolveIndent(indentOption) {
    if (indentOption === 'tab') {
        return '\t';
    }
    if (indentOption === '0' || indentOption === 0) {
        return 0;
    }

    const parsed = Number.parseInt(indentOption, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return 2;
    }
    return Math.min(parsed, 10);
}

function applyQueryIfPresent(value, queryText) {
    const query = typeof queryText === 'string' ? queryText.trim() : '';
    if (!query) {
        return value;
    }

    if (!(self.jmespath && typeof self.jmespath.search === 'function')) {
        throw makeCustomError('query', 'JMESPath library is unavailable in the worker.');
    }

    try {
        const result = self.jmespath.search(value, query);
        if (typeof result === 'undefined') {
            throw makeCustomError('query', 'JMESPath query returned no result (undefined).');
        }
        return result;
    } catch (error) {
        if (error && error.errorType) {
            throw error;
        }
        throw makeCustomError('query', error && error.message ? error.message : String(error));
    }
}

function analyzeJSON(value, depth = 0, stats) {
    if (depth > MAX_RECURSION_DEPTH) {
        throw makeCustomError('processing', `JSON is nested too deeply to analyze (> ${MAX_RECURSION_DEPTH} levels).`);
    }

    const nextStats = stats || { objects: 0, arrays: 0, keys: 0, maxDepth: 0 };
    nextStats.maxDepth = Math.max(nextStats.maxDepth, depth);

    if (Array.isArray(value)) {
        nextStats.arrays += 1;
        for (const item of value) {
            analyzeJSON(item, depth + 1, nextStats);
        }
        return nextStats;
    }

    if (value && typeof value === 'object') {
        nextStats.objects += 1;
        const keys = Object.keys(value);
        nextStats.keys += keys.length;
        for (const key of keys) {
            analyzeJSON(value[key], depth + 1, nextStats);
        }
        return nextStats;
    }

    return nextStats;
}

function sortObjectKeys(value, depth = 0) {
    if (depth > MAX_RECURSION_DEPTH) {
        throw makeCustomError('processing', `JSON is nested too deeply to sort (> ${MAX_RECURSION_DEPTH} levels).`);
    }

    if (Array.isArray(value)) {
        return value.map(item => sortObjectKeys(item, depth + 1));
    }

    if (value && typeof value === 'object') {
        const out = {};
        for (const key of Object.keys(value).sort()) {
            out[key] = sortObjectKeys(value[key], depth + 1);
        }
        return out;
    }

    return value;
}
function validateWithSchema(data, schema) {
    const AjvCtor = resolveAjvConstructor();
    if (!AjvCtor) {
        throw makeCustomError('processing', 'Ajv failed to load in the worker, so schema validation is unavailable.');
    }

    let ajv;
    try {
        ajv = new AjvCtor({
            allErrors: true,
            strict: false,
            allowUnionTypes: true,
            validateFormats: false
        });
    } catch (error) {
        throw makeCustomError('processing', error && error.message ? error.message : String(error));
    }

    let validateFn;
    try {
        validateFn = ajv.compile(schema);
    } catch (error) {
        throw {
            error: {
                errorType: 'schema',
                title: 'Schema Compilation Error',
                message: error && error.message ? error.message : String(error)
            }
        };
    }

    const valid = Boolean(validateFn(data));
    return {
        valid,
        errors: valid ? [] : formatAjvErrors(validateFn.errors)
    };
}

function resolveAjvConstructor() {
    if (self.ajv7) {
        if (typeof self.ajv7 === 'function') {
            return self.ajv7;
        }
        if (typeof self.ajv7.Ajv === 'function') {
            return self.ajv7.Ajv;
        }
        if (typeof self.ajv7.default === 'function') {
            return self.ajv7.default;
        }
    }

    if (typeof self.Ajv === 'function') {
        return self.Ajv;
    }

    if (self.Ajv && typeof self.Ajv.Ajv === 'function') {
        return self.Ajv.Ajv;
    }

    for (const key of ['ajv', 'ajv2019', 'ajv2020']) {
        const candidate = self[key];
        if (!candidate) {
            continue;
        }
        if (typeof candidate === 'function') {
            return candidate;
        }
        if (typeof candidate.Ajv === 'function') {
            return candidate.Ajv;
        }
        if (typeof candidate.default === 'function') {
            return candidate.default;
        }
    }

    return null;
}

function formatAjvErrors(errors) {
    return (errors || []).map((error, index) => ({
        index: index + 1,
        instancePath: error && typeof error.instancePath === 'string' && error.instancePath
            ? error.instancePath
            : '/',
        schemaPath: error && typeof error.schemaPath === 'string' ? error.schemaPath : '',
        keyword: error && typeof error.keyword === 'string' ? error.keyword : '',
        message: error && typeof error.message === 'string' ? error.message : 'Schema validation error'
    }));
}

function buildValidationSuccessReport(value, stats, options) {
    const type = describeType(value);
    const schemaChecked = Boolean(options && options.schemaChecked);
    const lines = [
        'Valid JSON',
        '',
        `Type: ${type}`,
        `Objects: ${stats.objects}`,
        `Arrays: ${stats.arrays}`,
        `Total Keys: ${stats.keys}`,
        `Max Depth: ${stats.maxDepth}`,
        `Schema Checked: ${schemaChecked ? 'Yes (passed)' : 'No'}`
    ];

    return lines.join('\n');
}

function buildSchemaFailureReport(errors, stats) {
    const lines = [
        'Schema validation failed',
        '',
        `Violations: ${errors.length}`,
        ''
    ];

    for (const error of errors) {
        const path = error.instancePath || '/';
        const schemaPath = error.schemaPath ? ` (${error.schemaPath})` : '';
        lines.push(`${error.index}. ${path}: ${error.message}${schemaPath}`);
    }

    lines.push('');
    lines.push('JSON Stats');
    lines.push(`Objects: ${stats.objects}`);
    lines.push(`Arrays: ${stats.arrays}`);
    lines.push(`Total Keys: ${stats.keys}`);
    lines.push(`Max Depth: ${stats.maxDepth}`);

    return lines.join('\n');
}

function describeType(value) {
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return 'Array';
    }
    if (typeof value === 'object') {
        return 'Object';
    }
    return typeof value;
}
function makeParseError(originalError, sourceText, source, errorType) {
    const message = originalError && originalError.message
        ? String(originalError.message)
        : String(originalError);

    const location = extractErrorLocation(originalError, sourceText);
    return {
        errorType: errorType || 'syntax',
        source: source || 'input',
        message,
        ...(location.line ? { line: location.line } : {}),
        ...(location.column ? { column: location.column } : {})
    };
}

function extractErrorLocation(error, sourceText) {
    const out = { line: null, column: null };

    if (error && error.hash && error.hash.loc) {
        const loc = error.hash.loc;
        if (Number.isFinite(loc.first_line)) {
            out.line = Number(loc.first_line);
        }
        if (Number.isFinite(loc.first_column)) {
            out.column = Number(loc.first_column) + 1;
        }
    }

    const message = error && error.message ? String(error.message) : String(error);

    if (!out.line) {
        const lineMatch = message.match(/line\s+(\d+)/i);
        if (lineMatch) {
            out.line = Number(lineMatch[1]);
        }
    }

    if (!out.column) {
        const columnMatch = message.match(/(?:column|character)\s+(\d+)/i);
        if (columnMatch) {
            out.column = Number(columnMatch[1]);
        }
    }

    if (!out.column) {
        const messageLines = message.split(/\r?\n/);
        for (const line of messageLines) {
            const caretIndex = line.indexOf('^');
            if (caretIndex >= 0) {
                out.column = caretIndex + 1;
                break;
            }
        }
    }

    if ((!out.line || !out.column) && typeof sourceText === 'string') {
        const posMatch = message.match(/(?:at\s+)?position\s+(\d+)/i);
        if (posMatch) {
            const position = Math.max(0, Math.min(sourceText.length, Number(posMatch[1])));
            const calculated = positionToLineColumn(sourceText, position);
            if (!out.line) {
                out.line = calculated.line;
            }
            if (!out.column) {
                out.column = calculated.column;
            }
        }
    }

    return out;
}

function positionToLineColumn(text, position) {
    let line = 1;
    let column = 1;

    for (let index = 0; index < position; index += 1) {
        if (text[index] === '\n') {
            line += 1;
            column = 1;
        } else {
            column += 1;
        }
    }

    return { line, column };
}

function makeCustomError(errorType, message, extra) {
    return {
        errorType: errorType || 'processing',
        message: typeof message === 'string' ? message : String(message),
        ...(extra && typeof extra === 'object' ? extra : {})
    };
}

function normalizeThrownError(error) {
    if (!error) {
        return { error: makeCustomError('processing', 'Unknown worker error.') };
    }

    if (error.error && typeof error.error === 'object') {
        return {
            error: {
                errorType: error.error.errorType || 'processing',
                title: error.error.title,
                source: error.error.source,
                message: error.error.message || 'Worker error',
                ...(Number.isFinite(error.error.line) ? { line: error.error.line } : {}),
                ...(Number.isFinite(error.error.column) ? { column: error.error.column } : {})
            },
            ...(error.stats ? { stats: error.stats } : {}),
            ...(typeof error.validationReport === 'string' ? { validationReport: error.validationReport } : {})
        };
    }

    if (error.errorType) {
        return {
            error: {
                errorType: error.errorType || 'processing',
                title: error.title,
                source: error.source,
                message: error.message || 'Worker error',
                ...(Number.isFinite(error.line) ? { line: error.line } : {}),
                ...(Number.isFinite(error.column) ? { column: error.column } : {})
            }
        };
    }

    if (error instanceof Error) {
        return { error: makeCustomError('processing', error.message || String(error)) };
    }

    return { error: makeCustomError('processing', String(error)) };
}
