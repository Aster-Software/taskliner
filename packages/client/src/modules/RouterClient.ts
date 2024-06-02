import type { z } from "astro:content";
import stringify from "json-stringify-deterministic";
import { makeAutoObservable, runInAction } from "mobx";
import { createEffect, createSignal, type Accessor, type Signal } from "solid-js";
import type { CreateRouter, RouterType } from "./Router";

type RouteKey = keyof RouterType["config"]
type RouteInput<K extends RouteKey> = z.infer<RouterType["config"][K]["input"]>;
type RouteResult<K extends RouteKey> = Awaited<ReturnType<RouterType["config"][K]["handler"]>>;

const GlobalRouterClientState = makeAutoObservable({});

const callAPI = async <K extends RouteKey>(key: K, input: RouteInput<K>) => {
    const response = await fetch("/api" + key, {
        headers: { "Content-Type": "application/json" },
        method: "post",
        body: JSON.stringify(input),
    });

    if (response.ok) {
        const json = await response.json();

        return json.data as RouteResult<K>
    } else {
        throw new Error("Response not OK");
    }
}

// const GlobalQueryCache = makeAutoObservable({
//     resourceCache: new Map<string, any>(),
//     queryCache: new Map<string, QueryInstanceV2<any, any>>(),
// });

// type ApiAction = "get-many"

// const GetOrCreateQuery = <Path extends RouteKey>(
//     path: Path,
//     input: QueryInput[]
// ): QueryInstanceV2<any, RouteResource<Path>[]> => {
//     const key = path + "|" + stringify(input);
//     const value = GlobalQueryCache.queryCache.get(key);

//     if (value) {
//         return value;
//     } else {
//         const value = new QueryInstanceV2<any, RouteResource<Path>[]>({
//             key,
//             path,
//             input,
//             // TODO: Add to Cache
//             onProcess: (data) => {
//                 // TODO: Get From Cache

//                 return data.data;
//             }
//         });

//         GlobalQueryCache.queryCache.set(key, value);

//         return value
//     }
// }

// export const API = {
//     useQuery() {

//     }
// };

// type RouteKey = keyof RouterType["config"]
// type RouteResource<Path extends RouteKey> = RouterType["config"][Path]["_types"]["_resource"];

// export const getMany = async <Path extends RouteKey>(path: Path, input: QueryInput[]) => {
//     return await callAPIGeneric(`/resource/${path}/get-many`, input, "get");
// }

// type QueryActionType = "get-one" | "get-many" | "create" | "update" | "delete";

// class QueryInstanceV2<InputType, ResultType> {
//     key: string;
//     path: string;
//     input: InputType;
//     result: ResultType = undefined as any;

//     isLoading = true;
//     isError = false;
//     raw = undefined as any;

//     onSuccess?: () => void;
//     onError?: () => void;
//     onProcess: (data: any) => ResultType;

//     constructor(options: {
//         key: string, 
//         path: string, 
//         input: InputType, 
//         onSuccess?: () => void,
//         onError?: () => void,
//         onProcess: (data: any) => ResultType,
//     }) {
//         this.key = options.key;
//         this.path = options.path;
//         this.input = options.input;
//         this.onSuccess = options.onSuccess;
//         this.onError = options.onError;
//         this.onProcess = options.onProcess;

//         makeAutoObservable(this)

//         this._fetch();
//     };

//     get data() {
//         console.log("GETDATA", this.raw);

//         return this.onProcess(this.raw);
//     }

//     async refetch() {
//         runInAction(() => {
//             this.isLoading = true;
//             this.isError = true;
//         });

//         await this._fetch();
//     }

//     async _fetch() {
//         try {
//             const data = await callAPIGeneric(`/resource/${this.path}`, this.input, "post");

//             runInAction(() => {
//                 this.isLoading = false;
//                 this.isError = false;
//                 this.raw = data;
//             })
//         } catch (e) {
//             runInAction(() => {
//                 this.isLoading = false;
//                 this.isError = true
//             })
//         }
//     }
// }

// export const callAPIGeneric = async (path: string, input: any, method: "get" | "post") => {
//     try {
//         const methodOverride = {
//             get: "GET",
//             post: "POST",
//         }[method]

//         const response = await fetch("/api" + path, { 
//             headers: {
//                 "X-HTTP-Method-Override": methodOverride,
//                 "Content-Type": "application/json",
//             },
//             method: "post", 
//             body: JSON.stringify(input),
//         });

//         if (response.ok) {
//             const json = await response.json();

//             console.log("JSON", json)

//             return json as any
//         } else {
//             throw new Error("Nope")
//         }
//       } catch (e) {
//         // console.error(e)

//         throw e;
//       }
// }

// export const inspectGlobalCache = () => {
//     console.log("Global Query Cache Inspection:")
//     console.log("Resource Cache Size: ", GlobalQueryCache.resourceCache.size);
//     console.log("Query Cache Size: ", GlobalQueryCache.queryCache.size);
// }