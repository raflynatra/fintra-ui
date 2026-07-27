/** Label for the budget that has no category and covers every expense. */
export const OVERALL_BUDGET_LABEL = "Overall budget";

/**
 * Radix `Select` has no concept of a null value, so the overall budget needs a
 * sentinel option value. Mapped back to `null` at the form boundary.
 */
export const OVERALL_BUDGET_VALUE = "overall";

/** Label for spending that fell outside every category budget. */
export const REMAINDER_SEGMENT_LABEL = "Everything else";

/** Label for the categories folded together once the palette runs out. */
export const FOLDED_SEGMENT_LABEL = "Other categories";

/**
 * How many categories get their own colour. Categorical hues are assigned in a
 * fixed order and never cycled, so anything past the last slot folds into a
 * single segment instead of reusing a hue.
 */
export const MAX_BREAKDOWN_SEGMENTS = 6;
