import { ok } from "neverthrow";
import { defineAction } from "../defineAction";

export const noopActionDefinition = defineAction({
  name: "noop",
  buildAction: () => {
    return () => ok({});
  },
});

export function noop() {
  return { name: noopActionDefinition.name };
}
