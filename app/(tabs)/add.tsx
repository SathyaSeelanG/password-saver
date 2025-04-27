import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Eye, EyeOff, RefreshCw, Check, CircleAlert as AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { usePasswords } from '@/hooks/usePasswords';
import { useRouter } from 'expo-router';
import { generatePassword, checkPasswordStrength } from '@/utils/passwordUtils';

export default function AddPasswordScreen() {
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState<{ score: number; label: string }>({ score: 0, label: '' });
  
  const { addPassword } = usePasswords();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(12);
    setPassword(newPassword);
    Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updatePasswordStrength(newPassword);
  };

  const updatePasswordStrength = (pwd: string) => {
    const result = checkPasswordStrength(pwd);
    setStrength(result);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!appName.trim()) newErrors.appName = 'App name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!emailOrPhone.trim()) newErrors.emailOrPhone = 'Email or phone is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      addPassword({
        id: Date.now().toString(),
        appName,
        username,
        emailOrPhone,
        password,
        createdAt: new Date().toISOString(),
      });
      
      Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    } else {
      Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>App or Website Name</Text>
            <TextInput
              style={[styles.input, errors.appName ? styles.inputError : null]}
              value={appName}
              onChangeText={(text) => {
                setAppName(text);
                if (errors.appName) {
                  setErrors({ ...errors, appName: '' });
                }
              }}
              placeholder="Ex: Netflix, Gmail"
              placeholderTextColor="#9CA3AF"
            />
            {errors.appName ? (
              <Text style={styles.errorText}>{errors.appName}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors({ ...errors, username: '' });
                }
              }}
              placeholder="Your username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
            {errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email or Phone Number</Text>
            <TextInput
              style={[styles.input, errors.emailOrPhone ? styles.inputError : null]}
              value={emailOrPhone}
              onChangeText={(text) => {
                setEmailOrPhone(text);
                if (errors.emailOrPhone) {
                  setErrors({ ...errors, emailOrPhone: '' });
                }
              }}
              placeholder="email@example.com or phone number"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.emailOrPhone ? (
              <Text style={styles.errorText}>{errors.emailOrPhone}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  updatePasswordStrength(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.iconButton}
                onPress={togglePasswordVisibility}
              >
                {isPasswordVisible ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>Strength:</Text>
                <View style={styles.strengthBarContainer}>
                  {[1, 2, 3, 4].map((score) => (
                    <View
                      key={score}
                      style={[
                        styles.strengthBar,
                        score <= strength.score
                          ? styles[`strength${strength.score}`]
                          : styles.strengthEmpty,
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    styles[`strengthText${strength.score}`],
                  ]}
                >
                  {strength.label}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGeneratePassword}
            >
              <RefreshCw size={16} color="#1E40AF" />
              <Text style={styles.generateButtonText}>Generate Strong Password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Check size={20} color="white" />
            <Text style={styles.submitButtonText}>Save Password</Text>
          </TouchableOpacity>
          
          <View style={styles.securityNote}>
            <AlertCircle size={16} color="#6B7280" />
            <Text style={styles.securityNoteText}>
              All passwords are encrypted and stored locally on your device.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#DC2626',
    marginTop: 6,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
  },
  iconButton: {
    padding: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  generateButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
    marginLeft: 8,
    fontSize: 14,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  strengthLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    marginRight: 4,
    borderRadius: 2,
  },
  strengthEmpty: {
    backgroundColor: '#E5E7EB',
  },
  strength1: {
    backgroundColor: '#EF4444',
  },
  strength2: {
    backgroundColor: '#F59E0B',
  },
  strength3: {
    backgroundColor: '#10B981',
  },
  strength4: {
    backgroundColor: '#059669',
  },
  strengthText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  strengthText1: {
    color: '#EF4444',
  },
  strengthText2: {
    color: '#F59E0B',
  },
  strengthText3: {
    color: '#10B981',
  },
  strengthText4: {
    color: '#059669',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitButtonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  securityNoteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
});