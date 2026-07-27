import Link from "next/link";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  /** Secondary text shown on the right, before the chevron. */
  value?: string;
  /** Destination for a navigating row. Mutually exclusive with `onClick`. */
  href?: string;
  /** Opens a sheet or dialog instead of navigating. */
  onClick?: () => void;
  /** Renders the row muted with a "Soon" badge and no interaction. */
  disabled?: boolean;
  /** For irreversible actions — tints the label and icon. */
  destructive?: boolean;
}

const ROW_CLASS =
  "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left text-sm";
const INTERACTIVE_CLASS = "transition-colors hover:bg-muted";

/** One entry in a settings group — a link, a button, or a muted placeholder. */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  href,
  onClick,
  disabled,
  destructive,
}: SettingsRowProps) {
  const content = (
    <>
      <Icon
        className={cn(
          "size-5 shrink-0",
          disabled
            ? "text-muted-foreground/60"
            : destructive
              ? "text-destructive"
              : "text-muted-foreground",
        )}
      />

      <span
        className={cn(
          "flex-1 font-medium",
          disabled && "opacity-60",
          destructive && "text-destructive",
        )}
      >
        {label}
      </span>

      {value && (
        <span className="max-w-[45%] truncate text-muted-foreground">
          {value}
        </span>
      )}

      {disabled ? (
        <Badge variant="secondary">Soon</Badge>
      ) : (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
    </>
  );

  if (!disabled && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(ROW_CLASS, INTERACTIVE_CLASS, "cursor-pointer")}
      >
        {content}
      </button>
    );
  }

  if (!disabled && href) {
    return (
      <Link href={href} className={cn(ROW_CLASS, INTERACTIVE_CLASS)}>
        {content}
      </Link>
    );
  }

  return <div className={ROW_CLASS}>{content}</div>;
}
