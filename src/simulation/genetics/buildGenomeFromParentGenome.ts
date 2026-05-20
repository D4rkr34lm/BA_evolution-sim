import { toPairs } from "@/utils/toPairs";
import { getDefinedGene } from "./definitions";
import { Genome } from "./genome";
import { MUTATION_RATE } from "../constants";

type GenomePair = ReturnType<typeof toPairs<Genome>>[number];

function applyGenomePairToGenome(
  genome: Genome,
  [geneName, allele]: GenomePair,
): Genome {
  const gene = getDefinedGene(geneName);
  const mutatedAllele = gene.getMutatedAllele(allele, MUTATION_RATE);

  return {
    ...genome,
    [geneName]: mutatedAllele,
  };
}

export function buildGenomeFromParentGenome(parentGenome: Genome): Genome {
  return toPairs(parentGenome).reduce(
    (genome, pair) => applyGenomePairToGenome(genome, pair),
    {} as Genome,
  );
}
