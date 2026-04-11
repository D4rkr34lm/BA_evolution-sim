import { keyBy } from "lodash-es";
import { Phenotype } from "../genetics/phenotype";
import { ActionDefinition } from "./defineAction";

export type ActionMap<TActionDefinitions extends ActionDefinition[]> = {
  [TActionDefinition in TActionDefinitions[number] as TActionDefinition["name"]]: ReturnType<
    TActionDefinition["buildAction"]
  >;
};

export function buildActionMap<TDefinedActions extends ActionDefinition[]>(
  actionDefinitions: TDefinedActions,
  phenotype: Phenotype,
): ActionMap<TDefinedActions> {
  const buildActions = actionDefinitions.map((def) =>
    def.buildAction(phenotype),
  );

  return keyBy(
    buildActions,
    (action) => action.name,
  ) as ActionMap<TDefinedActions>;
}
