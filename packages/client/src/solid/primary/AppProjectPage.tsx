import { useParams } from "@solidjs/router";
import type { Id } from "../../../../api/convex/_generated/dataModel";
import { createQuery } from "../utilities/ConvexUtils";
import { api } from "../../../../api/convex/_generated/api";
import { Match, Switch, type JSXElement } from "solid-js";
import { Center, Container, Grid, VStack } from "@style/jsx";
import { DatePicker } from "../components/DatePicker";
import { recipes } from "../components/_ComponentStyleSystem";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import {
  button,
  hoverable,
  panel,
  test,
} from "../components/_VanillaExtract.css";
import { styled } from "../components/_StyledComponent";
import { PandaTest } from "../components/_PantaTest";

const T1 = styled("div");
const T2 = styled("div", panel);

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

              <div class={button({ variant: "solid" })}>SOLID</div>
              <div class={button({ variant: "filled" })}>FILLED</div>
              <div class={panel({ variant: "solid" })}>PANEL SOLID</div>
              <div class={panel({ variant: "filled" })}>PANEL FILLED</div>
              <div class={test({ variant: "solid" })}>TEST SOLID</div>
              <div class={test({ variant: "filled" })}>TEST FILLED</div>

              <T1 style={{ padding: "30px", color: "blue" }}>Test Div</T1>
              <T2
                variant="solid"
                style={{ color: "blue", "font-weight": "700" }}
              >
                Test Div
              </T2>
              <T2 variant="filled">Test Div</T2>

              <PandaTest />
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
