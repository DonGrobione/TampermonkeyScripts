// ==UserScript==
// @name         Audi Citrix Auto Refresh
// @namespace    https://rgrsawin.audi.de/
// @version      1.2
// @description  Führt regelmäßig einen Refresh in Citrix Workspace aus.
// @match        https://rgrsawin.audi.de/Citrix/RGRSAWinInternetWeb/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/AudiCitrixAutoRefresh.user.js
// @downloadURL  https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/AudiCitrixAutoRefresh.user.js
// ==/UserScript==

(function () {
    'use strict';

    const REFRESH_INTERVAL_MINUTES = 3;
    const REFRESH_INTERVAL_MILLISECONDS =
        REFRESH_INTERVAL_MINUTES * 60 * 1000;

    function InvokeRefresh() {

        try {

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
                `[Citrix Auto Refresh] Refresh executed at ${new Date().toISOString()}`
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

    // Erster Refresh nach 10 Sekunden
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
