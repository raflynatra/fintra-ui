"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { VisuallyHidden } from "radix-ui";

import { cn } from "@/lib/utils";
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
import { transactionSchema } from "@/features/transactions/schema";
import { useCategories } from "@/features/categories";
import type { TransactionPayload } from "@/features/transactions/types";

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const emptyTransactionValues: Partial<TransactionPayload> = {
  type: "expense",
  categoryId: "",
  date: todayISO(),
  description: "",
};

interface TransactionFormProps {
  title: string;
  description: string;
  defaultValues: Partial<TransactionPayload>;
  onSubmit: (values: TransactionPayload) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function TransactionForm({
  title,
  description,
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Save",
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionPayload>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });

  // Re-sync the form whenever the caller hands us new default values (e.g.
  // the edit sheet opening on a different row).
  React.useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const type = useWatch({ control, name: "type" });
  const { data: categories, isLoading: categoriesLoading } =
    useCategories(type);

  // Switching type invalidates the category picked under the previous one.
  const handleTypeChange = (next: TransactionPayload["type"]) => {
    setValue("type", next);
    setValue("categoryId", "");
  };

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

      {/* Expense / income toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        {(["expense", "income"] as const).map((option) => (
          <Button
            key={option}
            type="button"
            variant="ghost"
            onClick={() => handleTypeChange(option)}
            aria-pressed={type === option}
            className={cn(
              "h-auto rounded-md py-2 capitalize hover:bg-transparent",
              type === option
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground",
            )}
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Amount */}
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

      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={categoriesLoading}
            >
              <SelectTrigger id="categoryId" aria-invalid={!!errors.categoryId}>
                <SelectValue
                  placeholder={
                    categoriesLoading ? "Loading…" : "Select a category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {!categories ? (
                  <div className="p-4 text-center">
                    <span className="text-sm text-muted-foreground">
                      No data
                    </span>
                  </div>
                ) : (
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-destructive">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Note (optional)</Label>
        <Input
          id="description"
          type="text"
          placeholder="e.g. Lunch with team"
          {...register("description")}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
