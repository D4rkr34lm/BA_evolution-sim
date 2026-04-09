import { buildActionMap } from "../actions/defineAction";
import { DefinedActionMap, definedActions } from "../actions/definitions";
import { getAgentPhenotype, Phenotype } from "../genetics/phenotype";
import { Vec2 } from "../position";
import { getAgentStrategy, Strategy } from "../strategy";
import { AgentState } from "./state";

export interface Agent {
  phenotype: Phenotype;
  strategy: Strategy;
  actionMap: DefinedActionMap;
  state: AgentState;
}

function getInitialAgentState({
  position,
  phenotype,
}: {
  position: Vec2;
  phenotype: Phenotype;
}): AgentState {
  return {
    position,
    currentEnergy: phenotype.energyCapacity,
  };
}

export function spawnAgent({ position }: { position: Vec2 }): Agent {
  const phenotype = getAgentPhenotype();

  const strategy = getAgentStrategy(phenotype);
  const actionMap = buildActionMap(definedActions, phenotype);
  const state = getInitialAgentState({
    position,
    phenotype: phenotype,
  });

  return {
    phenotype,
    actionMap,
    strategy,
    state,
  };
}
