(function (root, factory) {
    'use strict';

    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    if (root && typeof root === 'object') {
        root.TextUtilsBadiCalendar = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const BADI_FIRST_YEAR_GREGORIAN = 1844;
    const BADI_TABLE_FIRST_YEAR_GREGORIAN = 2015; // 172 B.E.
    const BADI_TABLE_LAST_YEAR_GREGORIAN = 2064;  // 221 B.E. boundary; next Naw-Ruz not included
    const TEHRAN_FIXED_OFFSET_MS = 3.5 * 3600 * 1000;

    // 2015-2064 Naw-Ruz dates are from the Bahá'í World Centre "Bahá'í Dates 172 to 221 B.E." table.
    // The tool models Naw-Ruz as the start of the listed Tehran civil day (not sunset).
    const BADI_NAWRUZ_TABLE_2015_2064 = Object.freeze({
        2015: '2015-03-21', // 172 B.E.
        2016: '2016-03-20', // 173 B.E.
        2017: '2017-03-20', // 174 B.E.
        2018: '2018-03-21', // 175 B.E.
        2019: '2019-03-21', // 176 B.E.
        2020: '2020-03-20', // 177 B.E.
        2021: '2021-03-20', // 178 B.E.
        2022: '2022-03-21', // 179 B.E.
        2023: '2023-03-21', // 180 B.E.
        2024: '2024-03-20', // 181 B.E.
        2025: '2025-03-20', // 182 B.E.
        2026: '2026-03-21', // 183 B.E.
        2027: '2027-03-21', // 184 B.E.
        2028: '2028-03-20', // 185 B.E.
        2029: '2029-03-20', // 186 B.E.
        2030: '2030-03-20', // 187 B.E.
        2031: '2031-03-21', // 188 B.E.
        2032: '2032-03-20', // 189 B.E.
        2033: '2033-03-20', // 190 B.E.
        2034: '2034-03-20', // 191 B.E.
        2035: '2035-03-21', // 192 B.E.
        2036: '2036-03-20', // 193 B.E.
        2037: '2037-03-20', // 194 B.E.
        2038: '2038-03-20', // 195 B.E.
        2039: '2039-03-21', // 196 B.E.
        2040: '2040-03-20', // 197 B.E.
        2041: '2041-03-20', // 198 B.E.
        2042: '2042-03-20', // 199 B.E.
        2043: '2043-03-21', // 200 B.E.
        2044: '2044-03-20', // 201 B.E.
        2045: '2045-03-20', // 202 B.E.
        2046: '2046-03-20', // 203 B.E.
        2047: '2047-03-21', // 204 B.E.
        2048: '2048-03-20', // 205 B.E.
        2049: '2049-03-20', // 206 B.E.
        2050: '2050-03-20', // 207 B.E.
        2051: '2051-03-21', // 208 B.E.
        2052: '2052-03-20', // 209 B.E.
        2053: '2053-03-20', // 210 B.E.
        2054: '2054-03-20', // 211 B.E.
        2055: '2055-03-21', // 212 B.E.
        2056: '2056-03-20', // 213 B.E.
        2057: '2057-03-20', // 214 B.E.
        2058: '2058-03-20', // 215 B.E.
        2059: '2059-03-21', // 216 B.E.
        2060: '2060-03-20', // 217 B.E.
        2061: '2061-03-20', // 218 B.E.
        2062: '2062-03-20', // 219 B.E.
        2063: '2063-03-21', // 220 B.E.
        2064: '2064-03-20'  // 221 B.E. boundary marker
    });

    const MONTH_NAMES = Object.freeze([
        'Bahá', 'Jalál', 'Jamál', '‘Aẓamat', 'Núr', 'Raḥmat', 'Kalimát', 'Kamál', 'Asmá’', '‘Izzat',
        'Mashíyyat', '‘Ilm', 'Qudrat', 'Qawl', 'Masá’il', 'Sharaf', 'Sulṭán', 'Mulk', '‘Alá’'
    ]);

    const tehranCivilMidnightUtcMs = (year, month1Based, day) =>
        Date.UTC(year, month1Based - 1, day, 0, 0, 0) - TEHRAN_FIXED_OFFSET_MS;

    const toYmdFromTehranDayBoundary = (utcMs) => {
        const d = new Date(utcMs + TEHRAN_FIXED_OFFSET_MS);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    };

    const nawruzUTC = (gregorianYear) => {
        if (!Number.isInteger(gregorianYear)) {
            throw new TypeError('Gregorian year must be an integer.');
        }
        if (gregorianYear < BADI_FIRST_YEAR_GREGORIAN) {
            throw new RangeError(`Badíʿ dates are supported from Naw-Rúz ${BADI_FIRST_YEAR_GREGORIAN}-03-21 onward.`);
        }

        if (gregorianYear < BADI_TABLE_FIRST_YEAR_GREGORIAN) {
            // Historical fixed-rule practice prior to the 2015 reform.
            return tehranCivilMidnightUtcMs(gregorianYear, 3, 21);
        }

        const ymd = BADI_NAWRUZ_TABLE_2015_2064[gregorianYear];
        if (!ymd) {
            throw new RangeError(`Badíʿ table-driven Naw-Rúz dates are available through ${BADI_TABLE_LAST_YEAR_GREGORIAN}-03-20.`);
        }

        const [year, month, day] = ymd.split('-').map(Number);
        return tehranCivilMidnightUtcMs(year, month, day);
    };

    const badiFromGregorian = (instant) => {
        if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
            throw new TypeError('badiFromGregorian requires a valid Date.');
        }

        const t = instant.getTime();
        const gYear = instant.getUTCFullYear();
        let start = nawruzUTC(gYear);
        let badiYearGregorian = gYear;

        if (t < start) {
            badiYearGregorian -= 1;
            start = nawruzUTC(badiYearGregorian);
        }

        // 221 B.E. (Naw-Rúz 2064) is included only as an upper boundary marker; computing the rest
        // of that year requires Naw-Rúz 2065, which is outside the embedded official table.
        if (badiYearGregorian >= BADI_TABLE_LAST_YEAR_GREGORIAN) {
            throw new RangeError('Badíʿ conversion is supported through the start of 221 B.E. (Naw-Rúz 2064-03-20).');
        }

        const nextStart = nawruzUTC(badiYearGregorian + 1);
        const totalDays = Math.round((nextStart - start) / 86400000);
        const ayyamiHaDays = totalDays - 361; // 4 or 5 based on consecutive Naw-Rúz starts
        const dayOfYear = Math.floor((t - start) / 86400000) + 1;

        const coreMonthsDays = 19 * 18;
        let section = 'month';
        let month = 0;
        let day = 0;

        if (dayOfYear <= coreMonthsDays) {
            month = Math.floor((dayOfYear - 1) / 19) + 1;
            day = ((dayOfYear - 1) % 19) + 1;
        } else if (dayOfYear <= coreMonthsDays + ayyamiHaDays) {
            section = 'ayyamiha';
            day = dayOfYear - coreMonthsDays;
        } else {
            month = 19;
            day = dayOfYear - (coreMonthsDays + ayyamiHaDays);
        }

        const yearBE = badiYearGregorian - 1844 + 1;
        const label = section === 'ayyamiha'
            ? `Ayyám-i-Há (intercalary) day ${day} of ${ayyamiHaDays}`
            : `Month ${month}: ${MONTH_NAMES[month - 1]}, Day ${day}`;

        return {
            yearBE,
            month,
            day,
            section,
            label,
            ayyamiHaDays,
            nawruz: new Date(start),
            nawruzNext: new Date(nextStart)
        };
    };

    const runSelfTests = () => {
        const failures = [];
        const assert = (condition, message) => {
            if (!condition) failures.push(message);
        };

        const nawruzCases = [
            { year: 1844, ymd: '1844-03-21' },
            { year: 2015, ymd: '2015-03-21' },
            { year: 2024, ymd: '2024-03-20' },
            { year: 2025, ymd: '2025-03-20' },
            { year: 2064, ymd: '2064-03-20' }
        ];

        nawruzCases.forEach(({ year, ymd }) => {
            try {
                const actual = toYmdFromTehranDayBoundary(nawruzUTC(year));
                assert(actual === ymd, `Naw-Rúz ${year} expected ${ymd}, got ${actual}`);
            } catch (err) {
                failures.push(`Naw-Rúz lookup failed for ${year}: ${err.message}`);
            }
        });

        try {
            const before = badiFromGregorian(new Date('2025-03-19T12:00:00Z'));
            assert(before.yearBE === 181, `Expected 181 B.E. before 2025 Naw-Rúz, got ${before.yearBE}`);
        } catch (err) {
            failures.push(`Boundary test before 2025 Naw-Rúz failed: ${err.message}`);
        }

        try {
            const after = badiFromGregorian(new Date('2025-03-20T12:00:00Z'));
            assert(after.yearBE === 182, `Expected 182 B.E. after 2025 Naw-Rúz, got ${after.yearBE}`);
            assert(after.month === 1 && after.day === 1, `Expected month 1 day 1 after 2025 Naw-Rúz, got month ${after.month} day ${after.day}`);
        } catch (err) {
            failures.push(`Boundary test after 2025 Naw-Rúz failed: ${err.message}`);
        }

        try {
            badiFromGregorian(new Date('2064-03-20T12:00:00Z'));
            failures.push('Expected RangeError at/after 221 B.E. boundary, but conversion succeeded.');
        } catch (err) {
            assert(err instanceof RangeError, `Expected RangeError at boundary, got ${err && err.name ? err.name : typeof err}`);
        }

        if (failures.length) {
            throw new Error(`Badíʿ self-tests failed: ${failures.join(' | ')}`);
        }

        return { ok: true, checked: nawruzCases.length + 3 };
    };

    return Object.freeze({
        constants: Object.freeze({
            BADI_FIRST_YEAR_GREGORIAN,
            BADI_TABLE_FIRST_YEAR_GREGORIAN,
            BADI_TABLE_LAST_YEAR_GREGORIAN,
            TEHRAN_FIXED_OFFSET_MS
        }),
        nawruzUTC,
        badiFromGregorian,
        runSelfTests,
        helpers: Object.freeze({
            toYmdFromTehranDayBoundary
        })
    });
});
