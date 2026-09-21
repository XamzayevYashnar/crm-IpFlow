type ToastKind = "success" | "error";
export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(kind: ToastKind, message: string) {
  const id = nextId++;
  toasts = [...toasts, { id, kind, message }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3500);
}

export const toast = {
  success: (message: string) => pushToast("success", message),
  error: (message: string) => pushToast("error", message),
};
