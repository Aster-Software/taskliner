import { makeAutoObservable } from "mobx"
import { Match, Show, Switch, type Component } from "solid-js"
import { useAPIResource } from "../../utilities/ClientAPI";
import { WorkspaceSelector } from "../WorkspaceSelector";

export const WorkspacePage: Component<{  }> = (props) => {
    const workspaces = useAPIResource("/get-workspaces", {});

  const state = makeAutoObservable({
    selectedWorkspaceID: null as string | null,

    get selectedWorkspace() {
        if (workspaces.data) return workspaces.data.find(x => x.id === this.selectedWorkspaceID)

        return null;
    },

    setSelectedWorkspaceID: (value: string | null) => state.selectedWorkspaceID = value,
  });

  return <div>
    <WorkspaceSelector onWorkspaceSelect={state.setSelectedWorkspaceID} />
    <Show when={state.selectedWorkspace} keyed fallback="No Workspace Selected">
        {workspace => <div>
            {workspace.id} {workspace.name}
        </div>}
    </Show>
  </div>
}

