import { defineGene } from "../defineGene";

const MAX_VISION_RANGE = 10;
const DEFAULT_VISION_RANGE = 4;

export const visionRangeGene = defineGene<number>({
  name: "vision-range",
  applyToPhenotype: (phenotype, allele) => {
    return {
      ...phenotype,
      visionRange: allele,
    };
  },
  getMutatedAllele: (allele, mutationRate) => {
    if (Math.random() > mutationRate) {
      const mutation = Math.random() < 0.5 ? -1 : 1;
      return Math.min(Math.max(allele + mutation, 0), MAX_VISION_RANGE);
    }
    return allele;
  },
  yieldNewAllele: () => {
    return DEFAULT_VISION_RANGE;
  },
});
