import { Index, Portal } from "solid-js/web";
import { DatePicker as ArkDatePicker } from "@ark-ui/solid";
import { IconButton } from "./IconButton";
import { css } from "@style/css";
import { Center } from "@style/jsx";
import { DateTime } from "luxon";

const styles = css({
  '& [data-part="input"]': {
    xComponent: true,
    xSubtleFocus: true,
  },
  '& [data-part="clear-trigger"]': {
    position: "absolute",
    top: "50%",
    right: "3rem",
    transform: "translateY(-50%)",
    w: 6,
    h: 6,
    cursor: "pointer",
  },
  '& [data-part="content"]': {
    bg: "white",
    border: "subtle",
    p: 4,
    w: 300,
    userSelect: "none",
  },
  '& [data-part="control"]': {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 1,
  },

  '& [data-part="view-control"]': {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    h: 8,
    my: 2,
  },
  '& [data-part="view-trigger"]': { cursor: "pointer", rounded: "sm" },
  '& [data-part="view-trigger"]:hover': { bg: "t04" },
  '& [data-part="prev-trigger"]': { w: 8, cursor: "pointer", rounded: "sm" },
  '& [data-part="prev-trigger"]:hover': { bg: "t04" },
  '& [data-part="next-trigger"]': { w: 8, cursor: "pointer", rounded: "sm" },
  '& [data-part="next-trigger"]:hover': { bg: "t04" },

  '& [data-part="table"]': { tableLayout: "fixed", w: "100%" },
  '& [data-part="table-head"]': { fontSize: "xs", h: 10 },
  '& [data-part="table-row"]': {},
  '& [data-part="table-cell"]': { textAlign: "center", h: 8, fontSize: "sm" },
  '& [data-part="table-cell-trigger"]': {
    w: "100%",
    h: "100%",
    rounded: "sm",
  },
  '& [data-part="table-cell-trigger"]:hover:not([data-disabled])': {
    cursor: "pointer",
    bg: "t04",
  },
  '& [data-part="table-cell-trigger"][data-disabled]': {
    color: "disabled_text",
  },
  '& [data-part="table-cell-trigger"][data-selected]': {
    bg: "skyblue / 15",
  },
  '& [data-part="table-cell-trigger"][data-today]': {
    color: "#cc0000",
    fontWeight: "bold",
  },

  '& [data-part=""]': {},
});

export const DatePicker = (props: {
  value?: string;
  onChange?: (value: string) => void;
}) => {
  return (
    <ArkDatePicker.Root
      class={styles}
      value={props.value ? [props.value] : undefined}
      positioning={{ placement: "bottom-end" }}
      format={(date) =>
        DateTime.fromISO(date.toString()).toLocaleString(DateTime.DATE_FULL)
      }
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      onValueChange={(e) => props.onChange?.(e.valueAsString[0])}
    >
      {/* <ArkDatePicker.Label>Label</ArkDatePicker.Label> */}

      <ArkDatePicker.Control>
        <ArkDatePicker.Input />
        <ArkDatePicker.Trigger>
          <IconButton class="fas fa-calendar" />
        </ArkDatePicker.Trigger>
        <ArkDatePicker.ClearTrigger>
          <i class="fas fa-close" />
        </ArkDatePicker.ClearTrigger>
      </ArkDatePicker.Control>

      <Portal>
        <ArkDatePicker.Positioner class={styles}>
          <ArkDatePicker.Content>
            {/* <ArkDatePicker.YearSelect /> */}
            {/* <ArkDatePicker.MonthSelect /> */}
            <ArkDatePicker.View view="day">
              <ArkDatePicker.Context>
                {(context) => (
                  <>
                    <ArkDatePicker.ViewControl>
                      <ArkDatePicker.PrevTrigger>
                        <i class="fas fa-chevron-left" />
                      </ArkDatePicker.PrevTrigger>
                      <ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.RangeText />
                      </ArkDatePicker.ViewTrigger>
                      <ArkDatePicker.NextTrigger>
                        <i class="fas fa-chevron-right" />
                      </ArkDatePicker.NextTrigger>
                    </ArkDatePicker.ViewControl>

                    <ArkDatePicker.Table>
                      <ArkDatePicker.TableHead>
                        <ArkDatePicker.TableRow>
                          <Index each={context().weekDays}>
                            {(weekDay) => (
                              <ArkDatePicker.TableHeader>
                                {weekDay().short}
                              </ArkDatePicker.TableHeader>
                            )}
                          </Index>
                        </ArkDatePicker.TableRow>
                      </ArkDatePicker.TableHead>

                      <ArkDatePicker.TableBody>
                        <Index each={context().weeks}>
                          {(week) => (
                            <ArkDatePicker.TableRow>
                              <Index each={week()}>
                                {(day) => (
                                  <ArkDatePicker.TableCell value={day()}>
                                    <ArkDatePicker.TableCellTrigger>
                                      <Center h="100%">{day().day}</Center>
                                    </ArkDatePicker.TableCellTrigger>
                                  </ArkDatePicker.TableCell>
                                )}
                              </Index>
                            </ArkDatePicker.TableRow>
                          )}
                        </Index>
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>

            <ArkDatePicker.View view="month">
              <ArkDatePicker.Context>
                {(context) => (
                  <>
                    <ArkDatePicker.ViewControl>
                      <ArkDatePicker.PrevTrigger>
                        <i class="fas fa-chevron-left" />
                      </ArkDatePicker.PrevTrigger>
                      <ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.RangeText />
                      </ArkDatePicker.ViewTrigger>
                      <ArkDatePicker.NextTrigger>
                        <i class="fas fa-chevron-right" />
                      </ArkDatePicker.NextTrigger>
                    </ArkDatePicker.ViewControl>

                    <ArkDatePicker.Table>
                      <ArkDatePicker.TableBody>
                        <Index
                          each={context().getMonthsGrid({
                            columns: 4,
                            format: "short",
                          })}
                        >
                          {(months) => (
                            <ArkDatePicker.TableRow>
                              <Index each={months()}>
                                {(month) => (
                                  <ArkDatePicker.TableCell
                                    value={month().value}
                                  >
                                    <ArkDatePicker.TableCellTrigger>
                                      <Center h="100%">{month().label}</Center>
                                    </ArkDatePicker.TableCellTrigger>
                                  </ArkDatePicker.TableCell>
                                )}
                              </Index>
                            </ArkDatePicker.TableRow>
                          )}
                        </Index>
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>

            <ArkDatePicker.View view="year">
              <ArkDatePicker.Context>
                {(context) => (
                  <>
                    <ArkDatePicker.ViewControl>
                      <ArkDatePicker.PrevTrigger>
                        <i class="fas fa-chevron-left" />
                      </ArkDatePicker.PrevTrigger>
                      <ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.RangeText />
                      </ArkDatePicker.ViewTrigger>
                      <ArkDatePicker.NextTrigger>
                        <i class="fas fa-chevron-right" />
                      </ArkDatePicker.NextTrigger>
                    </ArkDatePicker.ViewControl>

                    <ArkDatePicker.Table>
                      <ArkDatePicker.TableBody>
                        <Index each={context().getYearsGrid({ columns: 4 })}>
                          {(years) => (
                            <ArkDatePicker.TableRow>
                              <Index each={years()}>
                                {(year) => (
                                  <ArkDatePicker.TableCell value={year().value}>
                                    <ArkDatePicker.TableCellTrigger>
                                      <Center h="100%">{year().label}</Center>
                                    </ArkDatePicker.TableCellTrigger>
                                  </ArkDatePicker.TableCell>
                                )}
                              </Index>
                            </ArkDatePicker.TableRow>
                          )}
                        </Index>
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  );
};
