import { GeneDefinition } from "./defineGene";
import { DefinedGene, GeneName } from "./definitions";

export type Genome = {
  [TGeneName in GeneName]: Extract<
    DefinedGene,
    { name: TGeneName }
  > extends GeneDefinition<TGeneName, infer TAllele>
    ? TAllele
    : never;
};
