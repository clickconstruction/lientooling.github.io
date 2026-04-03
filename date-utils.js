// HTML <input type="date"> yields YYYY-MM-DD with no timezone. ECMAScript parses
// `new Date("YYYY-MM-DD")` as UTC midnight, so in US timezones the local calendar day is wrong.

function parseHtmlDateValue(value) {
    if (value == null || value === '') return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, day] = s.split('-').map(Number);
        return new Date(y, m - 1, day);
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function localDateStringYMD(date) {
    const d = date instanceof Date ? date : new Date();
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLongLocal(value) {
    const d = parseHtmlDateValue(value);
    if (!d) return '';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
