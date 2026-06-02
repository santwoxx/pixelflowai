'use client';

import React from 'react';
import { AuthProvider } from './auth-context';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
