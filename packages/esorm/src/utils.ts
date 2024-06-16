export const deterministicStringify = (input: any) => {
  const deterministicReplacer = (_, v) =>
    typeof v !== "object" || v === null || Array.isArray(v) ? v : Object.fromEntries(Object.entries(v).sort(([ka], [kb]) => (ka < kb ? -1 : ka > kb ? 1 : 0)));

  return JSON.stringify(input, deterministicReplacer);
};

export const create2DSet = () => {
  const map = {} as Record<string, Set<any>>;

  return {
    values: (scope: string) => [...(map[scope] ?? [])],
    add: (scope: string, obj: any) => {
      if (map[scope] === undefined) map[scope] = new Set();

      map[scope].add(obj);
    },
    delete: (scope: string, obj: any) => {
      if (map[scope] === undefined) map[scope] = new Set();

      map[scope].delete(obj);
    },
  };
};

export const create2DRecord = <T>() => {
  const map = {} as Record<string, Record<string, T>>;

  return {
    values: (scope: string) => Object.values(map[scope]),
    add: (scope: string, key: string, obj: T) => {
      if (map[scope] === undefined) map[scope] = {};

      map[scope][key] = obj;
    },
    delete: (scope: string, key: string) => {
      if (map[scope] === undefined) map[scope] = {};

      delete map[scope][key];
    },
  };
};
