// Required actions
// Context => readonly
// Use wrapped actions ? => yes to abstract away giving context and building in actions results => translate to non seperated error code system

import { AgentContext, Phenotype } from "..";
import { ActionName } from "../actions/definitions";

interface BehaviorDefinition<
  TName extends string,
  TRequiredActions extends ActionName[],
  TAvailableActions extends string = TRequiredActions[number],
> {
  name: TName;
  requiredActions: TRequiredActions;
  decideAction: (
    phenotype: Phenotype,
    context: AgentContext,
    actions: {
      [ActionName in TAvailableActions]: { canExecute: () => boolean };
    },
  ) => TAvailableActions;
}

// ACtion params are missing

function defineBehavior<
  TName extends string,
  TRequiredActions extends ActionName[],
  TAvailableActions extends string = TRequiredActions[number],
>({
  name,
  requiredActions,
  decideAction,
}: {
  name: TName;
  requiredActions: TRequiredActions;
  decideAction: (
    phenotype: Phenotype,
    context: AgentContext,
    actions: {
      [ActionName in TAvailableActions]: { canExecute: () => boolean };
    },
  ) => TAvailableActions;
}): BehaviorDefinition<TName, TRequiredActions, TAvailableActions> {
  return {
    name,
    requiredActions,
    decideAction,
  };
}

const defaultTestBehavior = defineBehavior({
  name: "defaultTestBehavior",
  requiredActions: ["move", "reproduce", "eat"],
  decideAction: (phenotype, context, actions) => {
    if (actions.eat.canExecute()) {
      return "eat";
    } else if (actions.reproduce.canExecute()) {
      return "reproduce";
    } else if (actions.move.canExecute()) {
      return "move";
    } else {
      throw new Error("No action can be executed");
    }
  },
});
