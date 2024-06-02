import { makeAutoObservable, toJS } from "mobx"
import { For, Match, Show, Switch, createEffect, type Component } from "solid-js"
import { inspectGlobalCache, useAPIQuery, useAPIResource } from "../../utilities/ClientAPI";
import { WorkspaceSelector } from "../WorkspaceSelector";
import { getMany, useGetMany } from "../../utilities/ClientV2";

export const WorkspacePage: Component<{  }> = (props) => {
    const workspaces = useAPIQuery("/get-workspaces", {});

  const state = makeAutoObservable({
    selectedWorkspaceID: null as string | null,

    count: 0,

    get selectedWorkspace() {
        if (workspaces.data) return workspaces.data.find((x) => x.id === this.selectedWorkspaceID)

        return null;
    },

    setSelectedWorkspaceID: (value: string | null) => state.selectedWorkspaceID = value,

    increment: () => state.count++
  });

  // createEffect(async () => {
  //   const result = await getMany("workspace", {})

  //   console.log({ result });
  // })

  const test = useGetMany("workspace", [])

  createEffect(() => {
    console.log(toJS(test.data))
  })

  createEffect(async () => {
    const response = await fetch("/api2", {
      method: "POST"
    });

    if (response.ok) {
      const json = await response.json();

      console.log("REQ", json);
    } else {
      throw new Error("Response Not OK");
    }
  })

  return <div>
    <WorkspaceSelector onWorkspaceSelect={state.setSelectedWorkspaceID} />
    <Show when={state.selectedWorkspace} keyed fallback="No Workspace Selected">
        {workspace => <div>
            {workspace.id} {workspace.name}
        </div>}
    </Show>
    <div>Count: {state.count}</div>
    <div><button onClick={() => state.increment()}>Increment</button></div>
    <div>
        <button onClick={() => inspectGlobalCache()}>Inspect Cache</button>
        <button onClick={async () => {
          const result = await getMany("workspace", [])

          

          console.log({ result });
        }}>TEST API</button>
    </div>
    <div>
      <For each={test.data}>
        {workspace => <div>{workspace.id} {workspace.name}</div>}
      </For>
    </div>
  </div>
}

