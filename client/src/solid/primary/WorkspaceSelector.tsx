import type { Component } from "solid-js"
import { callAPI, useAPIResource } from "../utilities/ClientAPI"
import { makeAutoObservable } from "mobx";

export const WorkspaceSelector: Component<{
    onWorkspaceSelect?: (id: string) => void;
}> = (props) => {
    const workspaces = useAPIResource("/get-workspaces", {});

    const state = makeAutoObservable({
        test: 0,

        increment: () => {
            state.test++;
        },
    })

  return <div>
    Workspaces:

    {workspaces.isLoading ? "LOADING" : workspaces.isError ? "ERROR" : workspaces.data.map(workspace => <button onClick={() => props.onWorkspaceSelect?.(workspace.id)}>
        {workspace.name || "Untitled Workspace"}
    </button>)}

    <button onClick={async () => {
        await callAPI("/create-workspace", {});
        await workspaces.refetch();
    }}>
        New Workspace
    </button>
  </div>
}