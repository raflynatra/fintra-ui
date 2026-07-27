import { BackLink } from "@/components/dashboard";
import { APP_ROUTES } from "@/lib/constants";

/**
 * Frame for budget detail pages. Renders a back link to the list above the page
 * content; the list itself sits outside this route group and stays
 * back-button-free.
 */
export default function BudgetDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <BackLink href={APP_ROUTES.budgets} label="Budgets" />

      {children}
    </div>
  );
}
