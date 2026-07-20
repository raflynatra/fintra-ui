import {
  AccountSummaryCard,
  AccountTotalCard,
} from "@/features/accounts/components";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h2 className="mb-6 text-2xl font-bold">Overview</h2>
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <AccountTotalCard />
        <AccountSummaryCard />
      </div>
    </div>
  );
}
