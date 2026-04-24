/**
 * Shareable URL + local draft helpers for Lien Tooling forms.
 * See README "Shareable links and external prefill" for the integrator contract.
 */
(function (global) {
    var DRAFT_PREFIX = 'lienToolingDraft:';

    function cssEscapeIdent(s) {
        if (typeof CSS !== 'undefined' && CSS.escape) {
            return CSS.escape(String(s));
        }
        return String(s).replace(/["\\]/g, '\\$&');
    }

    function utf8ToBase64Url(str) {
        var bytes = new TextEncoder().encode(str);
        var bin = '';
        for (var i = 0; i < bytes.length; i++) {
            bin += String.fromCharCode(bytes[i]);
        }
        var b64 = btoa(bin);
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function base64UrlToUtf8(b64url) {
        var b64 = String(b64url).replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) {
            b64 += '=';
        }
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    }

    function collectFormState(form) {
        var state = {};
        for (var i = 0; i < form.elements.length; i++) {
            var el = form.elements[i];
            if (!el.name || el.disabled) continue;
            var tag = el.tagName.toLowerCase();
            if (tag === 'input') {
                var type = (el.type || '').toLowerCase();
                if (type === 'submit' || type === 'button' || type === 'file' || type === 'image') continue;
                if (type === 'checkbox') {
                    state[el.name] = el.checked;
                    continue;
                }
                if (type === 'radio') {
                    if (el.checked) state[el.name] = el.value;
                    continue;
                }
                state[el.name] = el.value;
                continue;
            }
            if (tag === 'textarea') {
                state[el.name] = el.value;
                continue;
            }
            if (tag === 'select') {
                state[el.name] = el.value;
            }
        }
        return state;
    }

    function applyFormState(form, state) {
        if (!state || typeof state !== 'object') return;
        var keys = Object.keys(state);
        for (var k = 0; k < keys.length; k++) {
            var name = keys[k];
            var value = state[name];
            if (value === undefined) continue;
            var sel = '[name="' + cssEscapeIdent(name) + '"]';
            var els = form.querySelectorAll(sel);
            if (!els.length) continue;
            var first = els[0];
            if (first.type === 'radio') {
                var strVal = String(value);
                for (var r = 0; r < els.length; r++) {
                    var radio = els[r];
                    radio.checked = radio.value === strVal;
                    if (radio.checked) {
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                continue;
            }
            if (first.type === 'checkbox') {
                first.checked = Boolean(value);
                first.dispatchEvent(new Event('change', { bubbles: true }));
                continue;
            }
            var v = value == null ? '' : String(value);
            for (var j = 0; j < els.length; j++) {
                els[j].value = v;
                els[j].dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    function readPrefillFromLocation() {
        var fromQuery = {};
        var params = new URLSearchParams(global.location.search);
        params.forEach(function (value, key) {
            fromQuery[key] = value;
        });

        var fromHash = null;
        var hash = global.location.hash;
        if (hash.indexOf('#d=') === 0) {
            try {
                var raw = hash.slice(3);
                var json = base64UrlToUtf8(raw);
                var parsed = JSON.parse(json);
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    fromHash = parsed;
                }
            } catch (e) {
                fromHash = null;
            }
        }
        return { fromQuery: fromQuery, fromHash: fromHash };
    }

    function formHasFieldName(form, name) {
        return !!form.querySelector('[name="' + cssEscapeIdent(name) + '"]');
    }

    function buildShareableUrl(form) {
        var state = collectFormState(form);
        var json = JSON.stringify(state);
        var payload = utf8ToBase64Url(json);
        return global.location.origin + global.location.pathname + '#d=' + payload;
    }

    function saveDraft(formId, state) {
        try {
            global.localStorage.setItem(DRAFT_PREFIX + formId, JSON.stringify(state));
        } catch (e) {
            /* quota / private mode */
        }
    }

    function loadDraft(formId) {
        try {
            var raw = global.localStorage.getItem(DRAFT_PREFIX + formId);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function showDraftBanner(form) {
        var wrap = form.parentElement;
        if (!wrap) return;
        var banner = document.createElement('div');
        banner.className = 'alert alert-info py-2 mb-3 no-print';
        banner.setAttribute('role', 'status');
        banner.textContent = 'Draft restored from this browser.';
        wrap.insertBefore(banner, form);
        global.setTimeout(function () {
            if (banner.parentElement) banner.remove();
        }, 6000);
    }

    function initFormPage(formId) {
        var form = document.getElementById(formId);
        if (!form) return;

        var read = readPrefillFromLocation();
        var queryState = {};
        var hasQueryField = false;
        Object.keys(read.fromQuery).forEach(function (key) {
            if (formHasFieldName(form, key)) {
                queryState[key] = read.fromQuery[key];
                hasQueryField = true;
            }
        });

        var hashKeys = read.fromHash ? Object.keys(read.fromHash) : [];
        var hasHashPrefill = hashKeys.length > 0;

        if (hasQueryField) {
            applyFormState(form, queryState);
        }
        if (hasHashPrefill) {
            applyFormState(form, read.fromHash);
        }

        var hasUrlPrefill = hasQueryField || hasHashPrefill;

        if (!hasUrlPrefill) {
            var draft = loadDraft(formId);
            if (draft && Object.keys(draft).length) {
                applyFormState(form, draft);
                showDraftBanner(form);
            }
        }

        var copyBtn = document.getElementById('copy-share-link-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                var url = buildShareableUrl(form);
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function () {
                        global.alert('Shareable link copied to clipboard.');
                    }).catch(function () {
                        global.prompt('Copy this link:', url);
                    });
                } else {
                    global.prompt('Copy this link:', url);
                }
            });
        }

        var saveTimer = null;
        form.addEventListener('input', function () {
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(function () {
                saveDraft(formId, collectFormState(form));
            }, 500);
        });
        form.addEventListener('change', function () {
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(function () {
                saveDraft(formId, collectFormState(form));
            }, 500);
        });
    }

    global.LienToolingFormState = {
        collectFormState: collectFormState,
        applyFormState: applyFormState,
        readPrefillFromLocation: readPrefillFromLocation,
        buildShareableUrl: buildShareableUrl,
        saveDraft: saveDraft,
        loadDraft: loadDraft,
        initFormPage: initFormPage
    };
})(window);
