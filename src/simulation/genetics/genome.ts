import { GeneDefinition } from "./defineGene";
import { DefinedGene } from "./definitions";

export type Genome = {
  [TGeneName in DefinedGene["name"]]: DefinedGene extends GeneDefinition<
    TGeneName,
    infer TAllele
  >
    ? TAllele
    : never;
};
