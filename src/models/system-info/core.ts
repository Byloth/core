import RegExpMatcher from "../matchers/regexp-matcher.js";

import type { Browser, OperatingSystem, SystemHints } from "./types.js";

const _WindowsVersions = new Map<number, string>([
    [5, "2000"],
    [5.1, "XP (x86)"],
    [5.2, "XP (x64)"],
    [6, "Vista"],
    [6.1, "7"],
    [6.2, "8"],
    [6.3, "8.1"],
    [10, "10"]
]);

const _windowsVersion = (release: string, platformVersion?: string): string =>
{
    if (platformVersion !== undefined)
    {
        const major = Number.parseInt(platformVersion, 10);
        if (major >= 13) { return "11"; }
    }

    return _WindowsVersions.get(Number(release)) ?? `NT ${release}`;
};

const _chromium = (name: Browser["name"], version: string, context: Browser["context"] = "Browser"): Browser =>
    ({ name: name, version: version, engine: "Chromium", context: context });

const _webkit = (name: Browser["name"], version?: string): Browser =>
    ({ name: name, version: version, engine: "WebKit", context: "Browser" });

const _safariFamily = (userAgent: string): Browser => new RegExpMatcher<Browser>()
    .on(/CriOS\/([\d.]+)/i, (results): Browser => _webkit("Chrome for iOS", results[1]))
    .on(/EdgiOS\/([\d.]+)/i, (results): Browser => _webkit("Edge for iOS", results[1]))
    .on(/FxiOS\/([\d.]+)/i, (results): Browser => _webkit("Firefox for iOS", results[1]))
    .on(/Version\/([\d.]+)/i, (results): Browser => _webkit("Safari", results[1]))
    .default((): Browser => _webkit("Safari"))
    .match(userAgent);

/**
 * Recognizes the browser described by a user agent string.
 * Patterns are tested from the most specific to the most generic, since Chromium-based
 * browsers all declare `Chrome/` and WebKit-based ones all declare `Safari/`.
 *
 * ---
 *
 * @param userAgent The user agent string to parse.
 *
 * @returns The recognized {@link Browser}; empty when nothing is recognized.
 */
export function parseBrowser(userAgent: string): Browser
{
    return new RegExpMatcher<Browser>()
        .on(/Edg\/([\d.]+)/i, (results): Browser => _chromium("Edge", results[1]))
        .on(/OPR\/([\d.]+)/, (results): Browser => _chromium("Opera", results[1]))
        .on(/NWjs\/([\d.]+)/i, (results): Browser => _chromium("NW.js", results[1], "NW.js"))
        .on(/Chromium\/([\d.]+)/i, (results): Browser => _chromium("Chromium", results[1]))
        .on(/Chrome\/([\d.]+)/i, (results): Browser =>
            _chromium("Chrome", results[1], (/\bwv\)/.test(userAgent)) ? "WebView" : "Browser"))

        .on(/Firefox\/([\d.]+)/i, (results): Browser =>
            ({ name: "Firefox", version: results[1], engine: "Gecko", context: "Browser" }))

        .on(/Safari\//i, (): Browser => _safariFamily(userAgent))
        .on(/AppleWebKit\/[\d.]+.*Mobile\//i, (): Browser => ({ engine: "WebKit", context: "WebView" }))
        .on(/WebKit/i, (): Browser => ({ engine: "WebKit", context: "Browser" }))
        .default((): Browser => ({ }))
        .match(userAgent);
}

/**
 * Recognizes the operating system described by a user agent string.
 *
 * ---
 *
 * @param userAgent The user agent string to parse.
 * @param hints The {@link SystemHints} that refine what the user agent can't tell (Windows 11).
 *
 * @returns The recognized {@link OperatingSystem}; empty when nothing is recognized.
 */
export function parseOperatingSystem(userAgent: string, hints: SystemHints = { }): OperatingSystem
{
    return new RegExpMatcher<OperatingSystem>()
        .on(/Windows\s+NT\s+([\d.]+)/i, (results): OperatingSystem =>
            ({ name: "Windows", vendor: "Microsoft", version: _windowsVersion(results[1], hints.platformVersion) }))

        .on([/iPhone\s+OS\s+([\d._]+)/i, /iPad[^)]*OS\s+([\d._]+)/i], (results): OperatingSystem =>
            ({ name: "iOS", vendor: "Apple", version: results[1].replace(/_/g, ".") }))

        .on(/iPhone|iPod|iPad/i, (): OperatingSystem => ({ name: "iOS", vendor: "Apple" }))
        .on(/Android\s+([\d.]+)/i, (results): OperatingSystem =>
            ({ name: "Android", vendor: "Google", version: results[1] }))

        .on(/Android/i, (): OperatingSystem => ({ name: "Android", vendor: "Google" }))
        .on(/CrOS/, (): OperatingSystem => ({ name: "Chrome OS", vendor: "Google" }))
        .on(/Mac\s+OS\s+X\s+([\d._]+)/i, (results): OperatingSystem =>
            ({ name: "macOS", vendor: "Apple", version: results[1].replace(/_/g, ".") }))

        .on(/Macintosh|Mac\s+OS\s+X/i, (): OperatingSystem => ({ name: "macOS", vendor: "Apple" }))
        .on(/Linux|OpenBSD|FreeBSD|NetBSD/i, (): OperatingSystem => ({ name: "Linux" }))
        .default((): OperatingSystem => ({ }))
        .match(userAgent);
}
