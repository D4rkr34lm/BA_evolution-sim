// Required actions
// Context => readonly
// Use wrapped actions ? => yes to abstract away giving context and building in actions results => translate to non seperated error code system

import { hasNoValue } from "@/utils/typeGuards";
import { ACTION_OK, ActionResult } from "../actions/actionErrors";
import { ActionName, ActionParams } from "../actions/definitions";
import { Directions } from "../position";
import { AgentContext } from "../agentContext";
import { Phenotype } from "../genetics/phenotype";

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
        ) => ActionResult;
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
        ) => ActionResult;
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
    if (actions.eat.canExecute() === ACTION_OK) {
      return { name: "eat" };
    } else if (actions.reproduce.canExecute() === ACTION_OK) {
      return { name: "reproduce" };
    } else if (actions.move.canExecute(Directions.Down) === ACTION_OK) {
      return { name: "move", params: Directions.Down };
    } else {
      throw new Error("No action can be executed");
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
