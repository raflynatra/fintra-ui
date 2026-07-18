"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, WalletIcon } from "lucide-react";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionFormSchema, TRANSACTION_TYPES } from "@/features/transactions/schema";
import { TRANSACTION_TYPE_LABEL } from "@/features/transactions/constants";
import { useCategories, toCategoryType } from "@/features/categories";
import { useAccounts } from "@/features/accounts";
import type {
  TransactionFormValues,
  TransactionType,
} from "@/features/transactions/types";

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * A factory rather than a constant: `date` must be evaluated when the sheet
 * opens, not once at module load, or a long-lived tab defaults to a stale date.
 * Callers must memoize the result — `TransactionForm` resets on identity change.
 */
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
  title: string;
  description: string;
  defaultValues: Partial<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
  isPending?: boolean;
  submitLabel?: string;
  /**
   * Edit mode: an existing transaction may sit on a since-archived account, so
   * the picker has to list archived ones to resolve its current value.
   */
  includeArchivedAccounts?: boolean;
  /**
   * Which types this form may produce. Edit mode narrows it: the backend
   * rejects converting a transaction into or out of a transfer with
   * TRANSFER_TYPE_IMMUTABLE (409), so the option simply isn't offered.
   */
  typeOptions?: readonly TransactionType[];
  /** Renders the type as a static badge — for editing an immutable transfer. */
  readOnlyType?: boolean;
  /** Slot beside the title, e.g. the edit sheet's delete action. */
  headerAction?: React.ReactNode;
}

export function TransactionForm({
  title,
  description,
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Save",
  includeArchivedAccounts = false,
  typeOptions = TRANSACTION_TYPES,
  readOnlyType = false,
  headerAction,
}: TransactionFormProps) {
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

  // Re-sync the form whenever the caller hands us new default values (e.g.
  // the edit sheet opening on a different row).
  React.useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const type = useWatch({ control, name: "type" });
  const accountId = useWatch({ control, name: "accountId" });
  const isTransfer = type === "transfer";

  // A transfer has no category, so there's nothing to fetch for one.
  const { data: categories, isLoading: categoriesLoading } = useCategories(
    toCategoryType(type),
  );
  const { data: accounts, isLoading: accountsLoading } = useAccounts({
    includeArchived: includeArchivedAccounts,
  });

  // Both fields are arm-specific, so switching type invalidates whichever was
  // picked under the old one. `toWritePayload` drops the loser at the boundary
  // too, but clearing here keeps the UI honest.
  const handleTypeChange = (next: TransactionType) => {
    setValue("type", next);
    setValue("categoryId", "");
    setValue("toAccountId", "");
  };

  // Every transaction needs an account, and registration doesn't create one, so
  // a new user lands here with nothing to pick. Send them to make one rather
  // than showing a form that can't be submitted.
  if (!accountsLoading && accounts?.length === 0) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-3 pb-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <VisuallyHidden.Root asChild>
            <DialogDescription>{description}</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WalletIcon />
            </EmptyMedia>
            <EmptyTitle>Create an account first</EmptyTitle>
            <EmptyDescription>
              Transactions are recorded against an account — cash, a bank
              account, or an e-wallet. Add one to start tracking.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link href="/accounts">Go to accounts</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

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

      {/* Type toggle. Locked when editing a transfer: the backend rejects
          converting one into or out of a transfer (TRANSFER_TYPE_IMMUTABLE). */}
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

      {/* Account (the source, for a transfer) */}
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
                    // An archived account stays selectable only where it's
                    // already the transaction's account; moving onto one would
                    // be rejected with ACCOUNT_ARCHIVED.
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

      {/* Destination account, or category — the two are mutually exclusive, and
          share this slot so switching type doesn't shift the layout. */}
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
                      // Can't transfer to the source (TRANSFER_SAME_ACCOUNT),
                      // or onto an archived account (ACCOUNT_ARCHIVED).
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

      <div className="flex w-full justify-center gap-2">
        <Button
          type="button"
          variant="destructive"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            // onDelete(transaction);
          }}
        >
          Delete
        </Button>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? <Loader className="animate-spin" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
