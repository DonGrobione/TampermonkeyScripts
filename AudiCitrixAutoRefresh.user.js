// ==UserScript==
// @name         Audi Citrix Auto Refresh
// @namespace    https://rgrsawin.audi.de/
// @version      1.1
// @description  Klickt automatisch auf den Citrix-Timeout-Dialog "Aktualisieren".
// @author       Helge Koenig
// @match        https://rgrsawin.audi.de/Citrix/RGRSAWinInternetWeb/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/AudiCitrixAutoRefresh.user.js
// @downloadURL  https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/AudiCitrixAutoRefresh.user.js
// ==/UserScript==

(function () {
    'use strict';

    const CHECK_INTERVAL_MILLISECONDS = 5000;

    function GetRefreshButton() {
        return Array.from(
            document.querySelectorAll('a.dialog.button')
        ).find(
            button =>
                button.textContent.trim().toLowerCase() === 'aktualisieren'
        );
    }

    function IsElementVisible(element) {
        if (!element) {
            return false;
        }

        const computedStyle = window.getComputedStyle(element);

        return (
            computedStyle.display !== 'none' &&
            computedStyle.visibility !== 'hidden' &&
            computedStyle.opacity !== '0'
        );
    }

    function ClickRefreshButton() {
        try {
            const refreshButton = GetRefreshButton();

            if (!refreshButton) {
                return;
            }

            const popup = refreshButton.closest('#genericMessageBoxPopup');

            if (popup && !IsElementVisible(popup)) {
                return;
            }

            console.log(
                `[Citrix Auto Refresh] Refresh clicked: ${new Date().toISOString()}`
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

    function StartMonitoring() {
        console.log(
            '[Citrix Auto Refresh] Monitoring started'
        );

        setInterval(
            ClickRefreshButton,
            CHECK_INTERVAL_MILLISECONDS
        );
    }

    StartMonitoring();
})();
