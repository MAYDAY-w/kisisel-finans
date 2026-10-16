import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  message = 'Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?',
  confirmText = 'Evet, Sil',
  cancelText = 'Vazgeç',
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{message}</p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="secondary" onClick={onClose} size="md">
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            size="md"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
