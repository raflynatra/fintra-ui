import { UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Initials for a display name: first and last word, or one letter for a single
 * word. Returns an empty string when there's nothing to derive, so callers can
 * fall back to an icon.
 *
 * Uses `Array.from` rather than indexing, so a name starting with an emoji or
 * other non-BMP character isn't sliced into half a surrogate pair.
 */
export function getInitials(name: string | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";

  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words.at(-1)!)[0] ?? "") : "";

  return `${first}${last}`.toUpperCase();
}

const SIZE_CLASS = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-20 text-2xl",
} as const;

interface AvatarProps {
  name: string | undefined;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

/**
 * Identity mark built from a name's initials. Deliberately one fixed muted
 * colour rather than a per-user hue — coloured circles would read as series
 * identity, which is what the `--viz-*` slots mean elsewhere in the app.
 */
export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground select-none",
        SIZE_CLASS[size],
        className,
      )}
    >
      {initials || <UserIcon className="size-1/2" />}
    </span>
  );
}
