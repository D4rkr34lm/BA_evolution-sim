import { uid } from "uid";
import { DefinedActionMap, getDefinedActions } from "../actions/definitions";
import { getAgentPhenotype, Phenotype } from "../genetics/phenotype";
import { Vec2 } from "../position";
import { buildAgentStrategy, Strategy } from "../strategy";
import { AgentState, getInitialAgentState } from "./state";
import { buildActionMap } from "../actions/actionMap";
import { Genome } from "../genetics/genome";

export interface Agent {
  id: string;
  genome: Genome;
  phenotype: Phenotype;
  strategy: Strategy;
  actionMap: DefinedActionMap;
  state: AgentState;
}

export function spawnAgent({
  position,
  genome,
}: {
  position: Vec2;
  genome: Genome;
}): Agent {
  const id = uid();

  const phenotype = getAgentPhenotype(genome);

  const strategy = buildAgentStrategy(phenotype);
  const actionMap = buildActionMap(getDefinedActions(), phenotype);
  const state = getInitialAgentState({
    position,
    phenotype: phenotype,
  });

  return {
    id,
    genome,
    phenotype,
    actionMap,
    strategy,
    state,
  };
}

export function isDead(agent: Agent): boolean {
  return agent.state.currentEnergy <= 0;
}
