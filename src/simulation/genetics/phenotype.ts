import { toPairs } from "@/utils/toPairs";
import {
  AGENT_REPRODUCTION_COST,
  AGENT_MOVE_COST,
  DEFAULT_ENERGY_CAPACITY,
  DEFAULT_VISION_RANGE,
} from "../constants";
import { getDefinedGene } from "./definitions";
import { Genome } from "./genome";

export interface Phenotype {
  energyCapacity: number;
  reproductionCost: number;
  moveCost: number;
  visionRange: number;
}

type GenomePair = ReturnType<typeof toPairs<Genome>>[number];

function applyGenomePairToPhenotype(
  phenotype: Phenotype,
  [geneName, allele]: GenomePair,
): Phenotype {
  const gene = getDefinedGene(geneName);

  return gene.applyToPhenotype(phenotype, allele);
}

export function getAgentPhenotype(genome: Genome): Phenotype {
  const defaultPhenotype: Phenotype = {
    energyCapacity: DEFAULT_ENERGY_CAPACITY,
    reproductionCost: AGENT_REPRODUCTION_COST,
    moveCost: AGENT_MOVE_COST,
    visionRange: DEFAULT_VISION_RANGE,
  };

  const phenotype = toPairs(genome).reduce(
    applyGenomePairToPhenotype,
    defaultPhenotype,
  );

  return phenotype;
}
