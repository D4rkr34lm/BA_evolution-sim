import { SimulationMetadata } from "@/simulation/running";
import { SimulationSnapshot } from "@/simulation/serialization";
import { computed, signal } from "@lit-labs/signals";
import * as Comlink from "comlink";
import { cloneDeep } from "lodash-es";

import SimulationWorkerRaw from "worker:../simulation/Simulation.worker";
import {
  SimulationRunner,
  SimulationInitOptions,
} from "../simulation/Simulation.worker";
import { hasValue } from "@/utils/typeGuards";

export type SimulationStatus =
  | "uninitialized"
  | "ready"
  | "running"
  | "paused"
  | "completed";

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

const simulationMetadata = signal<SimulationMetadata | null>(null);
const currentSnapshot = signal<SimulationSnapshot | null>(null);
const simulationStatus = signal<SimulationStatus>("uninitialized");
const simulationSpeed = signal(1);
const isRunning = computed(() => simulationStatus.get() === "running");
const DEFAULT_TICK_INTERVAL = 100;

const currentActiveSimulationData = computed(() => {
  const metadata = simulationMetadata.get();
  const snapshot = currentSnapshot.get();

  if (hasValue(metadata) && hasValue(snapshot)) {
    return {
      metadata,
      snapshot,
      currentTick: snapshot.tick,
    };
  } else {
    return null;
  }
});

async function initializeNewSimulation(options: SimulationInitOptions) {
  console.log("INFO - initialized new simulation with options", options);

  await SimulationWorker.stopSimulation();
  const initResult = await SimulationWorker.initializeNewSimulation(options);

  simulationMetadata.set(initResult.metadata);
  currentSnapshot.set(initResult.initialSnapshot);
  simulationStatus.set("ready");
}

async function runNextTick() {
  if (isRunning.get() || !hasValue(currentSnapshot.get())) {
    return;
  }

  const tickResult = await SimulationWorker.runTick();

  currentSnapshot.set(tickResult);
  simulationStatus.set("paused");
}

async function startSimulation() {
  if (!isRunning.get() && hasValue(currentSnapshot.get())) {
    simulationStatus.set("running");
    await SimulationWorker.startSimulation(
      Comlink.proxy((snapshot) => {
        currentSnapshot.set(snapshot);
      }),
    );
  }
}

async function stopSimulation() {
  await SimulationWorker.stopSimulation();
  simulationStatus.set(
    hasValue(currentSnapshot.get()) ? "paused" : "uninitialized",
  );
}

async function resetSimulation() {
  try {
    const { initialSnapshot, metadata } =
      await SimulationWorker.resetSimulation();
    simulationMetadata.set(metadata);
    currentSnapshot.set(initialSnapshot);
    simulationStatus.set("ready");
  } catch (error) {
    console.error("ERROR - Failed to reset simulation", error);
  }
}

async function setSimulationSpeed(speed: number) {
  simulationSpeed.set(speed);
  await SimulationWorker.setTickInterval(DEFAULT_TICK_INTERVAL / speed);
}

export function useSimulationStore() {
  return {
    initializeNewSimulation,
    runNextTick,
    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed,
    currentActiveSimulationData,
    simulationStatus,
    simulationSpeed,
    isRunning,
  };
}
