import { hasNoValue, hasValue } from "@/utils/typeGuards";
import { runSimulation, Simulation, SimulationMetadata } from "./running";
import { recordSimulationSnapshot, SimulationSnapshot } from "./serialization";
import { initializeSimulation } from "./initialization";
import { Vec2 } from "./position";
import * as Comlink from "comlink";
import { setRandomSeed } from "@/utils/random";
import { cloneDeep } from "lodash-es";

export interface SimulationInitOptions {
  seed: string;
  worldSize: Vec2;
  initialAgentsAmount: number;
  initialFoodSourcesAmount: number;
}

export interface SimulationRunner {
  initializeNewSimulation: (simulationParameters: SimulationInitOptions) => {
    metadata: SimulationMetadata;
    initialSnapshot: SimulationSnapshot;
  };
  resetSimulation: () => {
    metadata: SimulationMetadata;
    initialSnapshot: SimulationSnapshot;
  };

  runTick: () => SimulationSnapshot;

  startSimulation: (
    onTickFinished: (snapshot: SimulationSnapshot) => void,
  ) => void;
  stopSimulation: () => void;
  setTickInterval: (intervalMs: number) => void;
}

const DEFAULT_TICK_INTERVAL = 100;

let currentTick: number = -1;
let simulation: Simulation | null = null;
let initialSimulation: Simulation | null = null;

let runTimeoutId: number | null;
let tickInterval = DEFAULT_TICK_INTERVAL;

function initializeNewSimulation(options: SimulationInitOptions) {
  console.log("INFO - Initializing new simulation with options", options);
  stopSimulation();
  setRandomSeed(options.seed);

  const newSimulation = initializeSimulation(options);
  simulation = newSimulation;
  currentTick = 0;
  initialSimulation = cloneDeep(newSimulation);

  return {
    metadata: newSimulation.metadata,
    initialSnapshot: recordSimulationSnapshot(currentTick, newSimulation),
  };
}

function resetSimulation() {
  if (hasNoValue(initialSimulation)) {
    throw new Error("No simulation to reset");
  }

  stopSimulation();

  simulation = cloneDeep(initialSimulation);
  currentTick = 0;

  return {
    metadata: simulation.metadata,
    initialSnapshot: recordSimulationSnapshot(currentTick, simulation),
  };
}

function runSimulationTick() {
  if (hasNoValue(simulation) || currentTick < 0) {
    throw new Error("No active simulation to run");
  }

  const updatedSimulation = runSimulation(simulation);
  const updatedTick = currentTick + 1;

  simulation = updatedSimulation;
  currentTick = updatedTick;

  const snapshot = recordSimulationSnapshot(currentTick, simulation);

  return snapshot;
}

function startSimulation(
  onTickFinished: (snapshot: SimulationSnapshot) => void,
) {
  console.log("INFO - starting simulation");
  if (hasNoValue(simulation) || currentTick < 0) {
    throw new Error("No simulation to run");
  } else if (hasNoValue(runTimeoutId)) {
    const runNextTick = () => {
      console.log("INFO - running next tick");
      const snapshot = runSimulationTick();
      onTickFinished(snapshot);
      runTimeoutId = setTimeout(runNextTick, tickInterval);
    };

    runTimeoutId = setTimeout(runNextTick, tickInterval);
  }
}

function stopSimulation() {
  if (hasValue(runTimeoutId)) {
    clearTimeout(runTimeoutId);
    runTimeoutId = null;
  }
}

function setTickInterval(intervalMs: number) {
  tickInterval = Math.max(1, intervalMs);
}

export const SimulationRunner: SimulationRunner = {
  initializeNewSimulation,
  resetSimulation,
  startSimulation,
  stopSimulation,
  setTickInterval,
  runTick() {
    if (hasValue(runTimeoutId)) {
      throw new Error(
        "Manually progressing the simulation, while running is forbidden",
      );
    } else {
      return runSimulationTick();
    }
  },
};

Comlink.expose(SimulationRunner);
