import { Grid, styled } from "@style/jsx";
import { FormGroup } from "../components/FormGroup";
import { TextInput } from "../components/TextInput";
import { Form } from "../components/Form";
import type { Doc } from "../../../../api/convex/_generated/dataModel";
import { makeAutoObservable } from "mobx";
import { clone } from "merge";
import { Debouncer } from "../components/Debouncer";
import { Convex } from "../utilities/ConvexUtils";
import { api } from "../../../../api/convex/_generated/api";

export const TaskSettingsForm = (props: { task: Doc<"task"> }) => {
  const state = makeAutoObservable({
    internal: clone(props.task),

    setName: (value: string) => (state.internal.name = value),
    setDescription: (value: string) => (state.internal.description = value),
    setStatus: (value: string) => (state.internal.status = value),
    setDate: (value: number) => (state.internal.datetime_end = value),
  });

  return (
    <styled.div display="grid" gap={4}>
      <Debouncer
        value={state.internal.name}
        onChange={(v) =>
          Convex.mutation(api.task.update, {
            workspace_id: props.task.workspace_id,
            task_id: props.task._id,
            name: v,
          })
        }
      >
        {(d) => (
          <TextInput
            placeholder="Task Name..."
            value={d.value}
            onInput={(e) => d.change(e.target.value)}
          />
        )}
      </Debouncer>
      <TextInput
        placeholder="Task Description..."
        value={state.internal.description}
      />
    </styled.div>
  );
};
