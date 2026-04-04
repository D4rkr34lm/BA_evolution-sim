import { hasNoValue, hasValue } from "@/utils/typeGuards";
import { addVectors, Direction, Vec2 } from "./position";
import { isEqual, partition, zip } from "lodash-es";
import { err, ok, Result } from "neverthrow";

const ACTION_ERRORS = {
  ERR_NOT_ENOUGH_ENERGY: "not-enough-energy",
  ERR_NOT_IN_RANGE: "not-in-range",
} as const;

type ActionError = (typeof ACTION_ERRORS)[keyof typeof ACTION_ERRORS];

const AGENT_ENERGY_CAPACITY = 25;
const AGENT_REPRODUCTION_COST = 15;
const AGENT_MOVE_COST = 1;

interface Phenotype {
  energyCapacity: number;
  reproductionCost: number;
  moveCost: number;
}

function getAgentPhenotype(): Phenotype {
  return {
    energyCapacity: AGENT_ENERGY_CAPACITY,
    reproductionCost: AGENT_REPRODUCTION_COST,
    moveCost: AGENT_MOVE_COST,
  };
}

interface AgentContext {
  me: Agent;
  otherAgents: Agent[];
  foodSources: FoodSource[];
}

interface Action<TName extends string, TActionParams> {
  name: TName;
  execute: (
    context: AgentContext,
    params: TActionParams,
  ) => Result<Partial<AgentContext>, ActionError>;
}

interface ActionDefinition<TName extends string, TActionParams> {
  name: TName;
  buildAction: (phenotype: Phenotype) => Action<TName, TActionParams>;
}

function defineAction<TName extends string, TActionParams = unknown>({
  name,
  buildAction,
}: {
  name: TName;
  buildAction: (
    phenotype: Phenotype,
  ) => Action<TName, TActionParams>["execute"];
}): ActionDefinition<TName, TActionParams> {
  return {
    name,
    buildAction: (phenotype) => ({
      name,
      execute: buildAction(phenotype),
    }),
  };
}

const moveActionDefinition = defineAction({
  name: "move",
  buildAction: ({ moveCost }) => {
    return ({ me }, direction: Direction) => {
      const newEnergy = me.currentEnergy - moveCost;

      if (newEnergy < 0) {
        return err(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
      } else {
        const newPosition = addVectors(me.position, direction);

        const changedAgent = {
          ...me,
          position: newPosition,
          currentEnergy: newEnergy,
        };

        return ok({
          me: changedAgent,
        });
      }
    };
  },
});

const reproduceActionDefinition = defineAction({
  name: "reproduce",
  buildAction: ({ reproductionCost }) => {
    return ({ me, otherAgents }) => {
      const newEnergy = me.currentEnergy - reproductionCost;

      if (newEnergy < 0) {
        return err(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
      } else {
        const changedAgent = {
          ...me,
          currentEnergy: newEnergy,
        };

        const newAgent = spawnAgent({ position: me.position });

        return ok({
          me: changedAgent,
          otherAgents: [...otherAgents, newAgent],
        });
      }
    };
  },
});

const eatActionDefinition = defineAction({
  name: "eat",
  buildAction: ({ energyCapacity }) => {
    return ({ me, foodSources }) => {
      const [[foodSourceInRange, ...remainder], other] = partition(
        foodSources,
        (source) => isEqual(source.position, me.position),
      );

      if (hasNoValue(foodSourceInRange)) {
        return err(ACTION_ERRORS.ERR_NOT_IN_RANGE);
      } else {
        const energyGained = Math.min(
          foodSourceInRange.baseEnergyGainFromConsumption,
          energyCapacity - me.currentEnergy,
        );

        const changedAgent = {
          ...me,
          currentEnergy: me.currentEnergy + energyGained,
        };

        const changedFoodSource = {
          ...foodSourceInRange,
          ticksTillRecovery: foodSourceInRange.recoveryRate,
        };

        return ok({
          me: changedAgent,
          foodSources: [...other, ...remainder, changedFoodSource],
        });
      }
    };
  },
});

const definedActions = [
  moveActionDefinition,
  reproduceActionDefinition,
  eatActionDefinition,
];

interface Agent {
  phenotype: Phenotype;

  position: Vec2;
  currentEnergy: number;
}

const FOOD_BASE_ENERGY_GAIN_FROM_CONSUMPTION = 5;
const FOOD_RECOVERY_RATE = 25;

interface FoodSource {
  position: Vec2;
  recoveryRate: number;
  ticksTillRecovery: number;

  baseEnergyGainFromConsumption: number;
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
    baseEnergyGainFromConsumption: FOOD_BASE_ENERGY_GAIN_FROM_CONSUMPTION,
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
