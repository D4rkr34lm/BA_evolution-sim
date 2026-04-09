// Required actions
// Context => readonly
// Use wrapped actions ? => yes to abstract away giving context and building in actions results => translate to non seperated error code system

import { hasNoValue } from "@/utils/typeGuards";
import { DefinedActionMap } from "../actions/definitions";
import { Directions } from "../position";
import { AgentContext } from "../agentContext";
import { Phenotype } from "../genetics/phenotype";
import { Action, EnrichedActionDeciderMap } from "../actions/defineAction";

export type DecidedActionFromAction<
  TAction extends Action,
  TName = TAction["name"],
  TParams = Parameters<TAction["execute"]>[1],
> = [TParams] extends [never]
  ? { name: TName }
  : { name: TName; params: TParams };

type DecidedAction<TActionMap extends Record<string, Action>> = {
  [TActionName in keyof TActionMap]: DecidedActionFromAction<
    TActionMap[TActionName]
  >;
}[keyof TActionMap];

interface BehaviorDefinition<TName extends string> {
  name: TName;
  decideAction: (
    phenotype: Phenotype,
    context: AgentContext,
    actions: EnrichedActionDeciderMap<DefinedActionMap>,
  ) => DecidedAction<DefinedActionMap>;
}

// Action params are missing

function defineBehavior<TName extends string>({
  name,
  decideAction,
}: {
  name: TName;
  decideAction: (
    phenotype: Phenotype,
    context: AgentContext,
    actions: EnrichedActionDeciderMap<DefinedActionMap>,
  ) => DecidedAction<DefinedActionMap>;
}): BehaviorDefinition<TName> {
  return {
    name,
    decideAction,
  };
}

const defaultTestBehavior = defineBehavior({
  name: "defaultTestBehavior",
  decideAction: (phenotype, context, actions) => {
    const moveDecisionResult = actions.move.canExecute(Directions.Up);

    if (moveDecisionResult.isOk()) {
      return moveDecisionResult.value;
    } else {
      throw new Error("TODO implement more / fallback / noop action");
    }
  },
});

export const definedBehaviors = [defaultTestBehavior];

export function getDefinedBehavior(name: BehaviorName) {
  const behavior = definedBehaviors.find((behavior) => behavior.name === name);

  if (hasNoValue(behavior)) {
    // TODO remove dead path
    throw new Error(`Behavior with name ${name} not found`);
  }

  return behavior;
}

export type DefinedBehavior = (typeof definedBehaviors)[number];

export type BehaviorName = DefinedBehavior["name"];
