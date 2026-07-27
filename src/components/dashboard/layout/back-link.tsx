import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

interface BackLinkProps {
  /** Where the link returns to — the parent of the current detail page. */
  href: string;
  label: string;
}

/** Return link rendered above a detail page's content. */
export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      {label}
    </Link>
  );
}
