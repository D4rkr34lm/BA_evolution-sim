import { err, ok, Result } from "neverthrow";
import { ActionError } from "./actionErrors";
import { keyBy, mapValues } from "lodash-es";
import { AgentContext } from "../agentContext";
import { Phenotype } from "../genetics/phenotype";
import { DecidedActionFromAction } from "../behavior/defineBehavior";

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

export type ActionMap<TActionDefinitions extends ActionDefinition[]> = {
  [TActionDefinition in TActionDefinitions[number] as TActionDefinition["name"]]: ReturnType<
    TActionDefinition["buildAction"]
  >;
};

export function buildActionMap<TDefinedActions extends ActionDefinition[]>(
  actionDefinitions: TDefinedActions,
  phenotype: Phenotype,
): ActionMap<TDefinedActions> {
  const buildActions = actionDefinitions.map((def) =>
    def.buildAction(phenotype),
  );

  return keyBy(
    buildActions,
    (action) => action.name,
  ) as ActionMap<TDefinedActions>;
}

export type EnrichedActionDeciderMap<
  TActionMap extends Record<string, Action>,
> = {
  [TActionName in keyof TActionMap]: {
    // TODO this should probably be a factory or return a rexecutor function so that behaviors can only decide for runnable actions
    canExecute: (
      ...params: TActionMap[TActionName] extends Action<infer _, infer TParams>
        ? [TParams] extends [never]
          ? []
          : [args: TParams]
        : never
    ) => Result<DecidedActionFromAction<TActionMap[TActionName]>, ActionError>;
  };
};

export function buildEnrichedActionDeciderMap<
  TActionMap extends Record<string, Action>,
>(
  actionMap: TActionMap,
  agentContext: AgentContext,
): EnrichedActionDeciderMap<TActionMap> {
  return mapValues(actionMap, (action) => {
    const canExecute = (...params: never) => {
      const result = action.execute(agentContext, params);

      if (result.isOk()) {
        return ok({
          name: action.name,
          params,
        });
      } else {
        return err(result.error);
      }
    };

    return {
      canExecute,
    };
  }) as unknown as EnrichedActionDeciderMap<TActionMap>;
}
