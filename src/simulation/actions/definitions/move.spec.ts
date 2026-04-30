import { assert, describe, expect, it } from "vitest";
import { moveActionDefinition } from "./move";
import { Directions } from "@/simulation/position";
import { SIMULATION_WORLD_SIZE } from "@/simulation/constants";
import { AgentState } from "@/simulation/agent/state";
import { ACTION_ERRORS } from "../actionErrors";

describe("move action", () => {
  function buildAction() {
    return moveActionDefinition.buildAction({
      energyCapacity: 100,
      reproductionCost: 50,
      moveCost: 10,
    });
  }

  it("agent is able to move to a new position if it has enough energy", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: { x: 0, y: 0 },
      currentEnergy: 20,
    };

    const result = sut.execute(
      {
        worldSize: SIMULATION_WORLD_SIZE,
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Down,
    );

    assert(result.isOk());
    expect(result.value.me?.position).toEqual({ x: 0, y: 1 });
    expect(result.value.me?.currentEnergy).toBe(10);
  });

  it("agent should not be able to move if it does not have enough energy", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: { x: 0, y: 0 },
      currentEnergy: 0,
    };

    const result = sut.execute(
      {
        worldSize: SIMULATION_WORLD_SIZE,
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Down,
    );

    assert(result.isErr());
    expect(result.error).toBe(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
  });

  it("agent should not be able to move outside of the world boundaries", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: {
        x: SIMULATION_WORLD_SIZE.x + 100,
        y: SIMULATION_WORLD_SIZE.y + 100,
      },
      currentEnergy: 100,
    };

    const result = sut.execute(
      {
        worldSize: SIMULATION_WORLD_SIZE,
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Up,
    );

    assert(result.isErr());
    expect(result.error).toBe(ACTION_ERRORS.ERR_OUT_OF_BOUNDS);
  });
});
