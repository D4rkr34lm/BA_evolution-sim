import {
  AGENT_ENERGY_CAPACITY,
  AGENT_REPRODUCTION_COST,
  AGENT_MOVE_COST,
} from "../constants";

export interface Phenotype {
  energyCapacity: number;
  reproductionCost: number;
  moveCost: number;
}

export function getAgentPhenotype(): Phenotype {
  return {
    energyCapacity: AGENT_ENERGY_CAPACITY,
    reproductionCost: AGENT_REPRODUCTION_COST,
    moveCost: AGENT_MOVE_COST,
  };
}
