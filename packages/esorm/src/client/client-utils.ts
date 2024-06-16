export type BaseSchema = {
  [key: string]: {
    _id: string;
  };
};

export const set = (target, key, setter) => {
  const t = target[key];

  target[key] = setter(t);
};
