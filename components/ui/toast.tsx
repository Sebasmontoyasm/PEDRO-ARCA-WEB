"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils2";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border p-4 pr-6 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-yellow-500 text-slate-900 border-yellow-600",
        destructive: "bg-red-600 text-white border-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(({ className, variant, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(toastVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
});
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
);
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
);
ToastDescription.displayName = "ToastDescription";

export const ToastClose = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} className="absolute right-2 top-2 rounded-md p-1 text-white/80 hover:text-white">✕</button>
);

export const ToastViewport = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "fixed top-6 right-6 z-[1200] flex flex-col gap-3 max-w-sm w-full",
      className
    )}
    {...props}
  />
);
