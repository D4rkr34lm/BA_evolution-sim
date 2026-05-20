import { Phenotype } from "./phenotype";

export type Allele =
  | {
      [key: string]: boolean | number | string;
    }
  | boolean
  | number
  | string;

export interface GeneDefinition<TName extends string, TAllele extends Allele> {
  name: TName;
  applyToPhenotype(phenotype: Phenotype, allele: TAllele): Phenotype;
  getMutatedAllele(allele: TAllele, mutationRate: number): TAllele;
  yieldNewAllele(): TAllele;
}

export function defineGene<const TName extends string, TAllele extends Allele>({
  name,
  applyToPhenotype,
  getMutatedAllele,
  yieldNewAllele,
}: {
  name: TName;
  applyToPhenotype: GeneDefinition<TName, TAllele>["applyToPhenotype"];
  getMutatedAllele: GeneDefinition<TName, TAllele>["getMutatedAllele"];
  yieldNewAllele: GeneDefinition<TName, TAllele>["yieldNewAllele"];
}): GeneDefinition<TName, TAllele> {
  return { name, applyToPhenotype, getMutatedAllele, yieldNewAllele };
}
