"use client";

import { MonthNav } from "@/components/dashboard";
import {
  CategoryBreakdownCard,
  TrendCard,
} from "@/features/reports/components";
import { useReportsStore } from "@/features/reports/store";

export default function ReportsPage() {
  const month = useReportsStore((state) => state.month);
  const setMonth = useReportsStore((state) => state.setMonth);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h2 className="text-2xl font-bold">Reports</h2>

      <MonthNav value={month} onChange={setMonth} />

      <div className="flex flex-col gap-4">
        <CategoryBreakdownCard month={month} />
        <TrendCard />
      </div>
    </div>
  );
}
