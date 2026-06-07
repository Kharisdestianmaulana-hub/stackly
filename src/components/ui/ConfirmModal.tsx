import * as React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  isDanger = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card-elevated border border-border-strong rounded-xl w-full max-w-md shadow-glass overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${isDanger ? 'bg-danger/10 text-danger' : 'bg-primary-blue/10 text-primary-blue'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-bold text-text-primary">{title}</h3>
              <div className="text-text-secondary mt-2 text-sm leading-relaxed whitespace-pre-line">
                {message}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-sidebar border-t border-border-soft flex justify-end space-x-3">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button 
            variant={isDanger ? 'danger' : 'primary'} 
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
