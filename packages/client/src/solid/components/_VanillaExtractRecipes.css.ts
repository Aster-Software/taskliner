// ./recipes.ts
import { recipe } from "@vanilla-extract/recipes";
import { addFunctionSerializer } from "@vanilla-extract/css/functionSerializer";

type RecipeRuntimeFn = ReturnType<typeof recipe>;
type VariantsArg<R> = R extends RecipeRuntimeFn ? Parameters<R>[0] : never;
type RecipeMeta = {
  importPath: string;
  importName: string;
  args: [
    {
      defaultClassName: string;
      variantClassNames: Record<string, Record<string, string>>;
      defaultVariants: Record<string, string>;
      compoundVariants: Array<[Record<string, string>, string]>;
    },
  ];
};

function merge(metaList: RecipeMeta[]) {
  const recipes = metaList.map((r) => r.args[0]);

  return {
    importPath: metaList[0].importPath,
    importName: metaList[0].importName,
    args: [
      {
        defaultClassName: recipes
          .map((r) => r.defaultClassName)
          .filter(Boolean)
          .join(" "),
        variantClassNames: recipes.reduce((acc, r) => {
          Object.entries(r.variantClassNames).forEach(
            ([variantName, variants]) => {
              acc[variantName] ??= {};
              Object.entries(variants).forEach(([variantValue, className]) => {
                if (acc[variantName][variantValue]) {
                  acc[variantName][variantValue] += ` ${className}`;
                } else {
                  acc[variantName][variantValue] = className;
                }
              });
            },
          );
          return acc;
        }, {} as any),
        defaultVariants: Object.assign(
          {},
          ...recipes.map((r) => r.defaultVariants),
        ),
        compoundVariants: recipes.flatMap((r) => r.compoundVariants),
      },
    ],
  };
}

export const mergeRecipes = <R extends RecipeRuntimeFn[]>(...recipes: R) => {
  type Variants = VariantsArg<R[number]>;
  return addFunctionSerializer(
    (_?: Variants) => "",
    merge(
      (recipes as unknown as Array<{ __recipe__: RecipeMeta }>).map(
        (recipe) => recipe.__recipe__,
      ),
    ),
  );
};
