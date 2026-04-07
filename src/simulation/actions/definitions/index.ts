import { Phenotype } from "@/simulation";
import { eatActionDefinition } from "./eat";
import { moveActionDefinition } from "./move";
import { reproduceActionDefinition } from "./reproduce";
import { Action } from "../defineAction";

export const definedActions = [
  moveActionDefinition,
  reproduceActionDefinition,
  eatActionDefinition,
] as const;

export type DefinedAction = (typeof definedActions)[number];

export type ActionName = DefinedAction["name"];

export type ActionParams<TActionName extends ActionName> =
  Extract<DefinedAction, { name: TActionName }> extends {
    buildAction: (phenotype: Phenotype) => Action<TActionName, infer TParams>;
  }
    ? TParams
    : never;
