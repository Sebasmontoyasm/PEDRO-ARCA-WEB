import { useToastContext } from "@/components/ui/toaster-provider";

export function useToast() {
  const { push, dismiss } = useToastContext();

  return {
    toast: (options: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
      duration?: number;
    }) => push(options),
    dismiss,
  };
}
