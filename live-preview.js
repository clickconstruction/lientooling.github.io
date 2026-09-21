/**
 * The document beside the form. On a wide screen the page each form generates sits next to
 * it and re-renders as you type, so nobody fills 27 fields blind, presses Generate, and goes
 * Back to Edit to fix a typo. It calls the SAME generator the Generate button always called
 * (createDemandLetterPrintView / createMechanicsLienPrintView / createReleasePrintView), so
 * what you see is exactly what prints; this file only keeps the form on screen beside it,
 * marks what is still missing, and makes the button print. On a narrow screen nothing here
 * runs and the page works as before: Generate, then Back to Edit.
 * Load it last, after the form's own script.
 */
(function (global) {
    'use strict';

    var GENERATORS = {
        'demand-letter': 'createDemandLetterPrintView',
        'mechanics-lien': 'createMechanicsLienPrintView',
        'release-lien': 'createReleasePrintView'
    };
    var WIDE = '(min-width: 1100px)';
    var MISSING = /(NaN|Invalid Date|undefined|\[[^\]\n]{2,40}\])/g;

    function init() {
        var formId = Object.keys(GENERATORS).filter(function (id) { return document.getElementById(id); })[0];
        var form = formId && document.getElementById(formId);
        var view = document.getElementById('print-view');
        var generate = formId && global[GENERATORS[formId]];
        if (!form || !view || typeof generate !== 'function' || !global.matchMedia) return;

        var container = form.parentElement;
        var mq = global.matchMedia(WIDE);
        var submit = form.querySelector('button[type="submit"]');
        var submitLabel = submit ? submit.textContent : '';
        var live = false;
        var timer = null;

        function requiredLeft() {
            return Array.prototype.filter.call(form.querySelectorAll(':invalid'), function (el) { return el.name && el.required; })
                .map(function (el) {
                    var wrap = el.closest('.mb-3, .form-group');
                    var label = wrap && wrap.querySelector('label');
                    return (label ? label.textContent : el.name).replace(/\s+/g, ' ').trim();
                });
        }

        function markMissing(root) {
            var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            var nodes = [];
            while (walker.nextNode()) if (MISSING.test(walker.currentNode.nodeValue)) { nodes.push(walker.currentNode); MISSING.lastIndex = 0; }
            nodes.forEach(function (node) {
                if (node.parentElement && node.parentElement.closest('.no-print')) return;
                var frag = document.createDocumentFragment();
                node.nodeValue.split(MISSING).forEach(function (part, i) {
                    if (i % 2 === 0) { if (part) frag.appendChild(document.createTextNode(part)); return; }
                    var span = document.createElement('span');
                    span.className = 'lt-missing';
                    span.textContent = part.charAt(0) === '[' ? part : '______';
                    frag.appendChild(span);
                });
                node.parentNode.replaceChild(frag, node);
            });
        }

        function render() {
            if (!live) return;
            var top = view.scrollTop;
            view.scrollIntoView = function () {}; // the generator scrolls to its result; beside the form that would yank the page
            try { generate(form); } catch (e) { return; }
            form.style.display = '';
            view.style.display = 'block';
            Array.prototype.forEach.call(view.querySelectorAll('button'), function (b) {
                if (/back to edit/i.test(b.textContent)) b.style.display = 'none';
            });
            var heading = view.querySelector('.print-preview-header h3');
            if (heading) heading.textContent = 'The page as it will print';
            markMissing(view);
            var left = requiredLeft();
            var status = document.createElement('p');
            status.className = 'lt-status no-print' + (left.length ? '' : ' is-ready');
            status.textContent = left.length
                ? left.length + ' required field' + (left.length === 1 ? '' : 's') + ' left: ' + left.slice(0, 4).join(', ') + (left.length > 4 ? ', …' : '')
                : 'Every required field is in — ready to print.';
            view.insertBefore(status, view.firstChild);
            view.scrollTop = top;
        }

        function schedule() { if (timer) clearTimeout(timer); timer = setTimeout(render, 200); }

        function setLive(on) {
            live = on;
            container.classList.toggle('lt-live', on);
            if (submit) submit.textContent = on ? 'Print or save as PDF' : submitLabel;
            if (on) render();
        }

        form.addEventListener('input', schedule);
        form.addEventListener('change', schedule);
        // Test data, prefill and the remembered business set values without typing.
        var testBtn = document.getElementById('test-data-btn');
        if (testBtn) testBtn.addEventListener('click', function () { setTimeout(render, 50); });

        // Beside the form, the button's job is to print. The page's own handlers still validate
        // (and say what is missing); once they are done the form comes back and, if it is valid,
        // the print dialog opens.
        if (submit) submit.addEventListener('click', function () {
            if (!live) return;
            setTimeout(function () {
                render();
                if (form.checkValidity()) global.print();
            }, 0);
        });

        // Printing lays the page out at paper width, narrower than WIDE, so the query stops
        // matching for as long as the print preview is open (Chrome fires the change). Taking
        // that for a narrow screen hid the document mid-print and the preview came out blank.
        // While printing nothing here changes; the layout is judged again once the dialog closes.
        // On a narrow screen the document exists only after Generate, and nothing but the
        // document prints, so Cmd+P before Generate printed a blank sheet. Now printing makes
        // the document from the form as it stands, and afterwards the form comes back as it was.
        var printing = false;
        var madeForPrint = false;
        global.addEventListener('beforeprint', function () {
            printing = true;
            if (live || view.style.display === 'block') return;
            view.scrollIntoView = function () {};
            try { generate(form); } catch (e) { return; }
            markMissing(view);
            madeForPrint = true;
        });
        global.addEventListener('afterprint', function () {
            printing = false;
            if (madeForPrint) { madeForPrint = false; view.style.display = 'none'; form.style.display = ''; }
            onChange();
        });
        var onChange = function () {
            if (printing || global.matchMedia('print').matches) return;
            if (mq.matches === live) return;
            if (!mq.matches) { view.style.display = 'none'; form.style.display = ''; }
            setLive(mq.matches);
        };
        if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
        if (mq.matches) setTimeout(function () { setLive(true); }, 0);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window);
