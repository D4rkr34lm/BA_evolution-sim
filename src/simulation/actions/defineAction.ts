import { Result } from "neverthrow";
import { ActionError } from "./actionErrors";
import { AgentContext } from "../agentContext";
import { Phenotype } from "../genetics/phenotype";

export interface Action<TName extends string = string, TActionParams = never> {
  name: TName;
  execute: (
    context: AgentContext,
    params: TActionParams,
  ) => Result<Partial<AgentContext>, ActionError>;
}

export interface ActionDefinition<
  TName extends string = string,
  TActionParams = never,
> {
  name: TName;
  buildAction: (phenotype: Phenotype) => Action<TName, TActionParams>;
}

export function defineAction<TName extends string, TActionParams = never>({
  name,
  buildAction,
}: {
  name: TName;
  buildAction: (
    phenotype: Phenotype,
  ) => Action<TName, TActionParams>["execute"];
}): ActionDefinition<TName, TActionParams> {
  return {
    name,
    buildAction: (phenotype) => ({
      name,
      execute: buildAction(phenotype),
    }),
  };
}
