import { addMonths, endOfMonth, format, parseISO } from "date-fns";

/** The current period as "YYYY-MM". */
export function currentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

/** Moves a "YYYY-MM" period by whole months, crossing year boundaries. */
export function shiftMonth(month: string, delta: number): string {
  return format(addMonths(parseISO(`${month}-01`), delta), "yyyy-MM");
}

/** Expands a "YYYY-MM" period into the inclusive date range it covers. */
export function monthRange(month: string): {
  dateFrom: string;
  dateTo: string;
} {
  const start = parseISO(`${month}-01`);

  return {
    dateFrom: format(start, "yyyy-MM-dd"),
    dateTo: format(endOfMonth(start), "yyyy-MM-dd"),
  };
}
