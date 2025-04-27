import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Fingerprint, Shield, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '@/hooks/useAuth';
import { usePasswords } from '@/hooks/usePasswords';

export default function SettingsScreen() {
  const { resetPin, useBiometrics, toggleBiometrics } = useAuth();
  const { clearAllPasswords } = usePasswords();
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const router = useRouter();

  useState(() => {
    checkBiometrics();
  });

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricsAvailable(compatible && enrolled);
  };

  const handleResetPin = () => {
    Alert.alert(
      'Reset PIN',
      'Are you sure you want to reset your PIN? You will need to set a new PIN after this action.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetPin();
            Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleClearPasswords = () => {
    Alert.alert(
      'Delete All Passwords',
      'Are you sure you want to delete all passwords? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            clearAllPasswords();
            Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'All passwords have been deleted.');
          },
        },
      ]
    );
  };

  const handleToggleBiometrics = () => {
    Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBiometrics();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your app preferences and security settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleResetPin}>
          <View style={styles.settingIcon}>
            <Lock size={20} color="#1E40AF" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Change PIN</Text>
            <Text style={styles.settingDescription}>Change your app unlock PIN</Text>
          </View>
        </TouchableOpacity>

        {isBiometricsAvailable && (
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Fingerprint size={20} color="#1E40AF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Biometric Login</Text>
              <Text style={styles.settingDescription}>
                Use fingerprint or Face ID to unlock the app
              </Text>
            </View>
            <Switch
              value={useBiometrics}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={useBiometrics ? '#1E40AF' : '#F9FAFB'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Shield size={20} color="#1E40AF" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Auto-Lock</Text>
            <Text style={styles.settingDescription}>
              Automatically lock the app when not in use
            </Text>
          </View>
          <Switch
            value={true}
            disabled={true}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={'#1E40AF'}
            ios_backgroundColor="#D1D5DB"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleClearPasswords}>
          <View style={[styles.settingIcon, styles.dangerIcon]}>
            <Trash2 size={20} color="#DC2626" />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, styles.dangerText]}>Delete All Passwords</Text>
            <Text style={styles.settingDescription}>
              Remove all stored passwords from the app
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About Password Saver</Text>
        <Text style={styles.aboutDescription}>
          Password Saver is a secure app designed to help you store and manage your passwords locally on your device. Your passwords are encrypted and never sent to any server.
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: '#FEF2F2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  dangerText: {
    color: '#DC2626',
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  aboutSection: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 48,
  },
  aboutTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  aboutDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
});