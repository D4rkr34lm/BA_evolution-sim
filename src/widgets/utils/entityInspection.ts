import { AgentSnapshot, FoodSourceSnapshot, SimulationSnapshot } from "@/simulation/serialization";
import { hasValue } from "@/utils/typeGuards";
import { last } from "lodash-es";

interface AgentHistoryEntry {
    tick: number;
    snapshot: AgentSnapshot
}

interface FoodSourceHistoryEntry {
    tick: number;
    snapshot: FoodSourceSnapshot;
}

interface AgentSelection {
    type: "agent";
    history: AgentHistoryEntry[];
    latestSnapshot: AgentSnapshot;
}

interface FoodSourceSelection {
    type: "foodSource";
    history: FoodSourceHistoryEntry[];
    latestSnapshot: FoodSourceSnapshot;
}

export type EntitySelection = AgentSelection | FoodSourceSelection;
export type EntityType = "agent" | "foodSource";

export function extractAgentSelectionFromHistory(agentId: string, history: SimulationSnapshot[]): AgentSelection | null {
    const entityHistory = history.map(snapshot => 
    ({
        tick: snapshot.tick,
        snapshot: snapshot.agents.find(agent => agent.id === agentId) ??  null
    })
    ).filter((entry): entry is AgentHistoryEntry => hasValue(entry.snapshot));

    return {
        type: "agent",
        history: entityHistory,
        latestSnapshot: last(entityHistory)!.snapshot
    };
}


export function extractFoodSourceSelectionFromHistory(foodSourceId: string, history: SimulationSnapshot[]): FoodSourceSelection | null {
    const entityHistory = history.map(snapshot => 
    ({
        tick: snapshot.tick,
        snapshot: snapshot.foodSources.find(foodSource => foodSource.id === foodSourceId) ??  null
    })
    ).filter((entry): entry is FoodSourceHistoryEntry => hasValue(entry.snapshot));

    return {
        type: "foodSource",
        history: entityHistory,
        latestSnapshot: last(entityHistory)!.snapshot
    };
}
   