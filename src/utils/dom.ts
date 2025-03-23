/**
 * Appends a script element to the document body.  
 * It can be used to load external scripts dynamically.
 *
 * ---
 *
 * @example
 * ```ts
 * await loadScript("https://analytics.service/script.js?id=0123456789");
 * ```
 *
 * ---
 *
 * @param scriptUrl The URL of the script to load.
 * @param scriptType The type of the script to load. Default is `"text/javascript"`.
 *
 * @returns
 * A {@link Promise} that resolves when the script has been loaded successfully or rejects if an error occurs.
 */
export function loadScript(scriptUrl: string, scriptType = "text/javascript"): Promise<void>
{
    return new Promise<void>((resolve, reject) =>
    {
        const script = document.createElement("script");

        script.async = true;
        script.defer = true;
        script.src = scriptUrl;
        script.type = scriptType;

        script.onload = (evt) => resolve();
        script.onerror = (reason) => reject(reason);

        document.body.appendChild(script);
    });
}
