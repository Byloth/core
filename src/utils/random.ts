export default class Random
{
    public static Boolean(ratio: number = 0.5): boolean
    {
        return (Math.random() < ratio);
    }

    public static Integer(max: number): number;
    public static Integer(min: number, max: number): number;
    public static Integer(min: number, max?: number): number
    {
        if (max === undefined)
        {
            return Math.floor(Math.random() * min);
        }

        return Math.floor(Math.random() * (max - min) + min);
    }

    public static Decimal(max: number): number;
    public static Decimal(min: number, max: number): number;
    public static Decimal(min: number, max?: number): number
    {
        if (max === undefined)
        {
            return (Math.random() * min);
        }

        return (Math.random() * (max - min) + min);
    }

    public static Choice<T>(elements: T[]): T
    {
        return elements[this.Integer(elements.length)];
    }

    // eslint-disable-next-line no-useless-constructor
    private constructor() { }
}
