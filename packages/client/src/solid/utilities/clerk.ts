import { Clerk } from "@clerk/clerk-js";
import { makeAutoObservable } from "mobx";

const clerkPublishableKey = "pk_test_Y3JlZGlibGUtY2FpbWFuLTU1LmNsZXJrLmFjY291bnRzLmRldiQ";

export const createClerkProvider = () => {
  const state = makeAutoObservable({
    isLoading: true,
    isError: false,

    success: () => {
      state.isLoading = false;
      state.isError = false;
    },
    error: () => {
      state.isLoading = false;
      state.isError = true;
    },
  });

  const clerk = new Clerk(clerkPublishableKey);

  clerk
    .load({
      // Set load options here...
    })
    .then(() => {
      state.success();
    })
    .catch(() => {
      state.error();
    });

  clerk.addListener((r) => {
    console.log("Session ID:", r.session?.id);
  });

  return {
    client: clerk,
    state,
  };
};
