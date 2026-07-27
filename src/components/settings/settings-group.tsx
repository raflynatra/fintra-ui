import { Card } from "@/components/ui/card";

interface SettingsGroupProps {
  label: string;
  children: React.ReactNode;
}

/** A titled section of related settings rows. */
export function SettingsGroup({ label, children }: SettingsGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </h3>

      <Card className="gap-0 divide-y divide-border p-0">{children}</Card>
    </section>
  );
}
