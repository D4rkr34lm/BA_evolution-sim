import { computed, signal } from "@lit-labs/signals";
import { isEqual } from "lodash-es";
import { signalObject } from "signal-utils/object";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string | number | symbol, any>>(
  initialValues: T,
) {
  const initialValue = signal(initialValues);
  const formValue = signalObject(initialValues);

  const isDirty = computed(() => {
    const initial = initialValue.get();

    return !isEqual(initial, formValue);
  });

  return {
    formValue,
    isDirty,
  };
}
