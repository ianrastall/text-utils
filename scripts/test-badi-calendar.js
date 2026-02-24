'use strict';

const path = require('path');

const badi = require(path.join(__dirname, '..', 'js', 'badi-calendar.js'));

const sampleInstants = [
    '2025-03-19T12:00:00Z',
    '2025-03-20T12:00:00Z',
    '2026-03-21T12:00:00Z'
];

const formatSample = (iso) => {
    const d = new Date(iso);
    const result = badi.badiFromGregorian(d);
    return {
        instant: iso,
        yearBE: result.yearBE,
        label: result.label,
        ayyamiHaDays: result.ayyamiHaDays
    };
};

try {
    const summary = badi.runSelfTests();
    console.log('Badíʿ self-tests passed.');
    console.log(`Checks: ${summary.checked}`);
    console.log(`Supported Naw-Rúz table range: ${badi.constants.BADI_TABLE_FIRST_YEAR_GREGORIAN}-${badi.constants.BADI_TABLE_LAST_YEAR_GREGORIAN}`);
    console.log('');
    console.log('Sample conversions:');
    for (const iso of sampleInstants) {
        const sample = formatSample(iso);
        console.log(`- ${sample.instant} -> ${sample.yearBE} B.E.; ${sample.label}; Ayyám-i-Há=${sample.ayyamiHaDays}`);
    }
    process.exitCode = 0;
} catch (err) {
    console.error('Badíʿ self-tests failed.');
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
}
