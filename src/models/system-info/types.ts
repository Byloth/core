// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SystemInfo from "./index.js";

/**
 * The name of a browser recognized by {@link SystemInfo}.
 */
export type BrowserName = "Chrome" |
    "Edge" |
    "Opera" |
    "Chromium" |
    "NW.js" |
    "Firefox" |
    "Safari" |
    "Chrome for iOS" |
    "Edge for iOS" |
    "Firefox for iOS" |
    "Android Browser";

/**
 * The rendering engine of a browser recognized by {@link SystemInfo}.
 */
export type BrowserEngine = "Chromium" | "Gecko" | "WebKit";

/**
 * The context a page runs in, as recognized by {@link SystemInfo}:
 * a regular browser tab, an installed web application, an embedded web view or NW.js.
 */
export type BrowserContext = "Browser" | "WebApp" | "WebView" | "NW.js";

/**
 * The browser detected by {@link SystemInfo}.
 * Every property is `undefined` when the corresponding information couldn't be recognized.
 *
 * ---
 *
 * @example
 * ```ts
 * const browser: Browser = { name: "Firefox", version: "121.0", engine: "Gecko", context: "Browser" };
 * ```
 */
export interface Browser
{
    /**
     * The name of the browser.
     */
    readonly name?: BrowserName;

    /**
     * The version of the browser, as declared by the user agent.
     */
    readonly version?: string;

    /**
     * The rendering engine of the browser.
     */
    readonly engine?: BrowserEngine;

    /**
     * The context the page runs in.
     */
    readonly context?: BrowserContext;
}

/**
 * The name of an operating system recognized by {@link SystemInfo}.
 */
export type OperatingSystemName = "Windows" | "macOS" | "iOS" | "Android" | "Linux" | "Chrome OS";

/**
 * The vendor of an operating system recognized by {@link SystemInfo}.
 */
export type OperatingSystemVendor = "Microsoft" | "Apple" | "Google";

/**
 * The operating system detected by {@link SystemInfo}.
 * Every property is `undefined` when the corresponding information couldn't be recognized.
 *
 * ---
 *
 * @example
 * ```ts
 * const operatingSystem: OperatingSystem = { name: "Windows", vendor: "Microsoft", version: "11" };
 * ```
 */
export interface OperatingSystem
{
    /**
     * The name of the operating system.
     */
    readonly name?: OperatingSystemName;

    /**
     * The vendor of the operating system.
     */
    readonly vendor?: OperatingSystemVendor;

    /**
     * The version of the operating system: the marketing one for Windows (`"10"`, `"11"`),
     * the numeric one elsewhere (`"14.1"`).
     */
    readonly version?: string;
}

/**
 * The information a user agent string can't carry, gathered from the environment
 * by {@link SystemInfo.Detect} or provided explicitly to {@link SystemInfo.Parse}.
 *
 * ---
 *
 * @example
 * ```ts
 * const hints: SystemHints = { standalone: true, maxTouchPoints: 5 };
 * ```
 */
export interface SystemHints
{
    /**
     * Whether the page is displayed as an installed web application (`display-mode: standalone`).
     * When `true`, the browser context becomes `"WebApp"`.
     */
    readonly standalone?: boolean;

    /**
     * The number of simultaneous touch points supported by the device.
     * More than `2` on a device presenting itself as macOS reveals an iPad using a desktop user agent.
     */
    readonly maxTouchPoints?: number;

    /**
     * The `platformVersion` high-entropy value of the User-Agent Client Hints.
     * It's the only way to tell Windows 11 apart, since its user agent is frozen at `Windows NT 10.0`:
     * a major version of `13` or more means Windows 11.
     */
    readonly platformVersion?: string;
}
