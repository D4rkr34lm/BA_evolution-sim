import { Result } from "neverthrow";
import { Agent, FoodSource, Phenotype } from "..";
import { ActionError } from "./actionErrors";

interface AgentContext {
  me: Agent;
  otherAgents: Agent[];
  foodSources: FoodSource[];
}

interface Action<TName extends string, TActionParams> {
  name: TName;
  execute: (
    context: AgentContext,
    params: TActionParams,
  ) => Result<Partial<AgentContext>, ActionError>;
}

interface ActionDefinition<TName extends string, TActionParams> {
  name: TName;
  buildAction: (phenotype: Phenotype) => Action<TName, TActionParams>;
}

export function defineAction<TName extends string, TActionParams = unknown>({
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
