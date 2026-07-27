"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { VisuallyHidden } from "radix-ui";

import { formatAmountInput } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories";
import { budgetSchema } from "@/features/budgets/schema";
import {
  OVERALL_BUDGET_LABEL,
  OVERALL_BUDGET_VALUE,
} from "@/features/budgets/constants";
import type { BudgetPayload } from "@/features/budgets/types";

interface BudgetFormProps {
  title: string;
  description: string;
  defaultValues: Partial<BudgetPayload>;
  onSubmit: (values: BudgetPayload) => void;
  isPending?: boolean;
  submitLabel?: string;
  /** Set by the edit sheet — `PUT` only accepts an amount, so the category is fixed. */
  lockedCategoryLabel?: string;
  /** Surfaces `BUDGET_ALREADY_EXISTS` against the field that caused it. */
  categoryError?: string;
}

export function BudgetForm({
  title,
  description,
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Save",
  lockedCategoryLabel,
  categoryError,
}: BudgetFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetPayload>({
    resolver: zodResolver(budgetSchema),
    defaultValues,
  });

  /** Budgets cap spending, so only expense categories can carry one. */
  const { data: categories, isLoading } = useCategories("expense");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 px-5 pt-3 pb-6"
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <VisuallyHidden.Root asChild>
          <DialogDescription>{description}</DialogDescription>
        </VisuallyHidden.Root>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="categoryId">Category</Label>

        {lockedCategoryLabel ? (
          <p className="rounded-lg bg-muted px-3 py-2.5 text-sm font-medium text-muted-foreground">
            {lockedCategoryLabel}
          </p>
        ) : (
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { value, onChange } }) => (
              <Select
                value={value ?? OVERALL_BUDGET_VALUE}
                onValueChange={(next) =>
                  onChange(next === OVERALL_BUDGET_VALUE ? null : next)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OVERALL_BUDGET_VALUE}>
                    {OVERALL_BUDGET_LABEL}
                  </SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(errors.categoryId || categoryError) && (
          <p className="text-xs text-destructive">
            {errors.categoryId?.message ?? categoryError}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 py-2">
        <Label>Amount</Label>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-semibold text-muted-foreground">
            Rp
          </span>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange, ...field } }) => (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                autoFocus
                className="h-auto w-full border-none bg-transparent text-4xl font-semibold shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 md:text-4xl"
                value={formatAmountInput(value)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  onChange(digits ? Number(digits) : undefined);
                }}
                {...field}
              />
            )}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
