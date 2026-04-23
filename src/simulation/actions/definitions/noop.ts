import { ok } from "neverthrow";
import { defineAction } from "../defineAction";

export const noopActionDefinition = defineAction({
  name: "noop",
  buildAction: () => {
    return () => ok({});
  },
});
