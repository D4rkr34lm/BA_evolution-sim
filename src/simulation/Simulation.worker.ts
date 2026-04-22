import { hasNoValue } from "@/utils/typeGuards";
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
  currentTick: number;
  activeSimulation: Simulation | null;
  simulationRunning: boolean;
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

const TICK_INTERVAL = 100;

export const SimulationRunner: SimulationRunner = {
  currentTick: -1,
  activeSimulation: null,
  simulationRunning: false,
  initializeNewSimulation(parameters) {
    const newSimulation = initializeSimulation(parameters);
    this.activeSimulation = newSimulation;
    this.currentTick = 0;
    return {
      metadata: newSimulation.metadata,
      initialSnapshot: recordSimulationSnapshot(
        this.currentTick,
        newSimulation,
      ),
    };
  },

  runTick() {
    if (hasNoValue(this.activeSimulation) || this.currentTick < 0) {
      throw new Error("No active simulation to run");
    }

    const simulation = this.activeSimulation;
    const updatedSimulation = runSimulation(simulation);
    const updatedTick = this.currentTick + 1;

    this.activeSimulation = updatedSimulation;
    this.currentTick = updatedTick;

    const snapshot = recordSimulationSnapshot(
      this.currentTick,
      this.activeSimulation,
    );

    return snapshot;
  },

  startSimulation(onTickFinished) {
    if (hasNoValue(this.activeSimulation) || this.currentTick < 0) {
      throw new Error("No active simulation to run");
    } else {
      this.simulationRunning = true;
      const runNextTick = () => {
        if (this.simulationRunning) {
          const snapshot = this.runTick();
          onTickFinished(snapshot);
          setTimeout(runNextTick, TICK_INTERVAL);
        }
      };

      runNextTick();
    }
  },

  stopSimulation() {
    this.simulationRunning = false;
  },
};

Comlink.expose(SimulationRunner);
