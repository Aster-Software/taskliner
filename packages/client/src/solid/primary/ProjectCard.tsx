import { styled } from "@style/jsx";
import type { Doc } from "../../../../api/convex/_generated/dataModel";

export const ProjectCard = (props: { project: Doc<"project"> }) => {
  return (
    <Project>
      <div>{props.project.name}</div>
      <div>{props.project.datetime_start}</div>
      <div>{props.project.datetime_end}</div>
    </Project>
  );
};

const Project = styled("div", {
  base: {
    p: 3,
    bg: "background",
    rounded: "sm",
    _hover: {
      bg: "background_hover",
    },
  },
});
