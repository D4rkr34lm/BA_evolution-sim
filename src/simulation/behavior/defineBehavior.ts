// Required actions
// Context => readonly
// Use wrapped actions ? => yes to abstract away giving context and building in actions results => translate to non seperated error code system

import { AgentContext, Phenotype } from "..";
import { ActionName, ActionParams } from "../actions/definitions";
import { Directions } from "../position";

interface BehaviorDefinition<
  TName extends string,
  TRequiredActions extends ActionName[],
  TAvailableActions extends ActionName = TRequiredActions[number],
> {
  name: TName;
  requiredActions: TRequiredActions;
  decideAction: (
    phenotype: Phenotype,
    context: AgentContext,
    actions: {
      [TActionName in TAvailableActions]: {
        canExecute: (
          ...args: ActionParams<TActionName> extends never
            ? []
            : [params: ActionParams<TActionName>]
        ) => boolean;
      };
    },
  ) => {
    [ActionName in TAvailableActions]: ActionParams<ActionName> extends never
      ? { name: ActionName }
      : {
          name: ActionName;
          params: ActionParams<ActionName>;
        };
  }[TAvailableActions];
}

// Action params are missing

function defineBehavior<
  TName extends string,
  TRequiredActions extends ActionName[],
  TAvailableActions extends ActionName = TRequiredActions[number],
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
      [ActionName in TAvailableActions]: {
        canExecute: (
          ...args: ActionParams<ActionName> extends never
            ? []
            : [params: ActionParams<ActionName>]
        ) => boolean;
      };
    },
  ) => {
    [ActionName in TAvailableActions]: ActionParams<ActionName> extends never
      ? { name: ActionName }
      : {
          name: ActionName;
          params: ActionParams<ActionName>;
        };
  }[TAvailableActions];
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
      return { name: "eat" };
    } else if (actions.reproduce.canExecute()) {
      return { name: "reproduce" };
    } else if (actions.move.canExecute(Directions.Down)) {
      return { name: "move", params: Directions.Down };
    } else {
      throw new Error("No action can be executed");
    }
  },
});
