import { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

type AuthContextType = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isPinSetup: boolean;
  useBiometrics: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  setupPin: (pin: string) => void;
  resetPin: () => void;
  encryptionKey: string;
  toggleBiometrics: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  isAuthenticated: false,
  isPinSetup: false,
  useBiometrics: false,
  login: () => false,
  logout: () => {},
  setupPin: () => {},
  resetPin: () => {},
  encryptionKey: '',
  toggleBiometrics: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinSetup, setIsPinSetup] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [pinHash, setPinHash] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedPinHash = await AsyncStorage.getItem('pinHash');
        const storedBiometrics = await AsyncStorage.getItem('useBiometrics');
        
        if (storedPinHash) {
          setPinHash(storedPinHash);
          setIsPinSetup(true);
        }
        
        if (storedBiometrics === 'true') {
          setUseBiometrics(true);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const hashPin = (pin: string) => {
    return CryptoJS.SHA256(pin).toString();
  };

  const deriveDerivedKey = (pin: string) => {
    // This is a simple key derivation for demo purposes
    // In a production app, you'd use a more secure key derivation function
    return CryptoJS.PBKDF2(pin, 'PasswordSaver', { keySize: 256/32, iterations: 1000 }).toString();
  };

  const login = (pin: string) => {
    const hashedPin = hashPin(pin);
    const isValid = hashedPin === pinHash;
    
    if (isValid) {
      setIsAuthenticated(true);
      const derivedKey = deriveDerivedKey(pin);
      setEncryptionKey(derivedKey);
    }
    
    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setEncryptionKey('');
  };

  const setupPin = async (pin: string) => {
    try {
      const hashedPin = hashPin(pin);
      await AsyncStorage.setItem('pinHash', hashedPin);
      
      setPinHash(hashedPin);
      setIsPinSetup(true);
      
      const derivedKey = deriveDerivedKey(pin);
      setEncryptionKey(derivedKey);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error setting up PIN:', error);
    }
  };

  const resetPin = async () => {
    try {
      await AsyncStorage.removeItem('pinHash');
      setPinHash('');
      setIsPinSetup(false);
      setIsAuthenticated(false);
      setEncryptionKey('');
    } catch (error) {
      console.error('Error resetting PIN:', error);
    }
  };

  const toggleBiometrics = async () => {
    try {
      const newValue = !useBiometrics;
      setUseBiometrics(newValue);
      await AsyncStorage.setItem('useBiometrics', newValue.toString());
    } catch (error) {
      console.error('Error toggling biometrics:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isAuthenticated,
        isPinSetup,
        useBiometrics,
        login,
        logout,
        setupPin,
        resetPin,
        encryptionKey,
        toggleBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}