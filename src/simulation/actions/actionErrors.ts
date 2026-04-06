export const ACTION_ERRORS = {
  ERR_NOT_ENOUGH_ENERGY: "not-enough-energy",
  ERR_NOT_IN_RANGE: "not-in-range",
} as const;

export type ActionError = (typeof ACTION_ERRORS)[keyof typeof ACTION_ERRORS];

export const ACTION_OK = "ok";

export type ActionSuccess = typeof ACTION_OK;

export type ActionResult = ActionSuccess | ActionError;
