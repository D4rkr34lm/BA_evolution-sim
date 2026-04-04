import { Direction, addVectors } from "@/simulation/position";
import { err, ok } from "neverthrow";
import { ACTION_ERRORS } from "../actionErrors";
import { defineAction } from "../defineAction";

export const moveActionDefinition = defineAction({
  name: "move",
  buildAction: ({ moveCost }) => {
    return ({ me }, direction: Direction) => {
      const newEnergy = me.currentEnergy - moveCost;

      if (newEnergy < 0) {
        return err(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
      } else {
        const newPosition = addVectors(me.position, direction);

        const changedAgent = {
          ...me,
          position: newPosition,
          currentEnergy: newEnergy,
        };

        return ok({
          me: changedAgent,
        });
      }
    };
  },
});
