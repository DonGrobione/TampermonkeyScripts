// ==UserScript==
// @name         Audi Guest WiFi Auto-Login
// @namespace    local.monzoon.autologin
// @version      1.5
// @description  Setzt automatisch den Nutzungsbestimmungs-Haken und meldet sich im Monzoon Gäste WLAN an
// @match        https://*.monzoon.net/*
// @match        http://*.monzoon.net/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/Audi/GuestWiFiAutologin.user.js
// @downloadURL  https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/Audi/GuestWiFiAutologin.user.js
// ==/UserScript==

(function () {
    'use strict';

    const LOG_PREFIX = '[Monzoon AutoLogin]';

    function log(message) {
        const timestamp = new Date().toISOString();
        console.log(`${LOG_PREFIX} ${timestamp} - ${message}`);
    }

    function fireEvents(element, types) {
        for (const type of types) {
            element.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
        }
    }

    function hasStatusMessage() {
        const text = (document.body.innerText || '').toLowerCase();

        return (
            text.includes('session already active') ||
            text.includes('could not find session')
        );
    }

    log(`Script started on ${window.location.href}`);

    if (window.__monzoonAutologinDone) {
        log('Already executed in this document.');
        return;
    }

    window.__monzoonAutologinDone = true;

    let attempts = 0;

    const timer = setInterval(function () {
        attempts++;

        // Elemente bei jedem Versuch frisch holen —
        // die neue Landingpage rendert/spät dynamisch.
        const checkbox = document.getElementById('accTOS');
        const connectButton = document.getElementById('connectBu');
        const loginForm = document.getElementById('loginform');

        if (!checkbox || !connectButton || !loginForm) {
            if (attempts >= 100) {
                log('Required elements not found. Giving up.');
                clearInterval(timer);
            }
            return;
        }

        if (hasStatusMessage()) {
            log('Status message detected. Stopping.');
            clearInterval(timer);
            return;
        }

        // TOS-Haken setzen und echte Events feuern,
        // damit eigene Listener der Seite (sofern intakt) reagieren.
        if (!checkbox.checked) {
            log('Checking TOS checkbox.');
            checkbox.checked = true;
            fireEvents(checkbox, ['input', 'change']);
            log('Checkbox checked programmatically.');
        }

        // Originale Monzoon-Funktion ausführen — in eigenem try/catch,
        // damit ihr interner Fehler (null-Element auf neuer Seite)
        // den Ablauf nicht mehr abbricht.
        if (typeof toggleTOS === 'function') {
            try {
                toggleTOS();
                log('toggleTOS() executed.');
            } catch (e) {
                log(`toggleTOS() failed (${e.message}) — force-enabling button.`);
            }
        }

        // Seitenlogik nicht länger vertrauen: Button selbst freischalten.
        if (connectButton.disabled) {
            connectButton.disabled = false;
            connectButton.removeAttribute('disabled');
            log('Button force-enabled.');
        }

        log(`Attempt ${attempts}: button.disabled=${connectButton.disabled}`);

        if (!connectButton.disabled) {
            clearInterval(timer);

            connectButton.click();
            log('Click sent.');

            // Fallback: Formular direkt absenden, falls click()
            // von der Seite blockiert oder nicht gebunden ist.
            setTimeout(function () {
                if (document.body && loginForm.isConnected) {
                    try {
                        HTMLFormElement.prototype.submit.call(loginForm);
                        log('Fallback form submit executed.');
                    } catch (e) {
                        log(`Fallback form submit failed: ${e.message}`);
                    }
                }
            }, 750);

            return;
        }

        if (attempts >= 100) {
            log('Timeout reached after 10 seconds.');
            clearInterval(timer);
        }

    }, 100);

})();
