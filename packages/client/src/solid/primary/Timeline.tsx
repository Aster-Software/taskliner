import { css } from "@style/css";
import { DateTime } from "luxon";

export const Timeline = () => {
  const start = DateTime.now().startOf("year");
  const end = DateTime.now().startOf("year").plus({ year: 1 });

  const length = end.toSeconds() - start.toSeconds();

  return (
    <div
      class={css({
        bg: "white",
        border: "1px solid {colors.border}",
        rounded: "sm",
        p: 4,
      })}
    >
      {length}
    </div>
  );
};
