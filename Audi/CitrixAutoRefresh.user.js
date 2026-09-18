// ==UserScript==
// @name         Audi Citrix Auto Refresh
// @namespace    https://rgrsawin.audi.de/
// @version      1.3.1
// @description  Führt regelmäßig einen Refresh in Citrix Workspace aus.
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
                `[Citrix Auto Refresh] Clicking refresh button at ${new Date().toLocaleString('de-DE')}`
            );

            refreshButton.dispatchEvent(
                new MouseEvent(
                    'click',
                    {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }
                )
            );

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

    setTimeout(
        InvokeRefresh,
        10000
    );

    setInterval(
        InvokeRefresh,
        REFRESH_INTERVAL_MILLISECONDS
    );

})();