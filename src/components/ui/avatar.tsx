"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn, getMediaUrl } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  src,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  // Only transform valid string URLs, pass through Blob/undefined as-is
  const hasValidSrc = src && (typeof src === "string" ? src.trim() !== "" : true);
  const transformedSrc = typeof src === "string" ? getMediaUrl(src) : src;

  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      src={hasValidSrc ? transformedSrc : undefined}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
