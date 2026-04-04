import { hasNoValue } from "@/utils/typeGuards";
import { partition, isEqual } from "lodash-es";
import { err, ok } from "neverthrow";
import { ACTION_ERRORS } from "../actionErrors";
import { defineAction } from "../defineAction";

export const eatActionDefinition = defineAction({
  name: "eat",
  buildAction: ({ energyCapacity }) => {
    return ({ me, foodSources }) => {
      const [[foodSourceInRange, ...remainder], other] = partition(
        foodSources,
        (source) => isEqual(source.position, me.position),
      );

      if (hasNoValue(foodSourceInRange)) {
        return err(ACTION_ERRORS.ERR_NOT_IN_RANGE);
      } else {
        const energyGained = Math.min(
          foodSourceInRange.baseEnergyGainFromConsumption,
          energyCapacity - me.currentEnergy,
        );

        const changedAgent = {
          ...me,
          currentEnergy: me.currentEnergy + energyGained,
        };

        const changedFoodSource = {
          ...foodSourceInRange,
          ticksTillRecovery: foodSourceInRange.recoveryRate,
        };

        return ok({
          me: changedAgent,
          foodSources: [...other, ...remainder, changedFoodSource],
        });
      }
    };
  },
});
