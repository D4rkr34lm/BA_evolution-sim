import { hasNoValue } from "@/utils/typeGuards";
import { runSimulation, Simulation } from "./running";
import { recordSimulationSnapshot, SimulationSnapshot } from "./serialization";
import { initializeSimulation } from "./initialization";
import { Vec2 } from "./position";

interface SimulationRunner {
  currentTick: number;
  activeSimulation: Simulation | null;
  runTick: () => SimulationSnapshot;
  initializeNewSimulation: (simulationParameters: {
    worldSize: Vec2;
    initialAgentsAmount: number;
    initialFoodSourcesAmount: number;
  }) => SimulationSnapshot;
}

export const SimulationRunner: SimulationRunner = {
  currentTick: -1,
  activeSimulation: null,
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
  initializeNewSimulation(parameters) {
    const newSimulation = initializeSimulation(parameters);
    this.activeSimulation = newSimulation;
    this.currentTick = 0;
    return recordSimulationSnapshot(this.currentTick, newSimulation);
  },
};
