import { styled } from "@style/jsx";
import type { Doc } from "../../../../api/convex/_generated/dataModel";
import { Panel } from "../components/Panel";

export const ProjectCard = (props: { project: Doc<"project"> }) => {
  return (
    <Panel height="150px" xComponentClickable>
      <styled.h3>{props.project.name}</styled.h3>
      <div>{props.project.datetime_start}</div>
      <div>{props.project.datetime_end}</div>
    </Panel>
  );
};
