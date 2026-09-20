/**
 * "Your business", remembered on this device. Every form opens on the same block — who you
 * are and where you are — so it is kept in this browser's localStorage and offered back:
 * empty fields are filled from it, and the card folds to one line with Change and Forget.
 * It never overrides a value a link or a draft already put there, it stays open when the page
 * was opened from a prefill link (those are meant to be reviewed), and nothing leaves the
 * browser. Load this after form-url-state.js / script.js so prefill and drafts land first.
 */
(function (global) {
    'use strict';

    var KEY = 'lientooling.businessProfile.v1';
    // profile key -> the field that holds it, per form
    var MAP = {
        'demand-letter': { company: 'business-name', person: 'sender-name', address: 'business-address', city: 'business-city', state: 'business-state', zip: 'business-zip', phone: 'business-phone', email: 'business-email' },
        'mechanics-lien': { company: 'company-name', person: 'claimant-name', address: 'claimant-address', city: 'claimant-city', state: 'claimant-state', zip: 'claimant-zip' },
        'release-lien': { company: 'company-name', person: 'claimant-name', address: 'claimant-address', city: 'claimant-city', state: 'claimant-state', zip: 'claimant-zip' }
    };

    function load() {
        try { return JSON.parse(global.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    }
    function save(profile) {
        try { global.localStorage.setItem(KEY, JSON.stringify(profile)); } catch (e) { /* private mode: nothing to remember */ }
    }
    function forget() {
        try { global.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    }
    function openedFromPrefillLink() {
        var s = global.LienToolingFormState;
        if (!s || !s.readPrefillFromLocation) return false;
        var read = s.readPrefillFromLocation();
        return !!((read.fromHash && Object.keys(read.fromHash).length) || (read.fromQuery && Object.keys(read.fromQuery).length));
    }

    function init() {
        var formId = Object.keys(MAP).filter(function (id) { return document.getElementById(id); })[0];
        if (!formId) return;
        var form = document.getElementById(formId);
        var map = MAP[formId];
        var fields = {};
        Object.keys(map).forEach(function (k) { if (form.elements[map[k]]) fields[k] = form.elements[map[k]]; });
        var keys = Object.keys(fields);
        if (!keys.length) return;
        var card = fields[keys[0]].closest('.card');

        // Remember one field at a time, as it is typed — so "Fill Test Data" (which sets values
        // without typing) never becomes the profile.
        keys.forEach(function (k) {
            fields[k].addEventListener('input', function () {
                var p = load();
                var v = String(fields[k].value).trim();
                if (v) p[k] = v; else delete p[k];
                save(p);
            });
        });

        var profile = load();
        var filledAny = false;
        keys.forEach(function (k) {
            if (profile[k] && !String(fields[k].value).trim()) {
                fields[k].value = profile[k];
                filledAny = true;
            }
        });
        if (filledAny) form.dispatchEvent(new Event('change', { bubbles: true }));

        var complete = keys.every(function (k) { return !fields[k].required || String(fields[k].value).trim(); });
        var fromProfile = keys.some(function (k) { return profile[k] && fields[k].value === profile[k]; });
        if (!card || !complete || !fromProfile || openedFromPrefillLink()) return;

        var body = card.querySelector('.card-body') || card;
        var rows = Array.prototype.filter.call(body.children, function (el) { return el.tagName !== 'H4'; });
        var line = document.createElement('p');
        line.className = 'business-profile-line no-print';
        var who = (fields.company && fields.company.value.trim()) || (fields.person && fields.person.value.trim()) || '';
        var where = [fields.city && fields.city.value.trim(), fields.state && fields.state.value.trim()].filter(Boolean).join(', ');
        var text = document.createElement('span');
        text.textContent = '✓ ' + who + (where ? ' · ' + where : '') + ' — remembered on this device';
        var change = document.createElement('button');
        change.type = 'button'; change.className = 'btn btn-sm btn-outline-secondary'; change.textContent = 'Change';
        var drop = document.createElement('button');
        drop.type = 'button'; drop.className = 'btn btn-sm btn-link business-profile-forget'; drop.textContent = 'Forget';
        line.appendChild(text); line.appendChild(change); line.appendChild(drop);
        body.appendChild(line);

        function setCollapsed(on) {
            rows.forEach(function (el) { el.style.display = on ? 'none' : ''; });
            line.style.display = on ? '' : 'none';
        }
        change.addEventListener('click', function () { setCollapsed(false); if (fields[keys[0]].focus) fields[keys[0]].focus(); });
        drop.addEventListener('click', function () {
            forget();
            keys.forEach(function (k) { fields[k].value = ''; });
            form.dispatchEvent(new Event('change', { bubbles: true }));
            setCollapsed(false);
        });
        // A required field that fails validation must never be hidden.
        form.addEventListener('invalid', function (e) { if (card.contains(e.target)) setCollapsed(false); }, true);
        setCollapsed(true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window);
