import { MUTATION_RATE } from "../constants";
import { getDefinedGene } from "./definitions";
import { Genome } from "./genome";

export function getGenomeFromReproduction({
  parentGenome,
}: {
  parentGenome: Genome;
}): Genome {
  return parentGenome.map(({ geneName, allele }) => {
    const geneDefinition = getDefinedGene(geneName);
    const mutatedAllele = geneDefinition.getMutatedAllele(
      allele,
      MUTATION_RATE,
    );
    return { geneName, allele: mutatedAllele };
  });
}
