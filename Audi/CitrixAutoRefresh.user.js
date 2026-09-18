// ==UserScript==
// @name         Audi Citrix Auto Refresh
// @namespace    https://rgrsawin.audi.de/
// @version      1.4.0
// @description  Führt regelmäßig einen Refresh in Citrix Workspace aus und bestätigt den Dialog "Aktualisieren" automatisch.
// @match        https://rgrsawin.audi.de/Citrix/RGRSAWinInternetWeb/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/Audi/CitrixAutoRefresh.user.js
// @downloadURL  https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/Audi/CitrixAutoRefresh.user.js
// ==/UserScript==

(function () {
    'use strict';

    const REFRESH_INTERVAL_MINUTES = 3;
    const REFRESH_INTERVAL_MILLISECONDS =
        REFRESH_INTERVAL_MINUTES * 60 * 1000;

    function ClickUpdateDialog() {

        try {

            const updateButton = Array.from(
                document.querySelectorAll('a.dialog.button.default')
            ).find(
                element => element.textContent.trim() === 'Aktualisieren'
            );

            if (!updateButton) {
                return false;
            }

            console.log(
                `[Citrix Auto Refresh] Clicking "Aktualisieren" dialog at ${new Date().toLocaleString('de-DE')}`
            );

            updateButton.click();

            return true;

        }
        catch (error) {

            console.error(
                '[Citrix Auto Refresh] Error while clicking update dialog:',
                error
            );

            return false;

        }
    }

    function InvokeRefresh() {

        try {

            // Zuerst prüfen, ob bereits ein Aktualisieren-Dialog offen ist
            if (ClickUpdateDialog()) {
                return;
            }

            const refreshButton = document.querySelector(
                '.refresh-button'
            );

            if (!refreshButton) {

                console.warn(
                    '[Citrix Auto Refresh] Refresh button not found'
                );

                return;
            }

            console.log(
                `[Citrix Auto Refresh] Clicking refresh button at ${new Date().toLocaleString('de-DE')}`
            );

            refreshButton.click();

        }
        catch (error) {

            console.error(
                '[Citrix Auto Refresh] Error:',
                error
            );

        }
    }

    console.log(
        '[Citrix Auto Refresh] Started'
    );

    // Überwacht die Seite auf neu erscheinende Dialoge
    const mutationObserver = new MutationObserver(() => {

        ClickUpdateDialog();

    });

    mutationObserver.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

    // Erste Prüfung nach dem Laden
    setTimeout(
        InvokeRefresh,
        10000
    );

    // Regelmäßiger Refresh
    setInterval(
        InvokeRefresh,
        REFRESH_INTERVAL_MILLISECONDS
    );

})();