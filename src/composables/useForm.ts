import { signal } from "@lit-labs/signals";
import { cloneDeep, set } from "lodash-es";

type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? T[K] extends object
          ? `${K}` | `${K}.${Paths<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string | number | symbol, any>>(
  initialValues: T,
) {
  const formValue = signal(cloneDeep(initialValues));

  function updateFormValue<TPath extends Paths<T>>(
    target: TPath,
    value: PathValue<T, TPath>,
  ) {
    const old = formValue.get();
    const updated = set(old, target, value);
    formValue.set(updated);
  }

  return {
    formValue,
    updateFormValue,
  };
}
