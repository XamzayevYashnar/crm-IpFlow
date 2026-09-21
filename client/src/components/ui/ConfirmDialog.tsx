import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "O'chirish",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-slate-600">{description}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
