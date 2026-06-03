import { assert, describe, expect, it } from "vitest";
import { addFoodSource, runSimulation, Simulation } from "./running";
import { spawnAgent } from "./agent/agent";
import { AgentState } from "./agent/state";
import { VEC_0 } from "./position";
import { FoodSource } from "./foodSource";
import { first } from "lodash-es";
import { hasValue } from "@/utils/typeGuards";
import { initializeGenome } from "./genetics/genome";

describe("running simulation", () => {
  function createTestAgent(state: Partial<AgentState>) {
    const defaultState: AgentState = {
      position: { x: 0, y: 0 },
      currentEnergy: 100,
    };

    const agent = spawnAgent({
      position: VEC_0,
      genome: initializeGenome(),
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

  it("adds a food source at a valid position", () => {
    const position = { x: 1, y: 2 };
    const simulation = createTestSimulation({});

    const updatedSimulation = addFoodSource(simulation, position);

    expect(updatedSimulation.foodSources).toHaveLength(1);
    expect(updatedSimulation.foodSources[0]?.position).toEqual(position);
  });

  it("does not add a food source outside negative bounds", () => {
    const simulation = createTestSimulation({});

    const updatedSimulation = addFoodSource(simulation, { x: -1, y: 0 });

    expect(updatedSimulation.foodSources).toHaveLength(0);
  });

  it("does not add a food source outside the world size", () => {
    const simulation = createTestSimulation({});

    const updatedSimulation = addFoodSource(simulation, { x: 10, y: 0 });

    expect(updatedSimulation.foodSources).toHaveLength(0);
  });

  it("does not add a food source at a non-integer position", () => {
    const simulation = createTestSimulation({});

    const updatedSimulation = addFoodSource(simulation, { x: 1.5, y: 0 });

    expect(updatedSimulation.foodSources).toHaveLength(0);
  });

  it("does not add a food source at an occupied food source position", () => {
    const foodSource = createTestFoodSource({
      position: { x: 1, y: 2 },
    });
    const simulation = createTestSimulation({ foodSources: [foodSource] });

    const updatedSimulation = addFoodSource(simulation, { x: 1, y: 2 });

    expect(updatedSimulation.foodSources).toHaveLength(1);
  });
});
