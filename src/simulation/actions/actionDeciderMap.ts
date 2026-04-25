import { mapValues } from "lodash-es";
import { Result, ok, err } from "neverthrow";
import { AgentContext } from "../agentContext";
import { ActionDecisionFromAction } from "../behavior/defineBehavior";
import { ActionError } from "./actionErrors";
import { Action } from "./defineAction";

export type EnrichedActionDeciderMap<
  TActionMap extends Record<string, Action>,
> = {
  [TActionName in keyof TActionMap]: {
    canExecute: (
      ...params: TActionMap[TActionName] extends Action<infer _, infer TParams>
        ? [TParams] extends [never]
          ? []
          : [args: TParams]
        : never
    ) => Result<ActionDecisionFromAction<TActionMap[TActionName]>, ActionError>;
  };
};

export function buildEnrichedActionDeciderMap<
  TActionMap extends Record<string, Action>,
>(
  actionMap: TActionMap,
  agentContext: AgentContext,
): EnrichedActionDeciderMap<TActionMap> {
  return mapValues(actionMap, (action) => {
    const canExecute = (params: never) => {
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
