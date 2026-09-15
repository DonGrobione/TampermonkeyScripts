// ==UserScript==
// @name         Monzoon Audi Gäste WLAN Auto-Login
// @namespace    local.monzoon.autologin
// @version      1.3
// @description  Setzt automatisch den Nutzungsbestätigungs-Haken und meldet sich im Monzoon Gäste WLAN an
// @match        https://*.monzoon.net/*
// @match        http://*.monzoon.net/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/monzoon-autologin.user.js
// @downloadURL  https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/monzoon-autologin.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Statusmeldungen, bei denen kein Login möglich ist
    var STATUS_MESSAGES = ['session already active', 'could not find session'];

    function hasStatusMessage() {
        var text = (document.body.innerText || '').toLowerCase();
        for (var i = 0; i < STATUS_MESSAGES.length; i++) {
            if (text.indexOf(STATUS_MESSAGES[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    var cb  = document.getElementById('accTOS');
    var btn = document.getElementById('connectBu');

    // Nur auf der Login-Seite ausführen
    if (!cb || !btn || !document.getElementById('loginform')) {
        return;
    }

    // Bei Statusmeldungen, die kein Login benötigen, abbrechen.
    // sessionStorage verhindert auch bei Reloads der Portalseite eine Endlosschleife.
    if (hasStatusMessage()) {
        try {
            sessionStorage.setItem('monzoonSkip', '1');
        } catch (e) { /* sessionStorage evtl. blockiert */ }
        return;
    }

    // Wurde eine Statusmeldung bereits in dieser Browser-Session gesehen?
    // Dann dieses Mal endgültig nichts mehr tun (Schleifenschutz).
    var skipped;
    try {
        skipped = sessionStorage.getItem('monzoonSkip') === '1';
    } catch (e) {
        skipped = false;
    }
    if (skipped) {
        return;
    }

    // Doppelte Ausführung im selben Dokument verhindern
    if (window.__monzoonAutologinDone) {
        return;
    }
    window.__monzoonAutologinDone = true;

    // TOS-Haken setzen (falls nicht bereits gesetzt)
    if (!cb.checked) {
        cb.click();
    }

    // Auf die Button-Freigabe warten: erst klicken, wenn nicht mehr ausgegraut
    var tosDelay = 600;
    var attempts = 0;
    setTimeout(function () {
        var timer = setInterval(function () {
            // Zwischenzeitlich aufgetauchte Statusmeldung? Dann.Stop.
            if (hasStatusMessage()) {
                clearInterval(timer);
                try {
                    sessionStorage.setItem('monzoonSkip', '1');
                } catch (e) {}
                return;
            }

            if (!btn.disabled) {
                // Button ist freigegeben -> jetzt klicken
                clearInterval(timer);
                btn.click();
            } else if (++attempts > 20) {
                // Button bleibt ausgegraut -> aufgeben
                clearInterval(timer);
            }
        }, 250);
    }, tosDelay);
})();