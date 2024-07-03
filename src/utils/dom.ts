export function loadScript(scriptUrl: string, scriptType = "text/javascript"): Promise<void>
{
    return new Promise<void>((resolve, reject) =>
    {
        const script = document.createElement("script");

        script.async = true;
        script.defer = true;
        script.src = scriptUrl;
        script.type = scriptType;

        script.onload = () => resolve();
        script.onerror = () => reject();

        document.body.appendChild(script);
    });
}
