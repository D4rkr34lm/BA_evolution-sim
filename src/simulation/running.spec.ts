import { assert, describe, expect, it } from "vitest";
import { runSimulation, Simulation } from "./running";
import { spawnAgent } from "./agent/agent";
import { AgentState } from "./agent/state";
import { VEC_0 } from "./position";
import { FoodSource } from "./foodSource";
import { first } from "lodash-es";
import { hasValue } from "@/utils/typeGuards";

describe("running simulation", () => {
  function createTestAgent(state: Partial<AgentState>) {
    const defaultState: AgentState = {
      position: { x: 0, y: 0 },
      currentEnergy: 100,
    };

    const agent = spawnAgent({
      position: VEC_0,
    });
    agent.state = {
      ...defaultState,
      ...state,
    };

    return agent;
  }

  function createTestFoodSource(overrides: Partial<FoodSource>) {
    const defaultFoodSource: Simulation["foodSources"][number] = {
      id: "food-source-1",
      position: { x: 0, y: 0 },
      baseEnergyGainFromConsumption: 50,
      recoveryRate: 10,
      ticksTillRecovery: 0,
    };

    return {
      ...defaultFoodSource,
      ...overrides,
    };
  }

  function createTestSimulation(overrides: Partial<Simulation>): Simulation {
    const defaultSimulation: Simulation = {
      agents: [],
      foodSources: [],
      metadata: {
        worldSize: { x: 10, y: 10 },
      },
    };

    return {
      ...defaultSimulation,
      ...overrides,
    };
  }

  it("removes agents that have died during the tick", () => {
    const deadAgent = createTestAgent({ currentEnergy: 0 });

    const simulation = createTestSimulation({
      agents: [deadAgent],
    });

    const updatedSimulation = runSimulation(simulation);

    expect(updatedSimulation.agents).toHaveLength(0);
  });
  it("updates food sources with correct recovery ticks", () => {
    const testTicksTillRecovery = 1;
    const foodSource = createTestFoodSource({
      ticksTillRecovery: testTicksTillRecovery,
    });

    const simulation = createTestSimulation({
      foodSources: [foodSource],
    });

    const updatedSimulation = runSimulation(simulation);

    const updatedFoodSource = first(updatedSimulation.foodSources);

    assert(hasValue(updatedFoodSource));
    expect(updatedFoodSource.ticksTillRecovery).toBe(testTicksTillRecovery - 1);
  });
});
