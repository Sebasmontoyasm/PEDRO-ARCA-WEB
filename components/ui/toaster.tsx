"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast
          key={id}
          variant={variant}
          onOpenChange={() => dismiss(id)}
          className={`${
            variant === "destructive"
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => dismiss(id)} />
        </Toast>
      ))}
      <ToastViewport />
    </>
  )
}
