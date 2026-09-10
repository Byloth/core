// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const _helpers = () => import("../src/index.js");

describe("helpers", () =>
{
    beforeEach(() => { vi.resetModules(); });
    afterEach(() => { vi.unstubAllGlobals(); });

    describe("isBrowser", () =>
    {
        it("Should be `true` within a browser-like environment", async () =>
        {
            const { isBrowser } = await _helpers();

            expect(isBrowser).toBe(true);
        });
        it("Should be `false` when `window` is missing", async () =>
        {
            vi.stubGlobal("window", undefined);

            const { isBrowser } = await _helpers();

            expect(isBrowser).toBe(false);
        });
    });

    describe("isNode", () =>
    {
        it("Should be `true` within a Node.js runtime", async () =>
        {
            const { isNode } = await _helpers();

            expect(isNode).toBe(true);
        });
        it("Should be `false` when `process.versions.node` is missing", async () =>
        {
            const _process = (globalThis as unknown as Record<string, object>).process;

            vi.stubGlobal("process", { ..._process, versions: { } });

            const { isNode } = await _helpers();

            expect(isNode).toBe(false);
        });
    });

    describe("isWorker", () =>
    {
        class WorkerGlobalScope { public readonly kind: string = "worker"; }
        class DedicatedWorkerGlobalScope extends WorkerGlobalScope { }

        it("Should be `false` within a browser-like environment", async () =>
        {
            const { isWorker } = await _helpers();

            expect(isWorker).toBe(false);
        });
        it("Should be `true` when `self` is a worker global scope", async () =>
        {
            vi.stubGlobal("WorkerGlobalScope", WorkerGlobalScope);
            vi.stubGlobal("self", new WorkerGlobalScope());

            const { isWorker } = await _helpers();

            expect(isWorker).toBe(true);
        });
        it("Should be `true` for any specialized worker global scope", async () =>
        {
            vi.stubGlobal("WorkerGlobalScope", WorkerGlobalScope);
            vi.stubGlobal("self", new DedicatedWorkerGlobalScope());

            const { isWorker } = await _helpers();

            expect(isWorker).toBe(true);
        });
        it("Should be `false` when `self` isn't a worker global scope", async () =>
        {
            vi.stubGlobal("WorkerGlobalScope", WorkerGlobalScope);
            vi.stubGlobal("self", { });

            const { isWorker } = await _helpers();

            expect(isWorker).toBe(false);
        });
    });
});
