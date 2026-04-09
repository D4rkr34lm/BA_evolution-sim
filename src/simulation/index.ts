import { getDefinedBehavior } from "./behavior/defineBehavior";
import { buildEnrichedActionDeciderMap } from "./actions/defineAction";
import { AgentContext } from "./agentContext";
import { FoodSource } from "./foodSource";
import { Agent } from "./agent/agent";

interface Simulation {
  foodSources: FoodSource[];
  agents: Agent[];
}

function getAgentContext(agent: Agent, simulation: Simulation): AgentContext {
  return {
    me: agent.state,
    otherAgents: simulation.agents
      .filter((a) => a !== agent)
      .map((a) => a.state),
    foodSources: simulation.foodSources,
  };
}

function runAgent(agent: Agent, context: AgentContext) {
  const behaviorToExecuteName = agent.strategy.currentState.behaviorToExecute;

  const deciderMap = buildEnrichedActionDeciderMap(agent.actionMap, context);
  const behaviorToExecute = getDefinedBehavior(behaviorToExecuteName);

  const decidedBehavior = behaviorToExecute.decideAction(
    agent.phenotype,
    context,
    deciderMap,
  );
}

/*
function spawnAgents({
  worldSize,
  amount,
}: {
  worldSize: Vec2;
  amount: number;
}): Agent[] {
  const agentPositions = getUniqueRandomPositions({
    max: worldSize,
    amount,
  });

  return agentPositions.map((pos) => spawnAgent({ position: pos }));
}
*/

/*
function runSimulation(simulation: Simulation) {
  // TODO extract into own function
  const updatedFoodSources = simulation.foodSources.map((source) => ({
    ...source,
    ticksTillRecovery: Math.max(0, source.ticksTillRecovery - 1),
  }));

  const updatedAgents = simulation.agents.map((agent) => {
    const agentContext = getAgentContext(agent, simulation);
  });
}

function generateNewSimulation(): Simulation {
  const foodSources = spawnFoodSources({
    worldSize: SIMULATION_WORLD_SIZE,
    amount: SIMULATION_FOOD_AMOUNT,
  });

  const initialAgents = spawnAgents({
    worldSize: SIMULATION_WORLD_SIZE,
    amount: SIMULATION_INITIAL_AGENT_COUNT,
  });

  return {
    foodSources,
    agents: initialAgents,
  };
}
*/
