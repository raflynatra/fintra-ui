import { BackLink } from "@/components/dashboard";
import { APP_ROUTES } from "@/lib/constants";

/**
 * Frame for settings detail pages. Renders a back link to the hub above the
 * page content; the hub itself sits outside this route group and stays
 * back-button-free.
 */
export default function SettingsDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <BackLink href={APP_ROUTES.settings} label="Settings" />

      {children}
    </div>
  );
}
