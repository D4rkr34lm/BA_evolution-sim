import { isEqual, without } from "lodash-es";
import { err, ok } from "neverthrow";
import { ACTION_ERRORS } from "../actionErrors";
import { defineAction } from "../defineAction";
import { FoodSource } from "@/simulation/foodSource";

export const eatActionDefinition = defineAction({
  name: "eat",
  buildAction: ({ energyCapacity }) => {
    return ({ me, foodSources }, foodSource: FoodSource) => {
      const otherFoodSources = without(foodSources, foodSource);

      if (!isEqual(me.position, foodSource.position)) {
        return err(ACTION_ERRORS.ERR_NOT_IN_RANGE);
      } else if (foodSource.ticksTillRecovery > 0) {
        return err(ACTION_ERRORS.ERR_RESOURCE_UNAVAILABLE);
      } else {
        const energyGained = Math.min(
          foodSource.baseEnergyGainFromConsumption,
          energyCapacity - me.currentEnergy,
        );

        const changedAgent = {
          ...me,
          currentEnergy: me.currentEnergy + energyGained,
        };

        const changedFoodSource = {
          ...foodSource,
          ticksTillRecovery: foodSource.recoveryRate,
        };

        return ok({
          me: changedAgent,
          foodSources: [...otherFoodSources, changedFoodSource],
        });
      }
    };
  },
});
