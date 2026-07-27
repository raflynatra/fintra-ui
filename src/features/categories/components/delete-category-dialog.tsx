"use client";

import type * as React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCategory } from "@/features/categories/hooks/use-delete-category";
import type { Category } from "@/features/categories/types";

interface DeleteCategoryDialogProps {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({
  category,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory();

  if (!category) return null;

  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        toast.success(`${category.name} has been deleted`);
        onOpenChange(false);
      },
      onError: (error) =>
        toast.error("Couldn't delete category", { description: error.message }),
    });
  };

  return (
    <AlertDialog open onOpenChange={(next) => !next && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Transactions in this category are kept and become uncategorized.{" "}
            <strong>Any budget for it is deleted with it.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCategory.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteCategory.isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
