import { GeneDefinition } from "./defineGene";
import { DefinedGene, definedGenes } from "./definitions";

type GeneDefinitionToGenomeEntry<TGene extends DefinedGene> =
  TGene extends GeneDefinition<infer TName, infer TAllele>
    ? {
        geneName: TName;
        allele: TAllele;
      }
    : never;

export type Genome = GeneDefinitionToGenomeEntry<
  (typeof definedGenes)[number]
>[];

export function initializeGenome(): Genome {
  return definedGenes.map((gene) => ({
    geneName: gene.name,
    allele: gene.yieldNewAllele(),
  }));
}
