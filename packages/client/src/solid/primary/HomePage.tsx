import { Container, Divider, Grid, HStack } from "@style/jsx";
import type { EsormType } from "~/../../api/src/esormdb";
import { EsormClient } from "esorm/dist/client";
import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { For, Match, Switch, createEffect } from "solid-js";
import { makeAutoObservable } from "mobx";
import { TextInput } from "../components/TextInput";
import { createId } from "@paralleldrive/cuid2";

export const HomePage = () => {
  return (
    <Container maxWidth="1000px" display="grid" gap={4} py={6}>
      <TestPanel />
      <TestPanel />
    </Container>
  );
};

const TestPanel = () => {
  const state = makeAutoObservable({
    isFiltered: false,
    isLimited: false,

    toggleFiltered: () => (state.isFiltered = !state.isFiltered),
    toggleLimited: () => (state.isLimited = !state.isLimited),
  });

  const query = esorm.createQuery(() => ({
    type: "workspace",
    query: (q) => (state.isFiltered ? q.where("status", "=", "dormant") : undefined),
    limit: state.isLimited ? 2 : undefined,
    // sort: ["_id", "asc"],
    // offset: 1,
  }));

  return (
    <Panel>
      <div>
        {state.isFiltered ? "FILTERED" : "UNFILTERED"} {state.isLimited ? "LIMITED" : "UNLIMITED"} {query.query.key}
      </div>

      <HStack>
        <Button
          onClick={() => {
            esorm.createEntityValue("workspace", {
              _id: createId(),
              name: `Test ${(Math.random() * 1000).toFixed()}`,
            });
          }}
        >
          Create New
        </Button>
        <Button onClick={() => state.toggleFiltered()}>Toggle Filtered</Button>
        <Button onClick={() => state.toggleLimited()}>Toggle Limited</Button>
      </HStack>
      <Divider />
      <Switch>
        <Match when={query.query.isLoading}>Loading...</Match>
        <Match when={query.query.isError}>Error</Match>
        <Match when>
          <For each={query.query.data}>
            {(workspace) => (
              <Grid columns={3}>
                <TextInput value={workspace.name} onInput={(e) => esorm.setEntityValue("workspace", workspace, "name", e.target.value)} />
                <TextInput value={workspace.description} onInput={(e) => esorm.setEntityValue("workspace", workspace, "description", e.target.value)} />
                <TextInput value={workspace.status} onInput={(e) => esorm.setEntityValue("workspace", workspace, "status", e.target.value)} />
              </Grid>
            )}
          </For>
        </Match>
      </Switch>
    </Panel>
  );
};

const esorm = EsormClient<EsormType>();
