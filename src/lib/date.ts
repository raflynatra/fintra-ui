import { addMonths, format, parseISO } from "date-fns";

/** The current period as "YYYY-MM". */
export function currentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

/** Moves a "YYYY-MM" period by whole months, crossing year boundaries. */
export function shiftMonth(month: string, delta: number): string {
  return format(addMonths(parseISO(`${month}-01`), delta), "yyyy-MM");
}
