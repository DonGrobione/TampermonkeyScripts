# Tampermonkey Scripts

A collection of my [Tampermonkey](https://www.tampermonkey.net/) userscripts.

## Scripts

| Script | Purpose | Install |
|---|---|---|
| [monzoon-autologin.user.js](monzoon-autologin.user.js) | Automatically accepts the TOS checkbox and submits the login form on the Monzoon guest WiFi captive portal (deployed at Audi sites) | [Install](https://github.com/DonGrobione/TapermonkeyScripts/raw/refs/heads/main/monzoon-autologin.user.js) |

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Click the *Install* link in the table above. Tampermonkey opens its installation page.
3. Confirm the installation.

The script keeps itself up to date automatically via the `@updateURL`/`@downloadURL` metadata directives, as long as the repository stays public.

### monzoon-autologin

When your machine connects to the guest WiFi, the captive portal page opens (usually triggered automatically by the OS or browser). The script then:

- ticks the TOS acceptance checkbox,
- waits until the connect button is enabled,
- clicks it to log in.

Notes:

- The captive portal page must open in a browser with Tampermonkey installed. On Windows, the automatic portal detection opens Edge; make sure the userscript is installed there or open the portal page manually in your preferred browser.
- By using this script, you automatically accept the provider's terms of service on every connection.
- The wireless transmission in this guest network is unencrypted (see the portal's TOS, section 3.1). Using a VPN is recommended regardless of this script.

## Updating

Scripts update themselves through Tampermonkey whenever the version number in this repository increases. To check for updates manually, open the Tampermonkey dashboard → *Utilities* → *Check for userscripts updates*.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0). See [License.md](License.md) for the full license text.

## AI Usage

Parts of this project were created with the support of AI tooling.