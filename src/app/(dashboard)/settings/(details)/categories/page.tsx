"use client";

import * as React from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/categories";
import {
  AddCategorySheet,
  DeleteCategoryDialog,
} from "@/features/categories/components";
import type { Category, CategoryType } from "@/features/categories";

const GROUP_LABEL: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

interface CategoryGroupProps {
  type: CategoryType;
  categories: Category[];
  onDelete: (category: Category) => void;
}

function CategoryGroup({ type, categories, onDelete }: CategoryGroupProps) {
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
            className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm"
          >
            <span className="min-w-0 flex-1 truncate font-medium">
              {category.name}
            </span>

            {/* Seeded categories have no user_id, so the backend would never
                delete them — don't offer a control that can't work. */}
            {category.isSystem ? (
              <Badge variant="secondary">Default</Badge>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${category.name}`}
                onClick={() => onDelete(category)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </Card>
    </section>
  );
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [deleting, setDeleting] = React.useState<Category | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Categories</h2>
        <AddCategorySheet
          trigger={
            <Button type="button" size="sm">
              <PlusIcon className="size-4" />
              Add category
            </Button>
          }
        />
      </div>

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
            onDelete={setDeleting}
          />
          <CategoryGroup
            type="income"
            categories={
              categories?.filter((item) => item.type === "income") ?? []
            }
            onDelete={setDeleting}
          />
        </>
      )}

      <DeleteCategoryDialog
        category={deleting}
        onOpenChange={() => setDeleting(null)}
      />
    </div>
  );
}
