import { signal } from "@lit-labs/signals";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string | number | symbol, any>>(
  initialValues: T,
) {
  const formValue = signal(initialValues);

  function updateFormValue(updater: (old: T) => T) {
    const curr = formValue.get();
    const newData = updater(curr);

    formValue.set(newData);
  }

  return {
    formValue,
    updateFormValue,
  };
}
