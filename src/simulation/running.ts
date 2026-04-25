import { getDefinedBehavior } from "./behavior/defineBehavior";
import { AgentContext } from "./agentContext";
import { FoodSource } from "./foodSource";
import { Agent } from "./agent/agent";
import { cloneDeep, has } from "lodash-es";
import { buildEnrichedActionDeciderMap } from "./actions/actionDeciderMap";
import { Vec2 } from "./position";
import { hasValue } from "@/utils/typeGuards";

export interface Simulation {
  metadata: SimulationMetadata;
  foodSources: FoodSource[];
  agents: Agent[];
}

export interface SimulationMetadata {
  worldSize: Vec2;
}

function getAgentContext(agent: Agent, simulation: Simulation): AgentContext {
  return {
    me: agent.state,
    worldSize: simulation.metadata.worldSize,
    otherAgents: simulation.agents.filter(
      (otherAgent) => otherAgent.id !== agent.id,
    ),
    foodSources: simulation.foodSources,
  };
}

function runAgent(agent: Agent, context: AgentContext): AgentContext {
  const behaviorToExecuteName = agent.strategy.currentState.behaviorToExecute;

  const deciderMap = buildEnrichedActionDeciderMap(agent.actionMap, context);
  const behaviorToExecute = getDefinedBehavior(behaviorToExecuteName);

  const actionDecision = behaviorToExecute.decideAction(
    agent.phenotype,
    context,
    deciderMap,
  );

  const actionToRun = agent.actionMap[actionDecision.name];

  const actionExecutionResult = actionToRun.execute(
    context,
    (has(actionDecision, "params")
      ? actionDecision.params
      : undefined) as never,
  );

  if (actionExecutionResult.isErr()) {
    console.error(
      `Error executing action ${actionToRun.name}: ${actionExecutionResult.error}`,
    );
    return context;
  } else {
    return {
      ...context,
      ...actionExecutionResult.value,
    };
  }
}

function applyAgentContextUpdate(
  simulation: Simulation,
  agent: Agent,
  newContext: AgentContext,
) {
  const updatedMe = {
    ...agent,
    state: newContext.me,
  };
  const updatedAgentsFromContext = [updatedMe, ...newContext.otherAgents];

  const updatedAgents = simulation.agents.map((simAgent) => {
    const updatedAgentFromContext = updatedAgentsFromContext.find(
      (updatedAgent) => updatedAgent.id === simAgent.id,
    );
    return updatedAgentFromContext ?? simAgent;
  });

  return {
    ...simulation,
    agents: updatedAgents,
  };
}

export function runSimulation(simulation: Simulation): Simulation {
  const simulationWithAgentUpdates = simulation.agents
    .map((agent) => agent.id)
    .reduce((updatedSimulation, agentId) => {
      const agent = updatedSimulation.agents.find(
        (agent) => (agent.id = agentId),
      );

      if (hasValue(agent)) {
        const context = getAgentContext(agent, updatedSimulation);
        const newContext = runAgent(agent, context);
        return applyAgentContextUpdate(updatedSimulation, agent, newContext);
      } else {
        return updatedSimulation;
      }
    }, cloneDeep(simulation));

  return simulationWithAgentUpdates;
}
