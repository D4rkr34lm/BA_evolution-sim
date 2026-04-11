import { uid } from "uid";
import { DefinedActionMap, definedActions } from "../actions/definitions";
import { getAgentPhenotype, Phenotype } from "../genetics/phenotype";
import { Vec2 } from "../position";
import { getAgentStrategy, Strategy } from "../strategy";
import { AgentState, getInitialAgentState } from "./state";
import { buildActionMap } from "../actions/actionMap";

export interface Agent {
  id: string;
  phenotype: Phenotype;
  strategy: Strategy;
  actionMap: DefinedActionMap;
  state: AgentState;
}

export function spawnAgent({ position }: { position: Vec2 }): Agent {
  const id = uid();

  const phenotype = getAgentPhenotype();

  const strategy = getAgentStrategy(phenotype);
  const actionMap = buildActionMap(definedActions, phenotype);
  const state = getInitialAgentState({
    position,
    phenotype: phenotype,
  });

  return {
    id,
    phenotype,
    actionMap,
    strategy,
    state,
  };
}
