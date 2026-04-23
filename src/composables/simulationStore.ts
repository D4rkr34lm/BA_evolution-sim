import { SimulationMetadata } from "@/simulation/running";
import { SimulationSnapshot } from "@/simulation/serialization";
import { computed, signal } from "@lit-labs/signals";
import * as Comlink from "comlink";

import SimulationWorkerRaw from "worker:../simulation/Simulation.worker";
import {
  SimulationRunner,
  SimulationInitOptions,
} from "../simulation/Simulation.worker";
import { hasValue } from "@/utils/typeGuards";

const SimulationWorker = Comlink.wrap<SimulationRunner>(
  new Worker(
    URL.createObjectURL(
      new Blob([SimulationWorkerRaw], {
        type: "application/javascript",
      }),
    ),
    {
      type: "module",
    },
  ),
);

export function useSimulationStore() {
  const simulationMetadata = signal<SimulationMetadata | null>(null);
  const currentSnapshot = signal<SimulationSnapshot | null>(null);

  const isRunning = signal(false);

  async function initializeNewSimulation(options: SimulationInitOptions) {
    console.log("DEV - initialized new simulation with options", options);

    const initResult = await SimulationWorker.initializeNewSimulation(options);

    simulationMetadata.set(initResult.metadata);
    currentSnapshot.set(initResult.initialSnapshot);
  }

  async function runNextTick() {
    const tickResult = await SimulationWorker.runTick();

    currentSnapshot.set(tickResult);
  }

  const currentActiveSimulationData = computed(() => {
    const metadata = simulationMetadata.get();
    const snapshot = currentSnapshot.get();

    if (hasValue(metadata) && hasValue(snapshot)) {
      return {
        metadata,
        snapshot,
      };
    } else {
      return null;
    }
  });

  async function startSimulation() {
    isRunning.set(true);
    await SimulationWorker.startSimulation(
      Comlink.proxy((snapshot) => {
        currentSnapshot.set(snapshot);
      }),
    );
  }

  async function stopSimulation() {
    isRunning.set(false);
    await SimulationWorker.stopSimulation();
  }

  return {
    initializeNewSimulation,
    runNextTick,
    startSimulation,
    stopSimulation,
    currentActiveSimulationData,
    isRunning,
  };
}
