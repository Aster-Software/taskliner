// Enable MobX
import { Reaction, untracked } from "mobx";
import { enableExternalSource } from "solid-js";

export const enableMobXWithSolidJS = () => {
  let id = 0;
  enableExternalSource((fn, trigger) => {
    const reaction = new Reaction(`externalSource@${++id}`, trigger);
    return {
      track: (x) => {
        let next;
        reaction.track(() => (next = fn(x)));
        return next;
      },
      dispose: () => {
        reaction.dispose();
      },
    };
  }, untracked);
};
