import { hasNoValue, hasValue } from "@/utils/typeGuards";
import { runSimulation, Simulation, SimulationMetadata } from "./running";
import { recordSimulationSnapshot, SimulationSnapshot } from "./serialization";
import { initializeSimulation } from "./initialization";
import { Vec2 } from "./position";
import * as Comlink from "comlink";

export interface SimulationInitOptions {
  worldSize: Vec2;
  initialAgentsAmount: number;
  initialFoodSourcesAmount: number;
}

export interface SimulationRunner {
  initializeNewSimulation: (simulationParameters: SimulationInitOptions) => {
    metadata: SimulationMetadata;
    initialSnapshot: SimulationSnapshot;
  };

  runTick: () => SimulationSnapshot;

  startSimulation: (
    onTickFinished: (snapshot: SimulationSnapshot) => void,
  ) => void;
  stopSimulation: () => void;
}

const TICK_INTERVAL = 1000;

let currentTick: number = -1;
let simulation: Simulation | null = null;
let runTimeoutId: number | null;

function initializeNewSimulation(options: SimulationInitOptions) {
  const newSimulation = initializeSimulation(options);
  simulation = newSimulation;
  currentTick = 0;
  return {
    metadata: newSimulation.metadata,
    initialSnapshot: recordSimulationSnapshot(currentTick, newSimulation),
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
      runTimeoutId = setTimeout(runNextTick, TICK_INTERVAL);
    };

    runNextTick();
  }
}

function stopSimulation() {
  if (hasValue(runTimeoutId)) {
    clearTimeout(runTimeoutId);
    runTimeoutId = null;
  }
}

export const SimulationRunner: SimulationRunner = {
  initializeNewSimulation,
  startSimulation,
  stopSimulation,
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
