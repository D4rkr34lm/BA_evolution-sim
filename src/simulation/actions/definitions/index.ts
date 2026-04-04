import { eatActionDefinition } from "./eat";
import { moveActionDefinition } from "./move";
import { reproduceActionDefinition } from "./reproduce";

export const definedActions = [
  moveActionDefinition,
  reproduceActionDefinition,
  eatActionDefinition,
];

export type DefinedAction = (typeof definedActions)[number];

export type ActionName = DefinedAction["name"];
