import { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { useAuth } from '@/hooks/useAuth';
import { Password } from '@/types';

type PasswordContextType = {
  passwords: Password[];
  addPassword: (password: Password) => void;
  updatePassword: (password: Password) => void;
  deletePassword: (id: string) => void;
  getPasswordById: (id: string) => Password | undefined;
  clearAllPasswords: () => void;
};

export const PasswordContext = createContext<PasswordContextType>({
  passwords: [],
  addPassword: () => {},
  updatePassword: () => {},
  deletePassword: () => {},
  getPasswordById: () => undefined,
  clearAllPasswords: () => {},
});

interface PasswordProviderProps {
  children: ReactNode;
}

export function PasswordProvider({ children }: PasswordProviderProps) {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const { isAuthenticated, encryptionKey } = useAuth();

  useEffect(() => {
    if (isAuthenticated && encryptionKey) {
      loadPasswords();
    } else {
      setPasswords([]);
    }
  }, [isAuthenticated, encryptionKey]);

  const encryptData = (data: string) => {
    return CryptoJS.AES.encrypt(data, encryptionKey).toString();
  };

  const decryptData = (encryptedData: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return '';
    }
  };

  const loadPasswords = async () => {
    try {
      const encryptedData = await AsyncStorage.getItem('passwords');
      if (encryptedData) {
        const decrypted = decryptData(encryptedData);
        if (decrypted) {
          setPasswords(JSON.parse(decrypted));
        }
      }
    } catch (error) {
      console.error('Error loading passwords:', error);
    }
  };

  const savePasswords = async (data: Password[]) => {
    try {
      const encrypted = encryptData(JSON.stringify(data));
      await AsyncStorage.setItem('passwords', encrypted);
    } catch (error) {
      console.error('Error saving passwords:', error);
    }
  };

  const addPassword = (password: Password) => {
    const updatedPasswords = [...passwords, password];
    setPasswords(updatedPasswords);
    savePasswords(updatedPasswords);
  };

  const updatePassword = (password: Password) => {
    const updatedPasswords = passwords.map(p => 
      p.id === password.id ? password : p
    );
    setPasswords(updatedPasswords);
    savePasswords(updatedPasswords);
  };

  const deletePassword = (id: string) => {
    const updatedPasswords = passwords.filter(p => p.id !== id);
    setPasswords(updatedPasswords);
    savePasswords(updatedPasswords);
  };

  const getPasswordById = (id: string) => {
    return passwords.find(p => p.id === id);
  };

  const clearAllPasswords = () => {
    setPasswords([]);
    savePasswords([]);
  };

  return (
    <PasswordContext.Provider
      value={{
        passwords,
        addPassword,
        updatePassword,
        deletePassword,
        getPasswordById,
        clearAllPasswords,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
}