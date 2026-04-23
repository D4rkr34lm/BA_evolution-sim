import { getUniqueRandomArray } from "@/utils/random";
import { hasValue } from "@/utils/typeGuards";
import { zip } from "lodash-es";

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

type ComparatorOperation = ">" | "<" | ">=" | "<=" | "=" | "!=";

export function compareVectors(
  a: Vec2,
  operation: ComparatorOperation,
  b: Vec2,
): boolean {
  switch (operation) {
    case ">":
      return a.x > b.x && a.y > b.y;
    case "<":
      return a.x < b.x && a.y < b.y;
    case ">=":
      return a.x >= b.x && a.y >= b.y;
    case "<=":
      return a.x <= b.x && a.y <= b.y;
    case "=":
      return a.x === b.x && a.y === b.y;
    case "!=":
      return a.x !== b.x || a.y !== b.y;
    default:
      throw new Error(`Invalid comparator operation: ${operation}`);
  }
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
