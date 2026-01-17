import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, variant = "default" } = options;

    switch (variant) {
      case "destructive":
        sonnerToast.error(title, { description });
        break;
      case "success":
        sonnerToast.success(title, { description });
        break;
      default:
        sonnerToast(title, { description });
    }
  };

  return { toast };
}

export { useToast as default };
