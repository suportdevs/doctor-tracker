'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Spinner } from './Spinner';

export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onClose, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={(
        <>
          <button type="button" className="a-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="a-btn-danger" onClick={onConfirm} disabled={loading}>{loading && <Spinner />}{confirmLabel}</button>
        </>
      )}
    >
      <div className="flex gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10"><AlertTriangle className="h-5 w-5" /></span>
        <p className="pt-2 text-sm text-ink-600 dark:text-ink-300">{message}</p>
      </div>
    </Modal>
  );
}
