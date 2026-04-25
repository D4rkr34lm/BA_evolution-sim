import { Agent } from "./agent/agent";
import { AgentState } from "./agent/state";
import { FoodSource } from "./foodSource";
import { Vec2 } from "./position";
import { Simulation } from "./running";

export interface AgentSnapshot {
  id: string;
  state: AgentState;
}

function recordAgentSnapshot(agent: Agent): AgentSnapshot {
  return {
    id: agent.id,
    state: agent.state,
  };
}

function recordFoodSourceSnapshot(foodSource: FoodSource): FoodSourceSnapshot {
  return {
    id: foodSource.id,
    position: foodSource.position,
  };
}

export interface FoodSourceSnapshot {
  id: string;
  position: Vec2;
}

export type EntitySnapshot = AgentSnapshot | FoodSourceSnapshot;

export function recordSimulationSnapshot(
  tick: number,
  simulation: Simulation,
): SimulationSnapshot {
  return {
    tick,
    agents: simulation.agents.map(recordAgentSnapshot),
    foodSources: simulation.foodSources.map(recordFoodSourceSnapshot),
  };
}

export interface SimulationSnapshot {
  tick: number;
  agents: AgentSnapshot[];
  foodSources: FoodSourceSnapshot[];
}
