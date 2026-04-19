import { SimulationMetadata } from "@/simulation/running";
import { SimulationSnapshot } from "@/simulation/serialization";
import { hasNoValue, hasValue } from "@/utils/typeGuards";
import { computed, Signal, signal } from "@lit-labs/signals";
import { signalArray } from "signal-utils/array";

interface UninitializedSinuationStore {
  isInitialized: false;
}

interface InitializedSimulationStore {
  isInitialized: true;
  metadata: SimulationMetadata;
  snapshots: SimulationSnapshot[];
  activeSnapshot: SimulationSnapshot | null;
  setActiveSnapshot: (index: number) => void;
}

type SimulationStore = UninitializedSinuationStore | InitializedSimulationStore;

let storeSingleton: Signal.Computed<SimulationStore> | null = null;

export function useSimulationStore() {
  if (hasValue(storeSingleton)) {
    return storeSingleton;
  }

  const metadata = signal<SimulationMetadata | null>(null);
  const snapshots = signalArray<SimulationSnapshot>([]);

  const activeSnapshotIndex = signal(-1);

  const setActiveSnapshot = (index: number) => activeSnapshotIndex.set(index);

  const store = computed<SimulationStore>(() => {
    const activeMetadata = metadata.get();

    if (hasNoValue(activeMetadata)) {
      return {
        isInitialized: false,
      };
    } else {
      return {
        isInitialized: true,
        metadata: activeMetadata,
        snapshots: snapshots,
        activeSnapshot: snapshots.at(activeSnapshotIndex.get()) ?? null,
        setActiveSnapshot,
      };
    }
  });

  storeSingleton = store;

  return store;
}
