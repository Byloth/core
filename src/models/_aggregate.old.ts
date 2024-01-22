export function aggregate<V>(elements: Iterable<V>)
{
    type Iteratee<K> = (element: V, index: number) => K;

    function byKey<K extends string | number | symbol>(iteratee: Iteratee<K>)
    {
        function countToMap()
        {
            const counts = new Map<K, number>();

            let index = 0;
            for (const element of elements)
            {
                const key = iteratee(element, index);

                if (counts.has(key))
                {
                    counts.set(key, counts.get(key)! + 1);
                }
                else
                {
                    counts.set(key, 1);
                }

                index += 1;
            }

            return counts;
        }
        function countToDict()
        {
            const mapCounts = countToMap();
            const dictCounts = { } as Record<K, number>;

            for (const [key, _count] of mapCounts.entries())
            {
                dictCounts[key] = _count;
            }

            return dictCounts;
        }
        function count()
        {
            return Array.from(countToMap().values());
        }

        function groupToMap()
        {
            const groups = new Map<K, V[]>();

            let index = 0;
            for (const element of elements)
            {
                const key = iteratee(element, index);

                if (groups.has(key))
                {
                    groups.get(key)!
                        .push(element);
                }
                else
                {
                    groups.set(key, [element]);
                }

                index += 1;
            }

            return groups;
        }
        function groupToDict()
        {
            const mapGroups = groupToMap();
            const dictGroup = { } as Record<K, V[]>;

            for (const [key, _group] of mapGroups.entries())
            {
                dictGroup[key] = _group;
            }

            return dictGroup;
        }
        function group()
        {
            return Array.from(groupToMap().values());
        }

        type Reducer<R = V> = (key: K, group: R | undefined, element: V, index: number) => R;

        function reduceToMap<R = V>(reducer: Reducer<R>, initialValue?: R | undefined)
        {
            const counts = new Map<K, number>();
            const groups = new Map<K, R>();

            let index = 0;
            for (const element of elements)
            {
                let _count = 0;
                let _group = initialValue;

                const key = iteratee(element, index);
                if (groups.has(key))
                {
                    _count = counts.get(key)!;
                    _group = groups.get(key)!;
                }

                _group = reducer(key, _group, element, _count);

                counts.set(key, _count + 1);
                groups.set(key, _group);

                index += 1;
            }

            return groups;
        }
        function reduceToDict<R = V>(reducer: Reducer<R>, initialValue?: R | undefined)
        {
            const mapGroups = reduceToMap(reducer, initialValue);
            const dictGroup = { } as Record<K, R>;

            for (const [key, _group] of mapGroups.entries())
            {
                dictGroup[key] = _group;
            }

            return dictGroup;
        }
        function reduce<R = V>(reducer: Reducer<R>, initialValue?: R | undefined)
        {
            return Array.from(reduceToMap(reducer, initialValue).values());
        }

        async function asyncReduceToMap<R = V>(reducer: Reducer<Promise<R>>, initialValue?: Promise<R> | undefined)
        {
            const awaitedGroups = new Map<K, R>();
            const asyncGroups = reduceToMap(reducer, initialValue);

            for (const [key, asyncGroup] of asyncGroups.entries())
            {
                awaitedGroups.set(key, await asyncGroup);
            }

            return awaitedGroups;
        }
        async function asyncReduceToDict<R = V>(reducer: Reducer<Promise<R>>, initialValue?: Promise<R> | undefined)
        {
            const mapGroups = reduceToMap(reducer, initialValue);
            const dictGroup = { } as Record<K, R>;

            for (const [key, _group] of mapGroups.entries())
            {
                dictGroup[key] = await _group;
            }

            return dictGroup;
        }
        function asyncReduce<R = V>(reducer: Reducer<Promise<R>>, initialValue?: Promise<R> | undefined)
        {
            return Promise.all(reduce(reducer, initialValue));
        }

        return {
            count,
            countToMap,
            countToDict,
            group,
            groupToMap,
            groupToDict,
            reduce,
            reduceToMap,
            reduceToDict,
            asyncReduce,
            asyncReduceToMap,
            asyncReduceToDict
        };
    }
    function byAsyncKey<K extends string | number | symbol>(iteratee: Iteratee<Promise<K>>)
    {
        async function countToMap()
        {
            const counts = new Map<K, number>();

            let index = 0;
            for (const element of elements)
            {
                const key = await iteratee(element, index);

                if (counts.has(key))
                {
                    counts.set(key, counts.get(key)! + 1);
                }
                else
                {
                    counts.set(key, 1);
                }

                index += 1;
            }

            return counts;
        }
        async function countToDict()
        {
            const mapCounts = await countToMap();
            const dictCounts = { } as Record<K, number>;

            for (const [key, _count] of mapCounts.entries())
            {
                dictCounts[key] = _count;
            }

            return dictCounts;
        }
        async function count()
        {
            const counts = await countToMap();

            return Array.from(counts.values());
        }

        async function groupToMap()
        {
            const groups = new Map<K, V[]>();

            let index = 0;
            for (const element of elements)
            {
                const key = await iteratee(element, index);

                if (groups.has(key))
                {
                    groups.get(key)!
                        .push(element);
                }
                else
                {
                    groups.set(key, [element]);
                }

                index += 1;
            }

            return groups;
        }
        async function groupToDict()
        {
            const mapGroups = await groupToMap();
            const dictGroup = { } as Record<K, V[]>;

            for (const [key, _group] of mapGroups.entries())
            {
                dictGroup[key] = _group;
            }

            return dictGroup;
        }
        async function group()
        {
            const groups = await groupToMap();

            return Array.from(groups.values());
        }

        type Reducer<R = V> = (key: K, group: R | undefined, element: V, index: number) => R;

        async function reduceToMap<R = V>(reducer: Reducer<R>, initialValue?: R | undefined)
        {
            const counts = new Map<K, number>();
            const groups = new Map<K, R>();

            let index = 0;
            for (const element of elements)
            {
                let _count = 0;
                let _group = initialValue;

                const key = await iteratee(element, index);
                if (groups.has(key))
                {
                    _count = counts.get(key)!;
                    _group = groups.get(key)!;
                }

                _group = reducer(key, _group, element, _count);

                counts.set(key, _count + 1);
                groups.set(key, _group);

                index += 1;
            }

            return groups;
        }
        async function reduceToDict<R = V>(reducer: Reducer<R>, initialValue?: R | undefined)
        {
            const mapGroups = await reduceToMap(reducer, initialValue);
            const dictGroup = { } as Record<K, R>;

            for (const [key, _group] of mapGroups.entries())
            {
                dictGroup[key] = _group;
            }

            return dictGroup;
        }
        async function reduce<R = V>(reducer: Reducer<R>, initialValue?: R | undefined)
        {
            const groups = await reduceToMap(reducer, initialValue);

            return Array.from(groups.values());
        }

        async function asyncReduceToMap<R = V>(reducer: Reducer<Promise<R>>, initialValue?: Promise<R> | undefined)
        {
            const awaitedGroups = new Map<K, R>();
            const asyncGroups = await reduceToMap(reducer, initialValue);

            for (const [key, asyncGroup] of asyncGroups.entries())
            {
                awaitedGroups.set(key, await asyncGroup);
            }

            return awaitedGroups;
        }
        async function asyncReduceToDict<R = V>(reducer: Reducer<Promise<R>>, initialValue?: Promise<R> | undefined)
        {
            const mapGroups = await reduceToMap(reducer, initialValue);
            const dictGroup = { } as Record<K, R>;

            for (const [key, _group] of mapGroups.entries())
            {
                dictGroup[key] = await _group;
            }

            return dictGroup;
        }
        async function asyncReduce<R = V>(reducer: Reducer<Promise<R>>, initialValue?: Promise<R> | undefined)
        {
            const groups = await reduce(reducer, initialValue);

            return Promise.all(groups);
        }

        return {
            count,
            countToMap,
            countToDict,
            group,
            groupToMap,
            groupToDict,
            reduce,
            reduceToMap,
            reduceToDict,
            asyncReduce,
            asyncReduceToMap,
            asyncReduceToDict
        };
    }

    type Mapper<R> = (element: V, index: number) => R;

    function map<R>(mapper: Mapper<R>)
    {
        const mapping: R[] = [];

        let index = 0;
        for (const element of elements)
        {
            mapping.push(mapper(element, index));

            index += 1;
        }

        return mapping;
    }
    async function asyncMap<R>(mapper: Mapper<Promise<R>>)
    {
        return await Promise.all(map(mapper));
    }

    return { byKey, byAsyncKey, map, asyncMap };
}
