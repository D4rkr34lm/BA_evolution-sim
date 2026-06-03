import { getUniqueRandomArray } from "@/utils/random";
import { hasValue } from "@/utils/typeGuards";
import { values, zip } from "lodash-es";

export interface Vec2 {
  x: number;
  y: number;
}

export const Directions = {
  Up: { x: 0, y: -1 },
  Right: { x: 1, y: 0 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
} as const;

export type Direction = (typeof Directions)[keyof typeof Directions];

export const VEC_0 = { x: 0, y: 0 };

export function addVectors(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

export function scaleVector(vec: Vec2, factor: number): Vec2 {
  return {
    x: vec.x * factor,
    y: vec.y * factor,
  };
}

export function getDistance(a: Vec2, b: Vec2): number {
  return Math.floor(Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2));
}

export function getDirectionTowards(from: Vec2, to: Vec2): Direction {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? Directions.Right : Directions.Left;
  } else {
    return deltaY > 0 ? Directions.Down : Directions.Up;
  }
}

export function isInBounds(position: Vec2, worldSize: Vec2): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < worldSize.x &&
    position.y < worldSize.y
  );
}

export function getUniqueRandomPositions({
  amount,
  max,
}: {
  amount: number;
  max: Vec2;
}) {
  const xPositions = getUniqueRandomArray({ amount, max: max.x });
  const yPositions = getUniqueRandomArray({ amount, max: max.y });

  return zip(xPositions, yPositions)
    .filter(
      (pos): pos is [number, number] => hasValue(pos[0]) && hasValue(pos[1]),
    )
    .map(([x, y]) => ({ x, y }));
}

export function getRandomDirection(): Direction {
  const directions = values(Directions);
  const randomIndex = Math.floor(Math.random() * directions.length);
  return directions[randomIndex] ?? Directions.Up;
}
