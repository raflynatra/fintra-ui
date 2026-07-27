import Link from "next/link";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  /** Secondary text shown on the right, before the chevron. */
  value?: string;
  /** Destination. Omit for a row that isn't navigable yet. */
  href?: string;
  /** Renders the row muted with a "Soon" badge and no link. */
  disabled?: boolean;
}

const ROW_CLASS =
  "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left text-sm";

/** One entry in a settings group — a link, or a muted placeholder for work not yet shipped. */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  href,
  disabled,
}: SettingsRowProps) {
  const content = (
    <>
      <Icon
        className={cn(
          "size-5 shrink-0",
          disabled ? "text-muted-foreground/60" : "text-muted-foreground",
        )}
      />

      <span className={cn("flex-1 font-medium", disabled && "opacity-60")}>
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

  if (disabled || !href) {
    return <div className={ROW_CLASS}>{content}</div>;
  }

  return (
    <Link href={href} className={cn(ROW_CLASS, "transition-colors hover:bg-muted")}>
      {content}
    </Link>
  );
}
