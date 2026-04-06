import { AgentContext, Phenotype } from "..";
import { BehaviorName } from "../behavior/defineBehavior";

export interface StrategyState {
  id: string;
  behaviorToExecute: BehaviorName;
}

export interface Strategy {
  currentState: StrategyState;
  states: StrategyState[];
}

export function getAgentStrategy(phenotype: Phenotype): Strategy {
  const initialState: StrategyState = {
    id: "default",
    behaviorToExecute: "defaultTestBehavior",
  };

  return {
    currentState: initialState,
    states: [initialState],
  };
}
