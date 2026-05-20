// Required to handle optional fields correctly (not defaulting ot never)
type PairFromObject<TObject extends object> = {
  [TKey in Extract<keyof TObject, string>]-?: [TKey, TObject[TKey]];
}[Extract<keyof TObject, string>];

export function toPairs<const TObject extends object>(
  obj: TObject,
): Array<PairFromObject<TObject>> {
  return Object.entries(obj) as Array<PairFromObject<TObject>>;
}
