import { A, useParams } from "@solidjs/router";
import { css } from "@style/css";
import { Convex, createQuery } from "../utilities/ConvexUtils";
import { api } from "../../../../api/convex/_generated/api";
import { For, Show } from "solid-js";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { FormGroup } from "../components/FormGroup";
import { TextInput } from "../components/TextInput";
import { HStack, styled } from "@style/jsx";
import type { Id } from "../../../../api/convex/_generated/dataModel";
import { LeftIcon } from "../components/Icon";

export const AppHeader = () => {
  const state = createQuery(api.workspace.get, {});

  const param = useParams();
  const workspace_id = param.id as Id<"workspace"> | undefined;

  return (
    <styled.nav
      bg="background"
      py={2}
      px={4}
      display="grid"
      gridTemplateColumns="auto minmax(0, 1fr) auto"
    >
      <A href="/app" class={NavItemClass} activeClass={NavItemClassActive}>
        Home
      </A>

      <HStack>
        <For each={state.data}>
          {(workspace) => (
            <A
              href={`/app/workspace/${workspace._id}`}
              class={NavItemClass}
              activeClass={NavItemClassActive}
            >
              {workspace.name}
            </A>
          )}
        </For>
      </HStack>

      <Modal.Root>
        <Modal.Trigger>
          <Button>
            <LeftIcon class="fas fa-plus" /> New Workspace
          </Button>
        </Modal.Trigger>
        <Modal.Content w="500px" title="Create New Workspace">
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const form = e.currentTarget;
              const formData = new FormData(form);
              const values = Object.fromEntries(formData) as any;

              await Convex.mutation(api.workspace.create, values);

              form.reset();
            }}
          >
            <FormGroup label="Workspace Name">
              <TextInput name="name" placeholder="My Team's Workspace" />
            </FormGroup>
          </form>
          <HStack justify="end">
            <Button>Cancel</Button>
            <Button>Create</Button>
          </HStack>
        </Modal.Content>
      </Modal.Root>
    </styled.nav>
  );
};

const NavItemClass = css({
  py: 1,
  px: 2,
  mx: 2,
  fontWeight: "semibold",
  fontSize: "sm",
});

const NavItemClassActive = css({
  color: "teal.600",
  borderBottomStyle: "solid",
  borderBottomWidth: 2,
});
