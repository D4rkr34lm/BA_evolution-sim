import { SimulationMetadata } from "@/simulation/running";
import { SimulationSnapshot } from "@/simulation/serialization";
import { computed, signal } from "@lit-labs/signals";
import * as Comlink from "comlink";

import SimulationWorkerRaw from "worker:../simulation/Simulation.worker";
import type {
  SimulationRunner,
  SimulationInitOptions,
} from "../simulation/Simulation.worker";
import { hasValue } from "@/utils/typeGuards";

const SimulationWorker = Comlink.wrap<SimulationRunner>(
  new Worker(URL.createObjectURL(new Blob([SimulationWorkerRaw]))),
);

export function useSimulationStore() {
  const simulationMetadata = signal<SimulationMetadata | null>(null);
  const currentSnapshot = signal<SimulationSnapshot | null>(null);

  const isRunning = signal(false);

  async function initializeNewSimulation(options: SimulationInitOptions) {
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

  return {
    initializeNewSimulation,
    runNextTick,
    currentActiveSimulationData,
    isRunning,
  };
}
