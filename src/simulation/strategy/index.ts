import { BehaviorName } from "../behavior/defineBehavior";
import { Phenotype } from "../genetics/phenotype";

export interface StrategyState {
  id: string;
  behaviorToExecute: BehaviorName;
}

export interface Strategy {
  currentState: StrategyState;
  states: StrategyState[];
}

export function getAgentStrategy(_: Phenotype): Strategy {
  const initialState: StrategyState = {
    id: "default",
    behaviorToExecute: "defaultTestBehavior",
  };

  return {
    currentState: initialState,
    states: [initialState],
  };
}
