"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

// Minimal wrapper around sonner's Toaster. The project doesn't use `next-themes`,
// so the theme is left to sonner's default; styling is aligned to the design
// system via CSS variables.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
