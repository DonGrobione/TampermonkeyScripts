// ==UserScript==
// @name         Audi Guest WiFi Auto-Login
// @namespace    local.monzoon.autologin
// @version      1.4.2
// @description  Setzt automatisch den Nutzungsbestätigungs-Haken und meldet sich im Monzoon Gäste WLAN an
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

    function hasStatusMessage() {
        const text = (document.body.innerText || '').toLowerCase();

        return (
            text.includes('session already active') ||
            text.includes('could not find session')
        );
    }

    const checkbox = document.getElementById('accTOS');
    const connectButton = document.getElementById('connectBu');
    const loginForm = document.getElementById('loginform');

    log(`Script started on ${window.location.href}`);

    if (!checkbox || !connectButton || !loginForm) {
        log('Required elements not found. Exiting.');
        return;
    }

    if (hasStatusMessage()) {
        log('Status message detected. Exiting.');
        return;
    }

    if (window.__monzoonAutologinDone) {
        log('Already executed in this document.');
        return;
    }

    window.__monzoonAutologinDone = true;

    log(`Initial checkbox state: ${checkbox.checked}`);
    log(`Initial button disabled: ${connectButton.disabled}`);

    try {
        //
        // TOS akzeptieren
        //
        checkbox.checked = true;
        log('Checkbox checked programmatically.');

        //
        // Originale Monzoon-Funktion ausführen
        //
        if (typeof toggleTOS === 'function') {
            toggleTOS();
            log('toggleTOS() executed.');
        } else {
            log('toggleTOS() not found.');
        }

        log(`Button disabled after toggleTOS(): ${connectButton.disabled}`);

        //
        // Sofort prüfen, ob der Button freigegeben wurde
        //
        let attempts = 0;

        const timer = setInterval(function () {

            attempts++;

            log(
                `Attempt ${attempts}: ` +
                `button.disabled=${connectButton.disabled}`
            );

            if (hasStatusMessage()) {
                log('Status message appeared. Stopping.');
                clearInterval(timer);
                return;
            }

            if (!connectButton.disabled) {
                log('Button enabled. Clicking now.');

                clearInterval(timer);

                connectButton.click();

                log('Click sent.');
                return;
            }

            if (attempts >= 100) {
                log('Timeout reached after 10 seconds.');
                clearInterval(timer);
            }

        }, 100);

    } catch (error) {
        console.error(`${LOG_PREFIX} ERROR`, error);
    }

})();