import type { Mutable } from "../../core/types.js";
import { isBrowser } from "../../helpers.js";

import { EnvironmentException } from "../exceptions/index.js";

import { parseBrowser, parseOperatingSystem } from "./core.js";
import type { Browser, OperatingSystem, SystemHints } from "./types.js";

/**
 * The browser and the operating system a page runs on, recognized from the user agent string
 * and refined with what the environment can add to it.
 *
 * Recognition is heuristic by nature: user agents lie, get frozen and change over time.
 * Every property that couldn't be recognized is left `undefined` rather than guessed.
 *
 * Also note that:
 * - Windows 11 can't be told apart from Windows 10 by the user agent alone. See {@link SystemHints}.
 * - {@link SystemInfo.Current} is computed once, on first access, so importing this module has no cost.
 *
 * ---
 *
 * @example
 * ```ts
 * const { browser, operatingSystem } = SystemInfo.Current;
 *
 * if (browser.name === "Firefox") { [...] }
 * if (operatingSystem.name === "iOS") { [...] }
 * ```
 */
export default class SystemInfo
{
    private static _Current?: SystemInfo;

    /**
     * The {@link SystemInfo} of the current environment, detected on first access and then cached.
     * See {@link SystemInfo.Detect}.
     */
    public static get Current(): SystemInfo
    {
        SystemInfo._Current ??= SystemInfo.Detect();
        return SystemInfo._Current;
    }

    /**
     * Detects the browser and the operating system of the current environment,
     * from `navigator.userAgent` and the hints the environment provides:
     * the display mode of the page (browsers only) and the number of touch points.
     *
     * Also note that:
     * - It cannot be used outside of an environment that exposes `navigator`
     *   (browsers and Web Workers) or an {@link EnvironmentException} is thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * const systemInfo = SystemInfo.Detect();
     * ```
     *
     * ---
     *
     * @returns A new {@link SystemInfo} instance describing the current environment.
     */
    public static Detect(): SystemInfo
    {
        if (typeof navigator === "undefined")
        {
            throw new EnvironmentException(
                "The `SystemInfo` class can only detect an environment that exposes the `navigator` object."
            );
        }

        const hints: SystemHints = {
            standalone: isBrowser && (typeof window.matchMedia === "function") &&
                window.matchMedia("(display-mode: standalone)").matches,

            maxTouchPoints: navigator.maxTouchPoints
        };

        return SystemInfo.Parse(navigator.userAgent, hints);
    }

    /**
     * Recognizes the browser and the operating system described by a user agent string.
     * It's a pure function of its arguments: nothing is read from the environment.
     *
     * ---
     *
     * @example
     * ```ts
     * const userAgent = "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0";
     * const hints: SystemHints = { standalone: false };
     *
     * const systemInfo = SystemInfo.Parse(userAgent, hints);
     *
     * console.log(systemInfo.browser.name);         // "Firefox"
     * console.log(systemInfo.operatingSystem.name); // "Linux"
     * ```
     *
     * ---
     *
     * @param userAgent The user agent string to parse.
     * @param hints The {@link SystemHints} refining what the user agent can't tell. Default is none.
     *
     * @returns A new {@link SystemInfo} instance describing the given user agent.
     */
    public static Parse(userAgent: string, hints: SystemHints = { }): SystemInfo
    {
        const browser: Mutable<Browser> = parseBrowser(userAgent);
        const operatingSystem: Mutable<OperatingSystem> = parseOperatingSystem(userAgent, hints);

        if ((operatingSystem.name === "Android") && (browser.name === "Safari")) { browser.name = "Android Browser"; }
        if ((hints.standalone === true) && (browser.context !== "NW.js")) { browser.context = "WebApp"; }
        if ((operatingSystem.name === "macOS") && ((hints.maxTouchPoints ?? 0) > 2))
        {
            operatingSystem.name = "iOS";
            operatingSystem.version = browser.version;
        }

        return new SystemInfo(userAgent, browser, operatingSystem);
    }

    /**
     * The user agent string the information was recognized from.
     */
    public readonly userAgent: string;

    /**
     * The recognized browser.
     */
    public readonly browser: Readonly<Browser>;

    /**
     * The recognized operating system.
     */
    public readonly operatingSystem: Readonly<OperatingSystem>;

    private constructor(userAgent: string, browser: Browser, operatingSystem: OperatingSystem)
    {
        this.userAgent = userAgent;
        this.browser = browser;
        this.operatingSystem = operatingSystem;
    }

    public readonly [Symbol.toStringTag]: string = "SystemInfo";
}
