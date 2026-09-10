import { afterEach, describe, expect, it, vi } from "vitest";

import { EnvironmentException } from "../../../src/index.js";
import { SystemInfo } from "../../../src/index.js";

import type { Browser, OperatingSystem, SystemHints } from "../../../src/index.js";

/* eslint-disable @stylistic/max-len */
const UserAgents = {
    chromeWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    edgeWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    operaWindows: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    firefoxLinux: "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    safariMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    safariIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    chromeIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
    firefoxIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15",
    edgeIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/120.0.2210.126 Mobile/15E148 Safari/604.1",
    webViewIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    chromeAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    webViewAndroid: "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36",
    androidBrowser: "Mozilla/5.0 (Linux; U; Android 4.3; en-us; GT-I9300 Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
    chromiumLinux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/120.0.0.0 Chrome/120.0.0.0 Safari/537.36",
    nwjsWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NWjs/0.83.0",
    chromeOs: "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    unknown: "curl/8.4.0"
};
/* eslint-enable @stylistic/max-len */

interface Case
{
    userAgent: string;
    hints?: SystemHints;
    browser: Browser;
    operatingSystem: OperatingSystem;
}
const Cases: Record<string, Case> = {
    "Chrome on Windows 10": {
        userAgent: UserAgents.chromeWindows,
        browser: { name: "Chrome", version: "120.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Windows", vendor: "Microsoft", version: "10" }
    },
    "Edge on Windows 10": {
        userAgent: UserAgents.edgeWindows,
        browser: { name: "Edge", version: "120.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Windows", vendor: "Microsoft", version: "10" }
    },
    "Opera on Windows 7": {
        userAgent: UserAgents.operaWindows,
        browser: { name: "Opera", version: "106.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Windows", vendor: "Microsoft", version: "7" }
    },
    "Firefox on Linux": {
        userAgent: UserAgents.firefoxLinux,
        browser: { name: "Firefox", version: "121.0", engine: "Gecko", context: "Browser" },
        operatingSystem: { name: "Linux" }
    },
    "Safari on macOS": {
        userAgent: UserAgents.safariMac,
        browser: { name: "Safari", version: "17.1", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "macOS", vendor: "Apple", version: "10.15.7" }
    },
    "Safari on iOS": {
        userAgent: UserAgents.safariIos,
        browser: { name: "Safari", version: "17.1", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "iOS", vendor: "Apple", version: "17.1" }
    },
    "Chrome on iOS": {
        userAgent: UserAgents.chromeIos,
        browser: { name: "Chrome for iOS", version: "120.0.6099.119", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "iOS", vendor: "Apple", version: "17.1" }
    },
    "Firefox on iOS": {
        userAgent: UserAgents.firefoxIos,
        browser: { name: "Firefox for iOS", version: "120.0", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "iOS", vendor: "Apple", version: "17.1" }
    },
    "Edge on iOS": {
        userAgent: UserAgents.edgeIos,
        browser: { name: "Edge for iOS", version: "120.0.2210.126", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "iOS", vendor: "Apple", version: "17.1" }
    },
    "WebView on iOS": {
        userAgent: UserAgents.webViewIos,
        browser: { engine: "WebKit", context: "WebView" },
        operatingSystem: { name: "iOS", vendor: "Apple", version: "17.1" }
    },
    "Chrome on Android": {
        userAgent: UserAgents.chromeAndroid,
        browser: { name: "Chrome", version: "120.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Android", vendor: "Google", version: "14" }
    },
    "WebView on Android": {
        userAgent: UserAgents.webViewAndroid,
        browser: { name: "Chrome", version: "120.0.0.0", engine: "Chromium", context: "WebView" },
        operatingSystem: { name: "Android", vendor: "Google", version: "14" }
    },
    "Android Browser": {
        userAgent: UserAgents.androidBrowser,
        browser: { name: "Android Browser", version: "4.0", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "Android", vendor: "Google", version: "4.3" }
    },
    "Chromium on Linux": {
        userAgent: UserAgents.chromiumLinux,
        browser: { name: "Chromium", version: "120.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Linux" }
    },
    "NW.js on Windows": {
        userAgent: UserAgents.nwjsWindows,
        browser: { name: "NW.js", version: "0.83.0", engine: "Chromium", context: "NW.js" },
        operatingSystem: { name: "Windows", vendor: "Microsoft", version: "10" }
    },
    "Chrome on Chrome OS": {
        userAgent: UserAgents.chromeOs,
        browser: { name: "Chrome", version: "120.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Chrome OS", vendor: "Google" }
    },
    "iPad with a desktop user agent": {
        userAgent: UserAgents.safariMac,
        hints: { maxTouchPoints: 5 },
        browser: { name: "Safari", version: "17.1", engine: "WebKit", context: "Browser" },
        operatingSystem: { name: "iOS", vendor: "Apple", version: "17.1" }
    },
    "Windows 11 through the platform version hint": {
        userAgent: UserAgents.chromeWindows,
        hints: { platformVersion: "15.0.0" },
        browser: { name: "Chrome", version: "120.0.0.0", engine: "Chromium", context: "Browser" },
        operatingSystem: { name: "Windows", vendor: "Microsoft", version: "11" }
    },
    "Installed web application": {
        userAgent: UserAgents.chromeAndroid,
        hints: { standalone: true },
        browser: { name: "Chrome", version: "120.0.0.0", engine: "Chromium", context: "WebApp" },
        operatingSystem: { name: "Android", vendor: "Google", version: "14" }
    },
    "NW.js is never an installed web application": {
        userAgent: UserAgents.nwjsWindows,
        hints: { standalone: true },
        browser: { name: "NW.js", version: "0.83.0", engine: "Chromium", context: "NW.js" },
        operatingSystem: { name: "Windows", vendor: "Microsoft", version: "10" }
    },
    "Unknown user agent": {
        userAgent: UserAgents.unknown,
        browser: { },
        operatingSystem: { }
    }
};

describe("SystemInfo", () =>
{
    afterEach(() => { vi.unstubAllGlobals(); });

    describe("Parse", () =>
    {
        for (const [title, { userAgent, hints, browser, operatingSystem }] of Object.entries(Cases))
        {
            it(`Should recognize: ${title}`, () =>
            {
                const systemInfo = SystemInfo.Parse(userAgent, hints);

                expect(systemInfo.userAgent).toBe(userAgent);
                expect(systemInfo.browser).toEqual(browser);
                expect(systemInfo.operatingSystem).toEqual(operatingSystem);
            });
        }

        it("Should not read anything from the environment", () =>
        {
            vi.stubGlobal("navigator", undefined);

            const systemInfo = SystemInfo.Parse(UserAgents.firefoxLinux);

            expect(systemInfo.browser.name).toBe("Firefox");
        });
    });

    describe("Detect", () =>
    {
        it("Should detect the environment from `navigator` and the display mode", () =>
        {
            vi.stubGlobal("navigator", { userAgent: UserAgents.safariMac, maxTouchPoints: 5 });
            vi.stubGlobal("matchMedia", () => ({ matches: true }));

            const systemInfo = SystemInfo.Detect();

            expect(systemInfo.browser)
                .toEqual({ name: "Safari", version: "17.1", engine: "WebKit", context: "WebApp" });
            expect(systemInfo.operatingSystem).toEqual({ name: "iOS", vendor: "Apple", version: "17.1" });
        });
        it("Should work without `matchMedia`", () =>
        {
            vi.stubGlobal("navigator", { userAgent: UserAgents.chromeWindows, maxTouchPoints: 0 });
            vi.stubGlobal("matchMedia", undefined);

            const systemInfo = SystemInfo.Detect();

            expect(systemInfo.browser.context).toBe("Browser");
        });

        it("Should throw `EnvironmentException` when `navigator` is missing", () =>
        {
            vi.stubGlobal("navigator", undefined);

            expect(() => SystemInfo.Detect())
                .toThrow(EnvironmentException);
        });
    });

    describe("Current", () =>
    {
        it("Should detect the environment once and cache it", () =>
        {
            vi.stubGlobal("navigator", { userAgent: UserAgents.firefoxLinux, maxTouchPoints: 0 });
            vi.stubGlobal("matchMedia", undefined);

            const first = SystemInfo.Current;

            vi.stubGlobal("navigator", { userAgent: UserAgents.chromeWindows, maxTouchPoints: 0 });

            const second = SystemInfo.Current;

            expect(second).toBe(first);
            expect(second.browser.name).toBe("Firefox");
        });
    });
});
