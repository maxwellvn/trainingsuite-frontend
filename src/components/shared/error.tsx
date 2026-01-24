"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { T, useT } from "@/components/t";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title,
  message,
  onRetry,
  className,
}: ErrorDisplayProps) {
  const { t } = useT();
  const displayTitle = title || t("Something went wrong");
  const displayMessage = message || t("An unexpected error occurred. Please try again.");
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{displayMessage}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          <T>Try again</T>
        </Button>
      )}
    </div>
  );
}

export function PageError({
  title,
  message,
  onRetry,
}: Omit<ErrorDisplayProps, "className">) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <ErrorDisplay title={title} message={message} onRetry={onRetry} />
    </div>
  );
}
