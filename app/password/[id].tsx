import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff, Save, ArrowLeft, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { usePasswords } from '@/hooks/usePasswords';
import { checkPasswordStrength } from '@/utils/passwordUtils';

export default function EditPasswordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPasswordById, updatePassword, deletePassword } = usePasswords();
  
  const [password, setPassword] = useState({
    id: '',
    appName: '',
    username: '',
    emailOrPhone: '',
    password: '',
    createdAt: '',
  });
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState<{ score: number; label: string }>({ score: 0, label: '' });

  useEffect(() => {
    if (id) {
      const passwordData = getPasswordById(id);
      if (passwordData) {
        setPassword(passwordData);
        updatePasswordStrength(passwordData.password);
      }
    }
  }, [id]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updatePasswordStrength = (pwd: string) => {
    const result = checkPasswordStrength(pwd);
    setStrength(result);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!password.appName.trim()) newErrors.appName = 'App name is required';
    if (!password.username.trim()) newErrors.username = 'Username is required';
    if (!password.emailOrPhone.trim()) newErrors.emailOrPhone = 'Email or phone is required';
    if (!password.password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (validateForm()) {
      updatePassword(password);
      Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = () => {
    Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deletePassword(password.id);
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Password</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>App or Website Name</Text>
            <TextInput
              style={[styles.input, errors.appName ? styles.inputError : null]}
              value={password.appName}
              onChangeText={(text) => {
                setPassword({ ...password, appName: text });
                if (errors.appName) setErrors({ ...errors, appName: '' });
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
              value={password.username}
              onChangeText={(text) => {
                setPassword({ ...password, username: text });
                if (errors.username) setErrors({ ...errors, username: '' });
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
              value={password.emailOrPhone}
              onChangeText={(text) => {
                setPassword({ ...password, emailOrPhone: text });
                if (errors.emailOrPhone) setErrors({ ...errors, emailOrPhone: '' });
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
                value={password.password}
                onChangeText={(text) => {
                  setPassword({ ...password, password: text });
                  updatePasswordStrength(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
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

            {password.password.length > 0 && (
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
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
  },
  deleteButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
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
});