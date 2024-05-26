import { makeAutoObservable, runInAction } from "mobx";
import { createEffect, createSignal, type Accessor, type Signal } from "solid-js";
import type {RouterType} from "~/../../api/src/core/Router";

export const useAPIResource = <Path extends keyof RouterType>(path: Path, variables: RouterType[Path]["_types"]["_variables"]) => {
    const state = makeAutoObservable({
        isLoading: true,
        isError: false,
        data: undefined as any as RouterType[Path]["_types"]["_result"],

        refetch: async () => {
            runInAction(() => {
                state.isLoading = true;
                state.isError = true;
            });

            await state._fetch();
        },
        
        _fetch: async () => {
            try {
                const data = await callAPI(path, variables);

                state._set_success(data)
            } catch (e) {
                state._set_error()
            }
        },

        _set_success: (data: RouterType[Path]["_types"]["_result"]) => {
            runInAction(() => {
                state.isLoading = false;
                state.isError = false;
                state.data = data;
            })
        },
        _set_error: () => {
            runInAction(() => {
                state.isLoading = false;
                state.isError = true;
            })
        }
    })

    createEffect(async () => state._fetch());

    return state;
}

export const callAPI = async <Path extends keyof RouterType>(path: Path, variables: RouterType[Path]["_types"]["_variables"]) => {
    try {
        const response = await fetch("/api" + path, { method: "post", body: variables });

        console.log(response)

        if (response.ok) {
            const json = await response.json();

            return json.data;
        } else {
            throw new Error("Nope")
        }
      } catch (e) {
        console.error(e)
      }
}