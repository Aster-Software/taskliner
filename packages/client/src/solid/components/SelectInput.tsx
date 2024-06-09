import { For } from "solid-js";
import { Portal } from "solid-js/web";
import { Combobox } from "@ark-ui/solid";
import { css } from "@style/css";
import { Float } from "@style/jsx";

const styles = css({
  '& [data-part="control"]': {
    position: "relative",
  },
  '& [data-part="input"]': {
    xComponent: true,
    xSubtleFocus: true,
  },
  '& [data-part="content"]': {
    xPanel: true,
  },
  '& [data-part="item"]': {
    xComponent: true,
    border: "none",

    display: "grid",
    gridTemplateColumns: "[minmax(0, 1fr) auto]",
  },
  '& [aria-selected="true"]': {
    cursor: "pointer",
    bg: "canvas_hover",
  },
  '& [aria-disabled="true"]': {
    opacity: "disabled",
  },
});

export const SelectInput = <T extends { value: string; label: string }>(props: {
  options: T[];
}) => {
  return (
    <Combobox.Root
      items={props.options}
      class={styles}
      openOnClick
      placeholder="Select..."
    >
      <Combobox.Control>
        <Combobox.Input />

        <Float
          placement="middle-end"
          offset="4"
          color="indicator"
          fontSize="sm"
        >
          <i class="fas fa-xs fa-angles-up-down" />
        </Float>

        {/* Add Clearable Later */}
        {/* <Float placement="middle-end">
          <Combobox.ClearTrigger>Clear</Combobox.ClearTrigger>
        </Float> */}
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner class={styles}>
          <Combobox.Content>
            <Combobox.ItemGroup>
              {/* Add groups later */}
              {/* <Combobox.ItemGroupLabel>Frameworks</Combobox.ItemGroupLabel> */}
              <For each={props.options}>
                {(item) => (
                  <Combobox.Item item={item}>
                    <Combobox.ItemText>{item.label}</Combobox.ItemText>
                    <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </For>
            </Combobox.ItemGroup>
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};
