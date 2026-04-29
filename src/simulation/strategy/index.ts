import { BehaviorName } from "../behavior/definitions";
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
    id: "eat",
    behaviorToExecute: "search-and-consume-food",
  };

  return {
    currentState: initialState,
    states: [initialState],
  };
}
