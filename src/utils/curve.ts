import { SmartIterator } from "../models/index.js";

export default class Curve
{
    public static Linear(values: number): SmartIterator<number>
    {
        const step = (1 / values);

        return new SmartIterator<number>(function* ()
        {
            for (let index = 0; index < values; index += 1) { yield index * step; }
        });
    }
    public static Exponential(values: number, base = 2): SmartIterator<number>
    {
        const steps = (values - 1);

        return new SmartIterator<number>(function* ()
        {
            for (let index = 0; index < values; index += 1) { yield Math.pow(index / steps, base); }
        });
    }

    private constructor() { /* ... */ }

    public readonly [Symbol.toStringTag]: string = "Curve";
}
