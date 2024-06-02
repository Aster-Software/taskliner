import type { Component } from "solid-js"
import { callAPI, useAPIQuery, useAPIResource } from "../utilities/ClientAPI"
import { makeAutoObservable } from "mobx";
import { useGetMany } from "../utilities/ClientV2";

export const WorkspaceSelector: Component<{
    onWorkspaceSelect?: (id: string) => void;
}> = (props) => {
    const workspaces = useGetMany("workspace", []);

    const state = makeAutoObservable({
        test: 0,

        increment: () => {
            state.test++;
        },
    })

  return <div>
    Workspaces:

    {workspaces.isLoading ? "LOADING" : workspaces.isError ? "ERROR" : workspaces.data?.map(workspace => <button onClick={() => props.onWorkspaceSelect?.(workspace.id)}>
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