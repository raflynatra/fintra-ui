/**
 * Client state for the reports page. Server data belongs to TanStack Query, so
 * only the selected period lives here.
 */
export interface ReportsUIState {
  /** The selected period as "YYYY-MM". */
  month: string;
  setMonth: (month: string) => void;
}
