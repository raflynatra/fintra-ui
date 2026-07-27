/** Label for the budget that has no category and covers every expense. */
export const OVERALL_BUDGET_LABEL = "Overall budget";

/**
 * Radix `Select` has no concept of a null value, so the overall budget needs a
 * sentinel option value. Mapped back to `null` at the form boundary.
 */
export const OVERALL_BUDGET_VALUE = "overall";
