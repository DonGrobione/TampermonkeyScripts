// ==UserScript==
// @name         Monzoon Audi Gäste WLAN Auto-Login
// @namespace    local.monzoon.autologin
// @version      1.1
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

    var cb  = document.getElementById('accTOS');
    var btn = document.getElementById('connectBu');

    // Nur auf der Login-Seite ausführen
    if (!cb || !btn || !document.getElementById('loginform')) {
        return;
    }

    // Doppelte Ausführung verhindern
    if (window.__monzoonAutologinDone) {
        return;
    }
    window.__monzoonAutologinDone = true;

    // .click() löst toggleTOS() aus und aktiviert VERBINDEN
    if (!cb.checked) {
        cb.click();
    }

    // Nach dem Aktivieren des Hakens kurz warten, bevor der Button geprüft wird
    var tosDelay = 600;
    var attempts = 0;
    setTimeout(function () {
        var timer = setInterval(function () {
            if (!btn.disabled) {
                clearInterval(timer);
                btn.click();
            } else if (++attempts > 20) {
                clearInterval(timer);
            }
        }, 250);
    }, tosDelay);
})();