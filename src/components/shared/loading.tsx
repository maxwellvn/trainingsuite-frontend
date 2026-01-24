"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/t";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const { t } = useT();
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{t(text)}</p>}
    </div>
  );
}

export function PageLoading() {
  const { t } = useT();
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading size="lg" text={t("Loading...")} />
    </div>
  );
}

export function FullPageLoading() {
  const { t } = useT();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text={t("Loading...")} />
    </div>
  );
}
