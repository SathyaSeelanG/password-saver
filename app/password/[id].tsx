import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Platform, 
  KeyboardAvoidingView 
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Save, Eye, EyeOff, Trash2 } from 'lucide-react-native';
import { usePasswords } from '@/hooks/usePasswords';
import { Password } from '@/types';

export default function PasswordDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPasswordById, addPassword, updatePassword, deletePassword } = usePasswords();
  
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const isNew = params.id === 'new';
  const passwordId = params.id;

  useEffect(() => {
    if (!isNew) {
      const existingPassword = getPasswordById(passwordId);
      if (existingPassword) {
        setAppName(existingPassword.appName);
        setUsername(existingPassword.username);
        setEmailOrPhone(existingPassword.emailOrPhone);
        setPassword(existingPassword.password);
      }
    }
  }, [isNew, passwordId, getPasswordById]);

  useEffect(() => {
    setIsFormValid(
      appName.trim() !== '' && 
      (username.trim() !== '' || emailOrPhone.trim() !== '') && 
      password.trim() !== ''
    );
  }, [appName, username, emailOrPhone, password]);

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSave = () => {
    if (!isFormValid) return;

    Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const passwordData: Password = {
      id: isNew ? Date.now().toString() : passwordId,
      appName,
      username,
      emailOrPhone,
      password,
      createdAt: isNew ? new Date().toISOString() : getPasswordById(passwordId)?.createdAt || new Date().toISOString(),
    };

    if (isNew) {
      addPassword(passwordData);
    } else {
      updatePassword(passwordData);
    }

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Password',
      `Are you sure you want to delete the password for ${appName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deletePassword(passwordId);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Stack.Screen 
        options={{ 
          title: isNew ? 'Add Password' : 'Edit Password',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={!isFormValid}
              style={[
                styles.saveButton, 
                !isFormValid && styles.saveButtonDisabled
              ]}
            >
              <Save size={20} color="white" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.label}>App/Website Name</Text>
        <TextInput
          style={styles.input}
          value={appName}
          onChangeText={setAppName}
          placeholder="e.g. Gmail, Facebook"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="e.g. johndoe123"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Email or Phone</Text>
        <TextInput
          style={styles.input}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          placeholder="e.g. john@example.com, +1234567890"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.visibilityButton}
            onPress={handleTogglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color="#6366F1" />
            ) : (
              <Eye size={20} color="#6366F1" />
            )}
          </TouchableOpacity>
        </View>

        {!isNew && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Password</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: 'Inter-Regular',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  visibilityButton: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7D2FE',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  deleteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});