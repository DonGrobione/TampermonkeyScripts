// ==UserScript==
// @name         Audi Guest WiFi Auto-Login
// @namespace    local.monzoon.autologin
// @version      1.5.1
// @description  Automatically ticks the terms-of-service checkbox and logs in to the Monzoon guest WiFi
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

        // Look up the elements fresh on every attempt —
        // the new landing page renders late/dynamically.
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

        // Tick the TOS checkbox and fire real events
        // so the page's own listeners (if intact) react.
        if (!checkbox.checked) {
            log('Checking TOS checkbox.');
            checkbox.checked = true;
            fireEvents(checkbox, ['input', 'change']);
            log('Checkbox checked programmatically.');
        }

        // Run the original Monzoon function — in its own try/catch,
        // so its internal error (null element on the new page)
        // no longer aborts the flow.
        if (typeof toggleTOS === 'function') {
            try {
                toggleTOS();
                log('toggleTOS() executed.');
            } catch (e) {
                log(`toggleTOS() failed (${e.message}) — force-enabling button.`);
            }
        }

        // Stop relying on the page logic: enable the button ourselves.
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

            // Fallback: submit the form directly in case click()
            // is blocked by the page or not bound.
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
