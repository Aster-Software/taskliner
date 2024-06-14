import { Container } from "@style/jsx";
import type { EsormType } from "~/../../api/src/esormdb";
import { EsormClient } from "esorm/dist/client";
import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { For } from "solid-js";
import { makeAutoObservable } from "mobx";
import { TextInput } from "../components/TextInput";
import { createId } from "@paralleldrive/cuid2";

export const HomePage = () => {
  const state = makeAutoObservable({
    isFiltered: false,
    isLimited: true,

    toggleFiltered: () => (state.isFiltered = !state.isFiltered),
    toggleLimited: () => (state.isLimited = !state.isLimited),
  });

  const query = esorm.createQuery(() => ({
    type: "workspace",
    query: (q) => (state.isFiltered ? q.where("status", "=", "dormant") : undefined),
    // sort: ["_id", "asc"],
    limit: state.isLimited ? 2 : undefined,
    // offset: 1,
  }));

  return (
    <Container maxWidth="1000px" display="grid" gap={4} py={6}>
      <div>Hello Home Page</div>
      <Panel gap={1} width="300px">
        <Button
          onClick={async () => {
            const result = await esorm.getMany({ type: "workspace" });

            console.log(result);
          }}
        >
          GET ALL
        </Button>
        <Button
          onClick={async () => {
            const result = await esorm.getMany({ type: "workspace", query: (q) => q.where("status", "=", "dormant") });

            console.log(result);
          }}
        >
          GET DORMANT
        </Button>
        <Button
          onClick={async () => {
            const result = await esorm.getMany({
              type: "workspace",
              query: (q) =>
                q.and(
                  //
                  q.where("status", "=", "dormant"),
                  q.where("_id", "in", ["t431s5zipquyyhsdf5vmc4yf", "b3b6h4j2jpcz185l3pph99tg"]),
                ),
            });

            console.log(result);
          }}
        >
          GET (OR OPERATOR)
        </Button>
        <Button
          onClick={() => {
            esorm.createOne("workspace", {
              _id: createId(),
              name: `Test ${(Math.random() * 1000).toFixed()}`,
            });
          }}
        >
          Test CREATE
        </Button>
        <Button onClick={() => state.toggleFiltered()}>Toggle Filtered</Button>
        <Button onClick={() => state.toggleLimited()}>Toggle Limited</Button>
      </Panel>
      <Panel>
        <For each={query.data}>
          {(workspace) => <TextInput value={workspace.name} onInput={(e) => esorm.setEntityValue("workspace", workspace, "name", e.target.value)} />}
        </For>
      </Panel>
      <Panel>
        <For each={query.data}>
          {(workspace) => <TextInput value={workspace.name} onInput={(e) => esorm.setEntityValue("workspace", workspace, "name", e.target.value)} />}
        </For>
      </Panel>
    </Container>
  );
};

const esorm = EsormClient<EsormType>();
