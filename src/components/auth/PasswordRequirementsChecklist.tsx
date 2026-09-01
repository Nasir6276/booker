'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsChecklistProps {
  password?: string;
}

export default function PasswordRequirementsChecklist({ password = '' }: PasswordRequirementsChecklistProps) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least one number', met: /[0-9]/.test(password) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(password) }
  ];

  return (
    <div className="space-y-1.5 p-3.5 bg-background dark:bg-background/20 rounded-input border border-border/50 text-xs">
      <span className="font-semibold text-muted tracking-wide uppercase text-[10px] block mb-1">
        Password Requirements
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 font-medium">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 transition-colors duration-200 ${
              req.met ? 'text-primary dark:text-accent' : 'text-muted'
            }`}
          >
            {req.met ? (
              <Check size={12} className="shrink-0 text-primary dark:text-accent" />
            ) : (
              <X size={12} className="shrink-0 text-secondary" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
