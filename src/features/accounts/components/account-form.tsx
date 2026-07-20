"use client";

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
import { accountSchema, ACCOUNT_TYPES } from "@/features/accounts/schema";
import { ACCOUNT_TYPE_LABEL } from "@/features/accounts/constants";
import type { AccountPayload } from "@/features/accounts/types";

/** Formats a signed amount for the input, preserving a leading minus sign. */
function formatSignedInput(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "";
  const formatted = formatAmountInput(Math.abs(value));
  return value < 0 ? `-${formatted}` : formatted;
}

interface AccountFormProps {
  title: string;
  description: string;
  defaultValues: Partial<AccountPayload>;
  onSubmit: (values: AccountPayload) => void;
  isPending?: boolean;
  submitLabel?: string;
  nameError?: string;
}

export function AccountForm({
  title,
  description,
  defaultValues,
  onSubmit,
  isPending = false,
  submitLabel = "Save",
  nameError,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AccountPayload>({
    resolver: zodResolver(accountSchema),
    defaultValues,
  });

  const type = useWatch({ control, name: "type" });

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
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Cash"
          autoFocus
          aria-invalid={!!errors.name || !!nameError}
          {...register("name")}
        />
        {(errors.name || nameError) && (
          <p className="text-xs text-destructive">
            {errors.name?.message ?? nameError}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label>Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_TYPES.map((option) => (
            <Button
              key={option}
              type="button"
              variant="outline"
              onClick={() => setValue("type", option)}
              aria-pressed={type === option}
              className={cn(
                "h-auto justify-start py-2.5",
                type === option
                  ? "border-primary bg-primary/5 text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {ACCOUNT_TYPE_LABEL[option]}
            </Button>
          ))}
        </div>
        {errors.type && (
          <p className="text-xs text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="initialBalance">Starting balance (optional)</Label>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-muted-foreground">
            Rp
          </span>
          <Controller
            control={control}
            name="initialBalance"
            render={({ field: { value, onChange, ...field } }) => (
              <Input
                id="initialBalance"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatSignedInput(value)}
                onChange={(e) => {
                  const raw = e.target.value;
                  const isNegative = raw.trim().startsWith("-");
                  const digits = raw.replace(/\D/g, "");
                  if (!digits) {
                    onChange(undefined);
                    return;
                  }
                  const amount = Number(digits);
                  onChange(isNegative ? -amount : amount);
                }}
                {...field}
              />
            )}
          />
        </div>
        {errors.initialBalance ? (
          <p className="text-xs text-destructive">
            {errors.initialBalance.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            What&apos;s in the account right now. Use a minus sign for money
            owed.
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader className="animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
