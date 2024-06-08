import { ConvexClient } from "convex/browser";
import { makeAutoObservable, runInAction } from "mobx";
import { createEffect, onCleanup } from "solid-js";
import type { FunctionReference } from "convex/server";

export const Convex = new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL);

type TT = FunctionReference<"query">;

export const createQuery = <T extends TT>(
  funcKey: Parameters<typeof Convex.onUpdate<T>>[0],
  funcArgs: Parameters<typeof Convex.onUpdate<T>>[1],
) => {
  const state = makeAutoObservable({
    isLoading: true,
    isError: false,
    data: [] as Awaited<ReturnType<typeof Convex.query<T>>>,
  });

  createEffect(async () => {
    const disconnect = Convex.onUpdate(
      funcKey,
      funcArgs,
      (data) => {
        runInAction(() => {
          state.isLoading = false;
          state.isError = false;
          state.data = data;
        });
      },
      (err) => {
        runInAction(() => {
          state.isLoading = false;
          state.isError = true;
        });
      },
    );

    onCleanup(() => disconnect());
  });

  return state;
};
