import { Vec2 } from "../position";

export interface FoodSource {
  position: Vec2;
  recoveryRate: number;
  ticksTillRecovery: number;

  baseEnergyGainFromConsumption: number;
}

/*
function spawnFoodSources({
  worldSize,
  amount,
}: {
  worldSize: Vec2;
  amount: number;
}): FoodSource[] {
  const sourcePositions = getUniqueRandomPositions({
    amount,
    max: worldSize,
  });

  return sourcePositions.map((pos) => ({
    position: pos,
    recoveryRate: FOOD_RECOVERY_RATE,
    ticksTillRecovery: 0,
    baseEnergyGainFromConsumption: FOOD_BASE_ENERGY_GAIN_FROM_CONSUMPTION,
  }));
}
*/
