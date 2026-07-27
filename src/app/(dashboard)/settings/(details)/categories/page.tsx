"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/categories";
import type { Category, CategoryType } from "@/features/categories";

const GROUP_LABEL: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

function CategoryGroup({
  type,
  categories,
}: {
  type: CategoryType;
  categories: Category[];
}) {
  if (!categories.length) return null;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {GROUP_LABEL[type]}
      </h3>

      <Card className="gap-0 divide-y divide-border p-0">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex min-h-12 items-center gap-3 px-4 py-3 text-sm"
          >
            <span className="flex-1 font-medium">{category.name}</span>
            {category.isSystem && <Badge variant="secondary">Default</Badge>}
          </div>
        ))}
      </Card>
    </section>
  );
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-2xl font-bold">Categories</h2>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <CategoryGroup
            type="expense"
            categories={
              categories?.filter((item) => item.type === "expense") ?? []
            }
          />
          <CategoryGroup
            type="income"
            categories={
              categories?.filter((item) => item.type === "income") ?? []
            }
          />
        </>
      )}
    </div>
  );
}
