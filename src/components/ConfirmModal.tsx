'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-surface border border-border rounded-card shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
            <h3 className="font-serif text-base font-semibold text-primary flex items-center gap-2">
              {isDangerous && <AlertTriangle size={16} className="text-secondary animate-pulse" />}
              <span>{title}</span>
            </h3>
            <button 
              onClick={onCancel}
              className="p-1 text-muted hover:text-foreground rounded-full hover:bg-background transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-muted leading-relaxed font-sans">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-background/50">
            <button
              onClick={onCancel}
              className="text-xs text-muted hover:text-foreground font-semibold px-4 py-2 hover:bg-background rounded-full transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`py-2 px-5 rounded-full text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer ${
                isDangerous 
                  ? 'bg-secondary hover:bg-secondary/95 text-white' 
                  : 'bg-primary hover:bg-primary/95 text-white'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
