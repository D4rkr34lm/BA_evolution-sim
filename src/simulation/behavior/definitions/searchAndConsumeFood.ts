import { first, sortBy } from "lodash-es";
import { defineBehavior } from "../defineBehavior";
import { getDirectionTowards, getDistance } from "@/simulation/position";
import { ACTION_ERRORS } from "@/simulation/actions/actionErrors";
import { hasValue } from "@/utils/typeGuards";
import { noop } from "@/simulation/actions/definitions/noop";

export const searchAndConsumeFoodBehavior = defineBehavior({
  name: "search-and-consume-food",
  decideAction: (_, context, actions) => {
    const { me, foodSources } = context;

    const foodSourcesSortedByDistance = sortBy(foodSources, (foodSource) =>
      getDistance(me.position, foodSource.position),
    ).filter((foodSource) => foodSource.ticksTillRecovery === 0);

    const closestFoodSource = first(foodSourcesSortedByDistance);

    if (hasValue(closestFoodSource)) {
      const eatAction = actions.eat.canExecute(closestFoodSource);

      if (eatAction.isOk()) {
        return eatAction.value;
      } else if (eatAction.error === ACTION_ERRORS.ERR_NOT_IN_RANGE) {
        const directionToMove = getDirectionTowards(
          me.position,
          closestFoodSource.position,
        );

        const moveAction = actions.move.canExecute(directionToMove);

        if (moveAction.isOk()) {
          return moveAction.value;
        } else {
          return noop();
        }
      }
    }

    return noop();
  },
});
