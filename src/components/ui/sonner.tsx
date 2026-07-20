"use client";

import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  LoaderIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

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
      position="top-center"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        error: <CircleXIcon className="size-4 text-destructive" />,
        warning: <TriangleAlertIcon className="size-4 text-foreground" />,
        info: <InfoIcon className="size-4 text-muted-foreground" />,
        loading: <LoaderIcon className="size-4 animate-spin" />,
        close: <XIcon className="size-4" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
