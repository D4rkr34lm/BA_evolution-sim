import { FoodSource } from "./foodSource/index";
import { AgentState } from "./agent/state";
import { Agent } from "./agent/agent";

export interface AgentContext {
  me: AgentState;
  otherAgents: Agent[];
  foodSources: FoodSource[];
}
