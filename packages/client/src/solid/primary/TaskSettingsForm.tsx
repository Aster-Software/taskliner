import { Grid, styled } from "@style/jsx";
import { FormGroup } from "../components/FormGroup";
import { TextInput } from "../components/TextInput";
import { Form } from "../components/Form";

export const TaskSettingsForm = () => {
  return (
    <Form>
      <Form.Title>Task Settings</Form.Title>
      <FormGroup label="Task Name">
        <TextInput placeholder="Task Name..." />
      </FormGroup>

      <Form.Footer>
        <Form.CancelButton></Form.CancelButton>
        <Form.SubmitButton></Form.SubmitButton>
      </Form.Footer>
    </Form>
  );
};
