import { A, useParams } from "@solidjs/router";
import { Convex, createQuery } from "../utilities/ConvexUtils";
import { api } from "../../../../api/convex/_generated/api";
import { For } from "solid-js";
import type { Id } from "../../../../api/convex/_generated/dataModel";
import { Container, Grid, HStack, VStack, styled } from "@style/jsx";
import { makeAutoObservable } from "mobx";
import { FormGroup } from "../components/FormGroup";
import { ToasterController, ToasterManager } from "../components/Toaster";
import { TextInput } from "../components/TextInput";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Timeline } from "./Timeline";
import { ProjectCard } from "./ProjectCard";

export const AppWorkspacePage = () => {
  const params = useParams();
  const workspace_id = params.workspace_id as Id<"workspace">;

  const workspace = createQuery(api.workspace.one, { id: workspace_id });
  const workspaces = createQuery(api.project.get, { workspace_id });

  const state = makeAutoObservable({
    isOpen: false,

    setIsOpen: (value: boolean) => (state.isOpen = value),
  });

  return (
    <Container maxWidth="1600px" px={0}>
      <Grid p={4} gap={6}>
        <Timeline />

        <Grid gridTemplateColumns={4}>
          <For each={workspaces.data}>
            {(project) => (
              <A href={`/app/workspace/${workspace_id}/project/${project._id}`}>
                <ProjectCard project={project} />
              </A>
            )}
          </For>
          <div>
            <Modal.Root>
              <Modal.Trigger>
                <Button>
                  <i class="fas fa-plus" /> Create New Project
                </Button>
              </Modal.Trigger>
              <Modal.Content title="Creating New Project" w="500px">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const values = Object.fromEntries(formData) as any;

                    await Convex.mutation(api.project.create, {
                      workspace_id: workspace_id,
                      name: values.name,
                    });

                    form.reset();

                    // Close Modal
                  }}
                >
                  <VStack alignItems="stretch">
                    <FormGroup label="Name">
                      <TextInput name="name" variant="filled" />
                    </FormGroup>
                    <HStack justify="end">
                      <Button>Cancel</Button>
                      <Button variant="solid">Create</Button>
                    </HStack>
                  </VStack>
                </form>
              </Modal.Content>
            </Modal.Root>
          </div>
        </Grid>

        <Grid gridAutoFlow="column" justifyContent="start">
          <TextInput />
          <TextInput variant="filled" />
          <Button variant="filled">Filled Style</Button>
          <Button variant="solid">Solid Style</Button>
          <Button
            onClick={() =>
              ToasterController.create({
                title: "Toast Title",
                description: "Toast Description",
                type: "info",
              })
            }
          >
            Test Toast
          </Button>
        </Grid>
        <ToasterManager />
      </Grid>
    </Container>
  );
};

const Layout = styled("div", {
  base: {
    display: "grid",
    gap: 3,
    gridTemplateColumns: 4,
  },
});
