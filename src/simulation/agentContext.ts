import { FoodSource } from "./foodSource/index";
import { AgentState } from "./agent/state";

export interface AgentContext {
  me: AgentState;
  otherAgents: AgentState[];
  foodSources: FoodSource[];
}
