import { useContext } from 'react';
import { PasswordContext } from '@/context/PasswordContext';

export function usePasswords() {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePasswords must be used within a PasswordProvider');
  }
  return context;
}