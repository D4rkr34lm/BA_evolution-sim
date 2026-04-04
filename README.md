# WebWriter - Evolution simulation

## Agent behavior

An agents behavior is determined by its phenotype. From the phenotype, the agent's strategy, behaviors and actions are derived. The agent's strategy is the top level of an agents behavioral pyramid. It consists of a set of states and transitions between those states. Each state holds a behavior, which is executed each tick as long as the agent is in that state. The transitions are based on the agent's inner and perceived external state. A behavior is a composition of actions and simple logic, based on the agent's inner and perceived external state. An action is the most basic unit of behavior.