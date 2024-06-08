import { useParams } from "@solidjs/router";
import type { Id } from "../../../../api/convex/_generated/dataModel";
import { createQuery } from "../utilities/ConvexUtils";
import { api } from "../../../../api/convex/_generated/api";
import { Match, Switch, type JSXElement } from "solid-js";
import { Center, Container, Grid, VStack, styled } from "@style/jsx";
import { DatePicker } from "../components/DatePicker";
import { mergeRecipes, recipes } from "../components/_ComponentStyleSystem";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import merge from "merge";

export const AppProjectPage = () => {
  const params = useParams();
  const workspace_id = params.workspace_id as Id<"workspace">;
  const project_id = params.project_id as Id<"project">;

  const project = createQuery(api.project.one, {
    workspace_id,
    project_id,
  });

  return (
    <LoadingStateHandler
      isLoading={project.isLoading}
      isError={project.isError}
      data={project.data}
    >
      {(project) => (
        <Container maxWidth={1200} py={4}>
          <Grid gap={4}>
            <h1>{project.name}</h1>
            <div>Hello Project!</div>
            <DatePicker
              value="2024-06-06"
              onChange={(value) => console.log(value)}
            />
            <DatePicker
              value="2024-06-06"
              onChange={(value) => console.log(value)}
            />

            <div class={recipes.panel()}>
              <h2>Hell World</h2>

              <Grid columns={4}>
                <Button>Click Here</Button>
                <TextInput placeholder="Write Stuff..." />
              </Grid>

              <TestMergedRecipe variant="solid">Test</TestMergedRecipe>
            </div>
          </Grid>
        </Container>
      )}
    </LoadingStateHandler>
  );
};

const LoadingStateHandler = <T extends any>(props: {
  isLoading: boolean;
  isError: boolean;
  data: T;
  children?: (data: T) => JSXElement;
}) => {
  return (
    <Switch>
      <Match when={props.isLoading}>
        <Center w="100%" h="75%" color="t20">
          <i class="fas fa-spin fa-loader fa-2x" />
        </Center>
      </Match>
      <Match when={props.isError}>
        <Center w="100%" h="75%">
          <VStack>
            <i class="fas fa-warning fa-2x" />
            <div>Sorry, something went wrong.</div>
          </VStack>
        </Center>
      </Match>
      <Match when>{props.children?.(props.data!)}</Match>
    </Switch>
  );
};

const TestMergedRecipe = styled(
  "div",
  mergeRecipes(recipes.input, recipes.panel, recipes.test),
);

const t1 = {
  test: "Hello World",
  x: {
    a: "Test",
  },
};

const t2 = {
  a: "Hey",
  x: {
    b: "Test",
  },
};

const x = merge(t1, t2);

type OptionalPropertyNames<T> = {
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never;
}[keyof T];

type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>;
};

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R]
  ? SpreadTwo<L, Spread<R>>
  : unknown;

type Foo = Spread<[{ a: string }, { a?: number }]>;

function merge<A extends object[]>(...a: [...A]) {
  return Object.assign({}, ...a) as Spread<A>;
}
