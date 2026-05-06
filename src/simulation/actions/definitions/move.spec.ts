import { assert, describe, expect, it } from "vitest";
import { moveActionDefinition } from "./move";
import { Directions } from "@/simulation/position";
import { SIMULATION_WORLD_SIZE } from "@/simulation/constants";
import { AgentState } from "@/simulation/agent/state";
import { ACTION_ERRORS } from "../actionErrors";
import { spawnAgent } from "@/simulation/agent/agent";
import { err } from "neverthrow";

describe("move action", () => {
  function buildAction() {
    return moveActionDefinition.buildAction({
      energyCapacity: 100,
      reproductionCost: 50,
      moveCost: 10,
      visionRange: 5,
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

  it("agent should not be able to move up outside of the world boundaries", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: {
        x: 0,
        y: 0,
      },
      currentEnergy: 100,
    };

    const result = sut.execute(
      {
        worldSize: {
          x: 1,
          y: 1,
        },
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Up,
    );

    expect(result).toEqual(err(ACTION_ERRORS.ERR_OUT_OF_BOUNDS));
  });

  it("agent should not be able to move down outside of the world boundaries", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: {
        x: 0,
        y: 0,
      },
      currentEnergy: 100,
    };

    const result = sut.execute(
      {
        worldSize: {
          x: 1,
          y: 1,
        },
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Down,
    );

    expect(result).toEqual(err(ACTION_ERRORS.ERR_OUT_OF_BOUNDS));
  });

  it("agent should not be able to move left outside of the world boundaries", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: {
        x: 0,
        y: 0,
      },
      currentEnergy: 100,
    };

    const result = sut.execute(
      {
        worldSize: {
          x: 1,
          y: 1,
        },
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Left,
    );

    expect(result).toEqual(err(ACTION_ERRORS.ERR_OUT_OF_BOUNDS));
  });

  it("agent should not be able to move right outside of the world boundaries", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: {
        x: 0,
        y: 0,
      },
      currentEnergy: 100,
    };

    const result = sut.execute(
      {
        worldSize: {
          x: 1,
          y: 1,
        },
        me,
        foodSources: [],
        otherAgents: [],
      },
      Directions.Right,
    );

    expect(result).toEqual(err(ACTION_ERRORS.ERR_OUT_OF_BOUNDS));
  });

  it("agent should not be able to move to a position occupied by another agent", () => {
    const sut = buildAction();
    const me: AgentState = {
      position: { x: 0, y: 0 },
      currentEnergy: 100,
    };
    const otherAgent = spawnAgent({
      position: { x: 0, y: 1 },
    });

    const result = sut.execute(
      {
        worldSize: SIMULATION_WORLD_SIZE,
        me,
        foodSources: [],
        otherAgents: [otherAgent],
      },
      Directions.Down,
    );

    assert(result.isErr());
    expect(result.error).toBe(ACTION_ERRORS.ERR_POSITION_OCCUPIED);
  });
});
