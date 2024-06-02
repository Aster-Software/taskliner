export const getLookupTable = <T, V = T>(list: T[], getID: (entry: T) => string | number, getValue?: (entry: T) => V) => {
    const lookup = {} as Record<string, V>;

    list.forEach(entry => {
        const id = getID(entry);
        const value = getValue ? getValue(entry) : entry;

        return { id, value };
    })

    return lookup;
}