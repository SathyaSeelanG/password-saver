import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { StatusBar } from 'expo-status-bar';
import { Lock, Fingerprint } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const { login, setupPin, isPinSetup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(compatible && enrolled);
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (!isPinSetup) {
      setupPin(pin);
      router.replace('/(tabs)');
    } else {
      const success = login(pin);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your passwords',
        fallbackLabel: 'Use PIN instead',
      });

      if (result.success) {
        Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Authentication error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <View style={styles.logoContainer}>
        <BlurView intensity={30} style={styles.blurBadge}>
          <Lock color="#1E40AF" size={60} />
        </BlurView>
        <Text style={styles.title}>Password Saver</Text>
        <Text style={styles.subtitle}>
          {!isPinSetup ? 'Create a PIN to secure your passwords' : 'Enter your PIN to unlock'}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.pinInput}
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN"
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          placeholderTextColor="#9CA3AF"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity style={styles.button} onPress={handlePinSubmit}>
          <Text style={styles.buttonText}>
            {!isPinSetup ? 'Set PIN' : 'Unlock'}
          </Text>
        </TouchableOpacity>

        {hasBiometrics && isPinSetup && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
            <Fingerprint color="#1E40AF" size={24} />
            <Text style={styles.biometricText}>Use Biometrics</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  blurBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(219, 234, 254, 0.8)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginHorizontal: 24,
  },
  inputContainer: {
    alignItems: 'center',
  },
  pinInput: {
    fontFamily: 'Inter-Medium',
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: 'white',
    marginBottom: 16,
    color: '#1F2937',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginBottom: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 12,
  },
  biometricText: {
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    marginLeft: 8,
    fontSize: 16,
  },
});