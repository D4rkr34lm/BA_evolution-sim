import { err, ok } from "neverthrow";
import { ACTION_ERRORS } from "../actionErrors";
import { defineAction } from "../defineAction";
import { spawnAgent } from "@/simulation/agent/agent";

export const reproduceActionDefinition = defineAction({
  name: "reproduce",
  buildAction: ({ reproductionCost }) => {
    return ({ me, otherAgents }) => {
      const newEnergy = me.currentEnergy - reproductionCost;

      if (newEnergy < 0) {
        return err(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
      } else {
        const changedAgent = {
          ...me,
          currentEnergy: newEnergy,
        };

        const newAgent = spawnAgent({ position: me.position });

        return ok({
          me: changedAgent,
          otherAgents: [...otherAgents, newAgent],
        });
      }
    };
  },
});
