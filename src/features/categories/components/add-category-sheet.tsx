"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { VisuallyHidden } from "radix-ui";

import { cn } from "@/lib/utils";
import { SHEET_CONTENT_CLASS } from "@/lib/constants";
import { ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateCategory } from "@/features/categories/hooks/use-create-category";
import { categorySchema, CATEGORY_TYPES } from "@/features/categories/schema";
import type {
  CategoryPayload,
  CategoryType,
} from "@/features/categories/types";

const TYPE_LABEL: Record<CategoryType, string> = {
  expense: "Expense",
  income: "Income",
};

interface AddCategorySheetProps {
  trigger: React.ReactNode;
}

export function AddCategorySheet({ trigger }: AddCategorySheetProps) {
  const [open, setOpen] = React.useState(false);
  const createCategory = useCreateCategory();
  const [nameError, setNameError] = React.useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryPayload>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", type: "expense" },
  });

  const type = useWatch({ control, name: "type" });

  React.useEffect(() => {
    if (open) {
      reset({ name: "", type: "expense" });
      setNameError(undefined);
    }
  }, [open, reset]);

  const onSubmit = (values: CategoryPayload) => {
    setNameError(undefined);

    createCategory.mutate(values, {
      onSuccess: (created) => {
        toast.success(`${created.name} has been added`);
        setOpen(false);
      },
      onError: (error) => {
        if (
          error instanceof ApiClientError &&
          error.code === "CATEGORY_ALREADY_EXISTS"
        ) {
          setNameError(error.message);
          return;
        }
        toast.error("Couldn't add category", { description: error.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent showClose={false} className={SHEET_CONTENT_CLASS}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-5 pt-3 pb-6"
        >
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <VisuallyHidden.Root asChild>
              <DialogDescription>
                Create a category for your transactions.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Coffee"
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
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {CATEGORY_TYPES.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="ghost"
                  onClick={() => setValue("type", option)}
                  aria-pressed={type === option}
                  className={cn(
                    "h-auto rounded-md px-1 py-2 hover:bg-transparent",
                    type === option
                      ? "bg-card text-foreground shadow-sm hover:bg-card"
                      : "text-muted-foreground",
                  )}
                >
                  {TYPE_LABEL[option]}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? (
              <Loader className="animate-spin" />
            ) : (
              "Add category"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
