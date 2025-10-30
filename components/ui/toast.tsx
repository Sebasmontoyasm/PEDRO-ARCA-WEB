"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  onOpenChange?: (open: boolean) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = "ToastDescription"

const ToastClose = ({
  onClick,
}: {
  onClick?: () => void
}) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-2 rounded-md p-1 text-foreground/70 hover:text-foreground"
  >
    ✕
  </button>
)

const ToastViewport = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "fixed bottom-6 right-6 z-[1000] flex flex-col space-y-3",
      className
    )}
    {...props}
  />
)

export { Toast, ToastTitle, ToastDescription, ToastClose, ToastViewport }
