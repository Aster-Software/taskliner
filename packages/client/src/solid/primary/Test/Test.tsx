import { makeAutoObservable, runInAction } from "mobx";
import { For, createEffect } from "solid-js";

export const Test2 = () => {
    const state = makeAutoObservable({
        workspaces: [] as { name: string }[]
    })

    createEffect(async () => {
        const response = await fetch("/api/test/test/test", {
          method: "POST"
        });
    
        if (response.ok) {
          const json = await response.json();
    
          console.log("REQ", json);

          runInAction(() => {
            state.workspaces = json.data
          })
        } else {
          throw new Error("Response Not OK");
        }
      })

    return <div>
        <div>Hello TEST</div>
        <For each={state.workspaces}>
            {workspace => <div>{workspace.name}</div>}
        </For>
    </div>
}