import { Direction, addVectors } from "@/simulation/position";
import { err, ok } from "neverthrow";
import { ACTION_ERRORS } from "../actionErrors";
import { defineAction } from "../defineAction";
import { isEqual } from "lodash-es";

export const moveActionDefinition = defineAction({
  name: "move",
  buildAction: ({ moveCost }) => {
    return ({ me, otherAgents, worldSize }, direction: Direction) => {
      const newEnergy = me.currentEnergy - moveCost;

      if (newEnergy < 0) {
        return err(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
      } else {
        const newPosition = addVectors(me.position, direction);

        if (
          newPosition.x < 0 ||
          newPosition.y < 0 ||
          newPosition.x >= worldSize.x ||
          newPosition.y >= worldSize.y
        ) {
          return err(ACTION_ERRORS.ERR_OUT_OF_BOUNDS);
        } else if (
          otherAgents.some((agent) =>
            isEqual(agent.state.position, newPosition),
          )
        ) {
          return err(ACTION_ERRORS.ERR_POSITION_OCCUPIED);
        } else {
          const changedAgent = {
            ...me,
            position: newPosition,
            currentEnergy: newEnergy,
          };

          return ok({
            me: changedAgent,
          });
        }
      }
    };
  },
});
