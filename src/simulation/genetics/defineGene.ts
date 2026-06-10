import { Phenotype } from "./phenotype";

export type Allele = number;

export interface GeneDefinition<TName extends string, TAllele extends Allele> {
  name: TName;
  label: string;
  description: string;
  min: number;
  max: number;
  applyToPhenotype(phenotype: Phenotype, allele: TAllele): Phenotype;
  getMutatedAllele(allele: TAllele, mutationRate: number): TAllele;
  yieldNewAllele(): TAllele;
}

export function defineGene<const TName extends string, TAllele extends Allele>({
  name,
  label,
  description,
  min,
  max,
  applyToPhenotype,
  getMutatedAllele,
  yieldNewAllele,
}: {
  name: TName;
  label: string;
  description: string;
  min: number;
  max: number;
  applyToPhenotype: GeneDefinition<TName, TAllele>["applyToPhenotype"];
  getMutatedAllele: GeneDefinition<TName, TAllele>["getMutatedAllele"];
  yieldNewAllele: GeneDefinition<TName, TAllele>["yieldNewAllele"];
}): GeneDefinition<TName, TAllele> {
  return {
    name,
    label,
    description,
    min,
    max,
    applyToPhenotype,
    getMutatedAllele,
    yieldNewAllele,
  };
}
