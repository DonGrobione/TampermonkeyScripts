// ==UserScript==
// @name         YouTube Highest Quality
// @namespace    local.youtube.highestquality
// @version      1.1.1
// @description  Automatically selects the highest available video quality on YouTube
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

    // Ranking from highest to lowest — fallback in case the player API
    // ever returns the list unsorted.
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

    // Finds the "Premium" variant (enhanced bitrate) of the chosen quality.
    // Only available with YouTube Premium — otherwise isPlayable is false.
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

        // During ads the player reports the ad's quality levels —
        // only apply once the ad is over.
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
            // The third parameter selects the specific format (Premium bitrate).
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

    // Quality levels only become available shortly after the video loads,
    // so keep retrying for a few seconds.
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

        // Re-check on every change to "playing" (1) or "cued" (5) —
        // catches new videos in playlists and the end of ads.
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

    // YouTube is an SPA — page changes don't reload the script.
    document.addEventListener('yt-navigate-finish', onNavigate);
    document.addEventListener('yt-player-updated', onNavigate);
    window.addEventListener('state-navigateend', onNavigate); // m.youtube.com

    log(`Script started on ${location.href}`);
    onNavigate();

})();
