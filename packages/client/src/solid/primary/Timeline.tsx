import { css } from "@style/css";
import { styled } from "@style/jsx";
import { DateTime } from "luxon";
import { For } from "solid-js";

export const Timeline = () => {
  const start = DateTime.now().startOf("year");
  const end = DateTime.now().startOf("year").plus({ year: 1 });

  const startSeconds = start.toSeconds();
  const endSeconds = end.toSeconds();
  const length = endSeconds - startSeconds;

  const items = [
    { datetime: "2024-01-01" },
    { datetime: "2024-02-01" },
    { datetime: "2024-03-01" },
    { datetime: "2024-04-01" },
    { datetime: "2024-05-01" },
    { datetime: "2024-06-01" },
    { datetime: "2024-07-01" },
    { datetime: "2024-08-01" },
    { datetime: "2024-09-01" },
    { datetime: "2024-10-01" },
    { datetime: "2024-11-01" },
    { datetime: "2024-12-01" },
    { datetime: "2025-01-01" },
  ];

  const others = [
    { datetime: "2024-07-01" },
    { datetime: "2024-08-01" },
    { datetime: "2024-09-01" },
    { datetime: "2024-10-01" },
    { datetime: "2024-11-01" },

    { datetime: "2024-02-01" },
    { datetime: "2024-03-01" },
    { datetime: "2024-04-01" },
    { datetime: "2024-05-01" },
    { datetime: "2024-06-01" },
    { datetime: "2024-07-01" },
    { datetime: "2024-08-01" },
    { datetime: "2024-09-01" },
    { datetime: "2024-10-01" },
  ];

  const getPosition = (datetime: string) => {
    return (DateTime.fromISO(datetime).toSeconds() - startSeconds) / length;
  };

  const getPercent = (p: number) => {
    return `${p * 100}%`;
  };

  return (
    <styled.div xPanel position="relative" height="200px">
      <For each={items}>
        {(entry) => (
          <styled.div
            position="absolute"
            width={1}
            height={6}
            bg="violet"
            transform="translateX(-50%)"
            style={{
              left: `${getPosition(entry.datetime) * 100}%`,
            }}
          ></styled.div>
        )}
      </For>

      <For each={others}>
        {(entry) => (
          <styled.div
            position="absolute"
            width={10}
            height={4}
            bg="black"
            // transform="translateX(-50%)"
            style={{
              top: getPercent(Math.random()),
              left: getPercent(getPosition(entry.datetime)),
            }}
          ></styled.div>
        )}
      </For>

      {length}
    </styled.div>
  );
};
