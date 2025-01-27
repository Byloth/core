import { describe, expect, it, vi } from "vitest";

import { loadScript } from "../../src/index.js";

describe("loadScript", () =>
{
    it("Should load a script successfully", async () =>
    {
        const scriptUrl = "https://example.com/script.js";

        const _appendChild = vi.spyOn(document.body, "appendChild")
            .mockImplementation((element) =>
            {
                const _script = element as HTMLScriptElement;
                _script.onload!(new Event("load"));

                return _script;
            });

        const { resolves } = expect(loadScript(scriptUrl));
        await resolves.toBeUndefined();

        expect(_appendChild).toHaveBeenCalled();

        const script = _appendChild.mock.calls[0][0] as HTMLScriptElement;
        expect(script).toBeInstanceOf(HTMLScriptElement);
        expect(script.src).toBe(scriptUrl);

        _appendChild.mockRestore();
    });
    it("Should fail to load a script", async () =>
    {
        const scriptUrl = "https://example.com/script.js";

        const _appendChild = vi.spyOn(document.body, "appendChild")
            .mockImplementation((element) =>
            {
                const _script = element as HTMLScriptElement;
                _script.onerror!(new Event("error"));

                return _script;
            });

        const { rejects } = expect(loadScript(scriptUrl));
        await rejects.toBeInstanceOf(Event);

        expect(_appendChild).toHaveBeenCalled();

        const script = _appendChild.mock.calls[0][0] as HTMLScriptElement;
        expect(script).toBeInstanceOf(HTMLScriptElement);
        expect(script.src).toBe(scriptUrl);

        _appendChild.mockRestore();
    });

    it("Should set the correct script type", async () =>
    {
        const scriptUrl = "https://example.com/script.js";

        const scriptType = "module";
        const _appendChild = vi.spyOn(document.body, "appendChild")
            .mockImplementation((element) =>
            {
                const _script = element as HTMLScriptElement;
                _script.onload!(new Event("load"));

                return _script;
            });

        const { resolves } = expect(loadScript(scriptUrl, scriptType));
        await resolves.toBeUndefined();

        expect(_appendChild).toHaveBeenCalled();

        const script = _appendChild.mock.calls[0][0] as HTMLScriptElement;
        expect(script).toBeInstanceOf(HTMLScriptElement);
        expect(script.src).toBe(scriptUrl);
        expect(script.type).toBe(scriptType);

        _appendChild.mockRestore();
    });
});
