import { hasValue } from "@/utils/typeGuards";
import { Vec2 } from "./position";
import { zip } from "lodash-es";

const AGENT_ENERGY_CAPACITY = 25;
const AGENT_REPRODUCTION_COST = 15;

interface Phenotype {
  energyCapacity: number;
  reproductionCost: number;
}

function getAgentPhenotype(): Phenotype {
  return {
    energyCapacity: AGENT_ENERGY_CAPACITY,
    reproductionCost: AGENT_REPRODUCTION_COST,
  };
}

interface Agent {
  phenotype: Phenotype;

  position: Vec2;
  currentEnergy: number;
}

const FOOD_BASE_ENERGY = 5;
const FOOD_RECOVERY_RATE = 25;

interface FoodSource {
  position: Vec2;
  recoveryRate: number;
  ticksTillRecovery: number;

  baseEnergy: number;
}

const SIMULATION_WORLD_SIZE: Vec2 = { x: 50, y: 50 };
const SIMULATION_FOOD_AMOUNT = 10;
const SIMULATION_INITIAL_AGENT_COUNT = 2;

interface Simulation {
  foodSources: FoodSource[];
  agents: Agent[];
}

function getUniqueRandomArray({
  amount,
  max,
}: {
  amount: number;
  max: number;
}) {
  if (amount > max) {
    throw new Error(
      `Size may not excide max number size found: size:${amount} max:${max}`,
    );
  }

  const randoms = new Set<number>();

  while (randoms.size < amount) {
    randoms.add(Math.floor(Math.random() * max));
  }

  return Array.from(randoms);
}

function getUniqueRandomPostions({
  amount,
  max,
}: {
  amount: number;
  max: Vec2;
}) {
  const xPositions = getUniqueRandomArray({ amount, max: max.x });
  const yPositions = getUniqueRandomArray({ amount, max: max.y });

  return zip(xPositions, yPositions)
    .filter(
      (pos): pos is [number, number] => hasValue(pos[0]) && hasValue(pos[1]),
    )
    .map(([x, y]) => ({ x, y }));
}

function spawnFoodSources({
  worldSize,
  amount,
}: {
  worldSize: Vec2;
  amount: number;
}): FoodSource[] {
  const sourcePositions = getUniqueRandomPostions({
    amount,
    max: worldSize,
  });

  return sourcePositions.map((pos) => ({
    position: pos,
    recoveryRate: FOOD_RECOVERY_RATE,
    ticksTillRecovery: 0,
    baseEnergy: FOOD_BASE_ENERGY,
  }));
}

function spawnAgent({ position }: { position: Vec2 }): Agent {
  const agentPhenotype = getAgentPhenotype();

  return {
    phenotype: agentPhenotype,
    position,
    currentEnergy: agentPhenotype.energyCapacity,
  };
}

function spawnAgents({
  worldSize,
  amount,
}: {
  worldSize: Vec2;
  amount: number;
}): Agent[] {
  const agentPositions = getUniqueRandomPostions({
    max: worldSize,
    amount,
  });

  return agentPositions.map((pos) => spawnAgent({ position: pos }));
}

function generateNewSimulation(): Simulation {
  const foodSources = spawnFoodSources({
    worldSize: SIMULATION_WORLD_SIZE,
    amount: SIMULATION_FOOD_AMOUNT,
  });

  const initialAgents = spawnAgents({
    worldSize: SIMULATION_WORLD_SIZE,
    amount: SIMULATION_INITIAL_AGENT_COUNT,
  });

  return {
    foodSources,
    agents: initialAgents,
  };
}

function runSimulation(simulation: Simulation) {}
