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
import { Form } from "../components/Form";
import { TaskCard } from "./TaskCard";
import { Kanban } from "./Kanban";
import { KanbanV2 } from "./KanbanV2";

export const AppWorkspacePage = () => {
  const params = useParams();
  const workspace_id = params.workspace_id as Id<"workspace">;

  const workspace = createQuery(api.workspace.one, { id: workspace_id });
  const projects = createQuery(api.project.get, { workspace_id });
  const tasks = createQuery(api.task.get, { workspace_id });

  const state = makeAutoObservable({
    isOpen: false,

    setIsOpen: (value: boolean) => (state.isOpen = value),
  });

  return (
    <Container maxWidth="1600px" px={0}>
      <Grid p={4} gap={6}>
        <Timeline />
        <KanbanV2 />

        {/* Projects */}
        <Grid gridTemplateColumns={4}>
          <For each={projects.data}>
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
                <Form
                  onSubmit={async (e) => {
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
                  <FormGroup label="Name">
                    <TextInput name="name" />
                  </FormGroup>

                  <Form.Footer>
                    <Form.CancelButton></Form.CancelButton>
                    <Form.SubmitButton></Form.SubmitButton>
                  </Form.Footer>
                </Form>
              </Modal.Content>
            </Modal.Root>
          </div>
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
