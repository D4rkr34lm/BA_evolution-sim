export function getUniqueRandomArray({
  amount,
  max,
}: {
  amount: number;
  max: number;
}) {
  if (amount > max) {
    throw new Error(
      `Size may not excide max number size found: size:${amount} max:${max}`,
    );
  }

  const randoms = new Set<number>();

  while (randoms.size < amount) {
    randoms.add(Math.floor(Math.random() * max));
  }

  return Array.from(randoms);
}
