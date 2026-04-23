import {
  Direction,
  VEC_0,
  addVectors,
  compareVectors,
} from "@/simulation/position";
import { err, ok } from "neverthrow";
import { ACTION_ERRORS } from "../actionErrors";
import { defineAction } from "../defineAction";

export const moveActionDefinition = defineAction({
  name: "move",
  buildAction: ({ moveCost }) => {
    return ({ me, worldSize }, direction: Direction) => {
      const newEnergy = me.currentEnergy - moveCost;

      if (newEnergy < 0) {
        return err(ACTION_ERRORS.ERR_NOT_ENOUGH_ENERGY);
      } else {
        console.log("DEV - moving agent in direction", direction);
        const newPosition = addVectors(me.position, direction);
        console.log(
          "DEV - new position after move would be",
          me.position,
          newPosition,
        );

        if (
          compareVectors(newPosition, ">=", VEC_0) &&
          compareVectors(newPosition, "<=", worldSize)
        ) {
          const changedAgent = {
            ...me,
            position: newPosition,
            currentEnergy: newEnergy,
          };

          return ok({
            me: changedAgent,
          });
        } else {
          return err(ACTION_ERRORS.ERR_OUT_OF_BOUNDS);
        }
      }
    };
  },
});
