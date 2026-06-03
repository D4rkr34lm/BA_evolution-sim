import { getDefinedBehavior } from "./behavior/definitions/index";
import { AgentContext } from "./agentContext";
import { FoodSource, spawnFoodSource } from "./foodSource";
import { Agent, isDead, spawnAgent } from "./agent/agent";
import { cloneDeep, has } from "lodash-es";
import { buildEnrichedActionDeciderMap } from "./actions/actionDeciderMap";
import { getDistance, isInBounds, Vec2 } from "./position";
import { hasValue } from "@/utils/typeGuards";
import { getBehaviorToExecute } from "./strategy";
import { getGenomeFromReproduction } from "./genetics/reproduction";

export interface Simulation {
  metadata: SimulationMetadata;
  foodSources: FoodSource[];
  agents: Agent[];
}

export interface SimulationMetadata {
  worldSize: Vec2;
}

export function addFoodSource(
  simulation: Simulation,
  position: Vec2,
): Simulation {
  if (!isInBounds(position, simulation.metadata.worldSize)) {
    console.warn(
      `Tried to add food source out of bounds at position ${position.x}, ${position.y}`,
    );
    return simulation;
  }

  return {
    ...simulation,
    foodSources: [...simulation.foodSources, spawnFoodSource({ position })],
  };
}

function getAgentContext(agent: Agent, simulation: Simulation): AgentContext {
  return {
    me: agent.state,
    worldSize: simulation.metadata.worldSize,
    otherAgents: simulation.agents
      .filter((otherAgent) => otherAgent.id !== agent.id)
      .filter(
        (otherAgent) =>
          getDistance(otherAgent.state.position, agent.state.position) <=
          agent.phenotype.visionRange,
      ),
    foodSources: simulation.foodSources.filter(
      (foodSource) =>
        getDistance(foodSource.position, agent.state.position) <=
        agent.phenotype.visionRange,
    ),
    spawnAgent: () =>
      spawnAgent({
        position: agent.state.position,
        genome: getGenomeFromReproduction({ parentGenome: agent.genome }),
      }),
  };
}

function runAgent(agent: Agent, context: AgentContext): AgentContext {
  const behaviorToExecuteName = getBehaviorToExecute(context, agent.strategy);

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
  const unchangedAgents = simulation.agents.filter(
    (agent) =>
      !updatedAgentsFromContext.some(
        (updatedAgent) => updatedAgent.id === agent.id,
      ),
  );
  const updatedAgents = [...unchangedAgents, ...updatedAgentsFromContext];

  const unchangedFoodSources = simulation.foodSources.filter(
    (foodSource) =>
      !newContext.foodSources?.some(
        (updatedFoodSource) => updatedFoodSource.id === foodSource.id,
      ),
  );
  const updatedFoodSources = [
    ...unchangedFoodSources,
    ...(newContext.foodSources ?? []),
  ];

  return {
    ...simulation,
    agents: updatedAgents,
    foodSources: updatedFoodSources,
  };
}

export function runSimulation(simulation: Simulation): Simulation {
  const simulationWithAgentUpdates = simulation.agents
    .map((agent) => agent.id)
    .reduce((updatedSimulation, agentId) => {
      const agent = updatedSimulation.agents.find(
        (agent) => agent.id === agentId,
      );

      if (hasValue(agent)) {
        const context = getAgentContext(agent, updatedSimulation);
        const newContext = runAgent(agent, context);
        console.log(
          "INFO - New context after running agent:",
          agent.id,
          newContext,
        );
        return applyAgentContextUpdate(updatedSimulation, agent, newContext);
      } else {
        return updatedSimulation;
      }
    }, cloneDeep(simulation));

  const simulationWithDeadAgentsRemoved = {
    ...simulationWithAgentUpdates,
    agents: simulationWithAgentUpdates.agents.filter((agent) => !isDead(agent)),
  };

  const simulationWithUpdatedFoodSources = {
    ...simulationWithDeadAgentsRemoved,
    foodSources: simulationWithDeadAgentsRemoved.foodSources.map(
      (foodSource) => ({
        ...foodSource,
        ticksTillRecovery:
          foodSource.ticksTillRecovery > 0
            ? foodSource.ticksTillRecovery - 1
            : 0,
      }),
    ),
  };

  return simulationWithUpdatedFoodSources;
}
