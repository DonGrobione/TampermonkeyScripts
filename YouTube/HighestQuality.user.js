// ==UserScript==
// @name         YouTube Highest Quality
// @namespace    local.youtube.highestquality
// @version      1.1
// @description  Wählt automatisch die höchste verfügbare Videoqualität auf YouTube
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://www.youtube-nocookie.com/embed/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/YouTube/HighestQuality.user.js
// @downloadURL  https://github.com/DonGrobione/TampermonkeyScripts/raw/refs/heads/main/YouTube/HighestQuality.user.js
// ==/UserScript==

(function () {
    'use strict';

    const LOG_PREFIX = '[YT HighestQuality]';

    // Rangfolge von hoch nach niedrig — Fallback, falls die Player-API
    // die Liste einmal nicht sortiert liefert.
    const QUALITY_ORDER = [
        'highres', 'hd2880', 'hd2160', 'hd1440', 'hd1080',
        'hd720', 'large', 'medium', 'small', 'tiny'
    ];

    function log(message) {
        const timestamp = new Date().toISOString();
        console.log(`${LOG_PREFIX} ${timestamp} - ${message}`);
    }

    function getPlayer() {
        const player = document.getElementById('movie_player');
        if (!player || typeof player.getAvailableQualityLevels !== 'function') {
            return null;
        }
        return player;
    }

    function pickHighest(levels) {
        const known = levels.filter(q => QUALITY_ORDER.includes(q));
        if (known.length === 0) {
            return null;
        }
        return known.sort((a, b) => QUALITY_ORDER.indexOf(a) - QUALITY_ORDER.indexOf(b))[0];
    }

    // Sucht die "Premium"-Variante (erhöhte Bitrate) zur gewählten Qualität.
    // Nur verfügbar mit YouTube Premium — sonst ist isPlayable false.
    function findPremiumFormat(player, quality) {
        if (typeof player.getAvailableQualityData !== 'function') {
            return null;
        }
        const data = player.getAvailableQualityData() || [];
        return data.find(d =>
            d.quality === quality &&
            d.isPlayable &&
            d.formatId &&
            /premium$/i.test((d.qualityLabel || '').trim())
        ) || null;
    }

    let lastAppliedKey = null;

    function applyHighestQuality() {
        const player = getPlayer();
        if (!player) {
            return false;
        }

        // Während Werbung liefert der Player die Qualitätsstufen der Anzeige —
        // erst nach der Werbung setzen.
        if (player.classList.contains('ad-showing')) {
            return false;
        }

        const levels = player.getAvailableQualityLevels() || [];
        const best = pickHighest(levels);
        if (!best) {
            return false;
        }

        const videoId = (player.getVideoData && player.getVideoData().video_id) || location.href;
        const current = player.getPlaybackQuality && player.getPlaybackQuality();
        const premium = findPremiumFormat(player, best);
        const key = `${videoId}|${best}|${premium ? premium.formatId : ''}`;

        if (key === lastAppliedKey && current === best) {
            return true;
        }

        if (premium && typeof player.setPlaybackQualityRange === 'function') {
            // Dritter Parameter wählt das konkrete Format (Premium-Bitrate).
            player.setPlaybackQualityRange(best, best, premium.formatId);
        } else {
            if (typeof player.setPlaybackQualityRange === 'function') {
                player.setPlaybackQualityRange(best, best);
            }
            if (typeof player.setPlaybackQuality === 'function') {
                player.setPlaybackQuality(best);
            }
        }

        lastAppliedKey = key;
        const label = premium ? `${best} (${premium.qualityLabel})` : best;
        log(`Video ${videoId}: set quality to ${label} (was ${current}, available: ${levels.join(', ')})`);
        return true;
    }

    // Qualitätsstufen stehen erst kurz nach dem Laden des Videos bereit,
    // daher einige Sekunden lang wiederholt versuchen.
    let retryTimer = null;

    function scheduleApply() {
        clearInterval(retryTimer);
        let attempts = 0;

        retryTimer = setInterval(function () {
            attempts++;
            if (applyHighestQuality() || attempts >= 40) {
                clearInterval(retryTimer);
            }
        }, 250);
    }

    let hookedPlayer = null;

    function hookPlayer() {
        const player = getPlayer();
        if (!player || player === hookedPlayer) {
            return;
        }
        hookedPlayer = player;

        // Bei jedem Wechsel auf "läuft" (1) oder "gepuffert" (5) erneut prüfen —
        // fängt neue Videos in Playlisten und das Ende von Werbung ab.
        player.addEventListener('onStateChange', function (state) {
            if (state === 1 || state === 5) {
                applyHighestQuality();
            }
        });

        log('Player hooked.');
    }

    function onNavigate() {
        hookPlayer();
        scheduleApply();
    }

    // YouTube ist eine SPA — Seitenwechsel lösen kein neues Laden des Skripts aus.
    document.addEventListener('yt-navigate-finish', onNavigate);
    document.addEventListener('yt-player-updated', onNavigate);
    window.addEventListener('state-navigateend', onNavigate); // m.youtube.com

    log(`Script started on ${location.href}`);
    onNavigate();

})();
