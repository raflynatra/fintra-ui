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
import {
  transactionFormSchema,
  TRANSACTION_TYPES,
} from "@/features/transactions/schema";
import { TRANSACTION_TYPE_LABEL } from "@/features/transactions/constants";
import { useCategories, toCategoryType } from "@/features/categories";
import { useAccounts } from "@/features/accounts";
import type {
  Transaction,
  TransactionFormValues,
  TransactionType,
} from "@/features/transactions/types";
import { TransactionEmptyAccount } from "./transaction-empty-account";

const EDITABLE_TYPES = ["expense", "income"] as const;

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyTransactionValues(): Partial<TransactionFormValues> {
  return {
    type: "expense",
    accountId: "",
    categoryId: "",
    toAccountId: "",
    date: todayISO(),
    description: "",
  };
}

interface TransactionFormProps {
  isEdit?: boolean;
  transaction?: Transaction | null;
  onSubmit: (values: TransactionFormValues) => void;
  isPending?: boolean;
  headerAction?: React.ReactNode;
}

export function TransactionForm({
  isEdit = false,
  transaction = null,
  onSubmit,
  isPending = false,
  headerAction,
}: TransactionFormProps) {
  const title = isEdit ? "Edit transaction" : "Add transaction";
  const description = isEdit
    ? "Update this transaction."
    : "Record a new expense, income or transfer.";
  const submitLabel = isEdit ? "Save changes" : "Save";

  const includeArchivedAccounts = isEdit;
  const typeOptions = isEdit ? EDITABLE_TYPES : TRANSACTION_TYPES;
  const readOnlyType = isEdit && transaction?.type === "transfer";

  const defaultValues = React.useMemo<Partial<TransactionFormValues>>(() => {
    if (isEdit && transaction) {
      return {
        type: transaction.type,
        amount: transaction.amount,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId ?? "",
        toAccountId: transaction.toAccountId ?? "",
        date: transaction.date,
        description: transaction.description ?? "",
      };
    }
    return emptyTransactionValues();
  }, [isEdit, transaction]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  React.useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const type = useWatch({ control, name: "type" });
  const accountId = useWatch({ control, name: "accountId" });
  const isTransfer = type === "transfer";

  const { data: categories, isLoading: categoriesLoading } = useCategories(
    toCategoryType(type),
  );
  const { data: accounts, isLoading: accountsLoading } = useAccounts({
    includeArchived: includeArchivedAccounts,
  });

  const handleTypeChange = (next: TransactionType) => {
    setValue("type", next);
    setValue("categoryId", "");
    setValue("toAccountId", "");
  };

  if (!accountsLoading && accounts?.length === 0)
    return <TransactionEmptyAccount title={title} description={description} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 px-5 pt-3 pb-6"
    >
      <DialogHeader>
        <div className="flex items-center justify-between gap-2">
          <DialogTitle>{title}</DialogTitle>
          {headerAction}
        </div>
        <VisuallyHidden.Root asChild>
          <DialogDescription>{description}</DialogDescription>
        </VisuallyHidden.Root>
      </DialogHeader>

      {readOnlyType ? (
        <div className="rounded-lg bg-muted p-1">
          <p className="py-2 text-center text-sm font-medium text-muted-foreground">
            {TRANSACTION_TYPE_LABEL[type]}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-1 rounded-lg bg-muted p-1",
            typeOptions.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {typeOptions.map((option) => (
            <Button
              key={option}
              type="button"
              variant="ghost"
              onClick={() => handleTypeChange(option)}
              aria-pressed={type === option}
              className={cn(
                "h-auto rounded-md px-1 py-2 hover:bg-transparent",
                type === option
                  ? "bg-card text-foreground shadow-sm hover:bg-card"
                  : "text-muted-foreground",
              )}
            >
              {TRANSACTION_TYPE_LABEL[option]}
            </Button>
          ))}
        </div>
      )}

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

      <div className="grid gap-2">
        <Label htmlFor="accountId">{isTransfer ? "From" : "Account"}</Label>
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={accountsLoading}
            >
              <SelectTrigger id="accountId" aria-invalid={!!errors.accountId}>
                <SelectValue
                  placeholder={
                    accountsLoading ? "Loading…" : "Select an account"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    disabled={account.isArchived && account.id !== field.value}
                  >
                    {account.name}
                    {account.isArchived && " · Archived"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.accountId && (
          <p className="text-xs text-destructive">{errors.accountId.message}</p>
        )}
      </div>

      {isTransfer ? (
        <div className="grid gap-2">
          <Label htmlFor="toAccountId">To</Label>
          <Controller
            control={control}
            name="toAccountId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={accountsLoading}
              >
                <SelectTrigger
                  id="toAccountId"
                  aria-invalid={!!errors.toAccountId}
                >
                  <SelectValue
                    placeholder={
                      accountsLoading ? "Loading…" : "Select an account"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                      disabled={
                        account.id === accountId ||
                        (account.isArchived && account.id !== field.value)
                      }
                    >
                      {account.name}
                      {account.isArchived && " · Archived"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.toAccountId && (
            <p className="text-xs text-destructive">
              {errors.toAccountId.message}
            </p>
          )}
        </div>
      ) : (
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
                <SelectTrigger
                  id="categoryId"
                  aria-invalid={!!errors.categoryId}
                >
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
      )}

      <div className="grid gap-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Note (optional)</Label>
        <Input
          id="description"
          type="text"
          placeholder="e.g. Lunch with team"
          {...register("description")}
        />
      </div>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
