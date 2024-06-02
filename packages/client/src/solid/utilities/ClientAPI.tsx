import stringify from "json-stringify-deterministic";
import { makeAutoObservable, runInAction } from "mobx";
import { createEffect, createSignal, type Accessor, type Signal } from "solid-js";
import type {RouterInputType, RouterResultType, RouterType} from "~/../../../api/src/core/Router";

export const useAPIResource = <Path extends keyof RouterType>(path: Path, input: RouterType[Path]["_types"]["_input"]) => {
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
            console.log("FETCHING");

            try {
                const data = await callAPI(path, input);

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

export const useAPIQuery = <Path extends keyof RouterType>(path: Path, input: RouterType[Path]["_types"]["_input"]) => {
    const query = GetOrCreateQuery(path, input);

    return query;
}

const GlobalQueryCache = makeAutoObservable({
    resourceCache: new Map<string, any>(),
    queryCache: new Map<string, QueryInstance<any>>(),
});

class QueryInstance<Path extends keyof RouterType, InputType = RouterInputType<Path>, ResultType = RouterResultType<Path>> {
    key: string;
    path: Path;
    input: RouterType[Path]["_types"]["_input"];

    isLoading = true;
    isError = false;
    raw = undefined as any;

    constructor(key: string, path: Path, input: RouterType[Path]["_types"]["_input"]) {
        this.key = key;
        this.path = path;
        this.input = input;

        makeAutoObservable(this)

        this._fetch();
    };

    get data() {
        type FinalType = RouterType["/get-workspaces"]["_types"]["_final_result_type"]

        if (this.raw === undefined) return undefined;

        console.log("GETDATA", this.raw);

        if (this.raw._result_type === "object") {
            return this.raw.data[0] as FinalType

            // NEXT: Cached Version
            // return (GlobalQueryCache.resourceCache.get(this.raw.id)) as FinalType
        } else if (this.raw._result_type === "array") {
            return this.raw.data as FinalType;

            // NEXT: Cached Version
            // return this.raw.ids.map(id => GlobalQueryCache.resourceCache.get(id)) as FinalType;
        } else {
            return this.raw.data[0] as FinalType
        }
    }

    async refetch() {
        runInAction(() => {
            this.isLoading = true;
            this.isError = true;
        });

        await this._fetch();
    }

    async _fetch() {
        try {
            const data = await callAPI(this.path, this.input);

            runInAction(() => {
                this.isLoading = false;
                this.isError = false;
                this.raw = data;
            })
        } catch (e) {
            runInAction(() => {
                this.isLoading = false;
                this.isError = true
            })
        }
    }
}

const GetOrCreateQuery = <Path extends keyof RouterType>(path: Path, input: RouterType[Path]["_types"]["_input"]): QueryInstance<Path> => {
    const key = path + "|" + stringify(input);
    const value = GlobalQueryCache.queryCache.get(key);

    if (value) {
        return value;
    } else {
        const value = new QueryInstance(key, path, input);

        GlobalQueryCache.queryCache.set(key, value);

        return value;
    }
}

export const callAPI = async <Path extends keyof RouterType>(path: Path, input: RouterType[Path]["_types"]["_input"]) => {
    try {
        const response = await fetch("/api" + path, { method: "post", body: input });

        console.log(response)

        if (response.ok) {
            const json = await response.json();

            console.log("JSON", json)

            return json
        } else {
            throw new Error("Nope")
        }
      } catch (e) {
        console.error(e)
      }
}

export const inspectGlobalCache = () => {
    console.log("Global Query Cache Inspection:")
    console.log("Resource Cache Size: ", GlobalQueryCache.resourceCache.size);
    console.log("Query Cache Size: ", GlobalQueryCache.queryCache.size);
}