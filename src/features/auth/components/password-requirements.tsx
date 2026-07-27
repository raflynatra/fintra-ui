import { CircleCheck, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { PASSWORD_RULES } from "@/features/auth/schema";

interface PasswordRequirementsProps {
  value: string | undefined;
}

/**
 * Ticks off each password rule as it's met. Driven by `PASSWORD_RULES`, the same
 * array `passwordSchema` validates against, so the list can't drift from what
 * the form actually enforces.
 */
export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const password = value ?? "";

  return (
    <ul aria-live="polite" className="flex flex-col gap-1">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        const Icon = met ? CircleCheck : CircleIcon;

        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1 text-xs",
              met ? "text-primary" : "text-muted-foreground",
            )}
          >
            {/* Icon and label carry the state; colour alone never does. */}
            <Icon className={cn("h-3 w-3", !met && "opacity-50")} />
            <span>{rule.label}</span>
            <span className="sr-only">{met ? " — met" : " — not met yet"}</span>
          </li>
        );
      })}
    </ul>
  );
}
