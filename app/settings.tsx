import { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Fingerprint, CircleHelp, Shield, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { usePasswords } from '@/hooks/usePasswords';

export default function SettingsScreen() {
  const { resetPin, useBiometrics, toggleBiometrics } = useAuth();
  const { clearAllPasswords } = usePasswords();
  const router = useRouter();

  const handleResetPin = () => {
    Alert.alert(
      'Reset PIN',
      'Are you sure you want to reset your PIN? This will log you out and you will need to create a new PIN.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            resetPin();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleClearPasswords = () => {
    Alert.alert(
      'Delete All Passwords',
      'Are you sure you want to delete all your passwords? This action cannot be undone.',
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
            clearAllPasswords();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleResetPin}>
          <View style={styles.settingIcon}>
            <CircleHelp size={20} color="#6366F1" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Reset PIN</Text>
            <Text style={styles.settingDescription}>
              Create a new PIN for app access
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Fingerprint size={20} color="#6366F1" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Use Biometrics</Text>
            <Text style={styles.settingDescription}>
              Enable Face ID or fingerprint login
            </Text>
          </View>
          <Switch
            value={useBiometrics}
            onValueChange={toggleBiometrics}
            trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
            thumbColor={useBiometrics ? '#6366F1' : '#9CA3AF'}
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Shield size={20} color="#6366F1" />
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
            trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
            thumbColor={'#6366F1'}
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
    backgroundColor: '#F5F7FA',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
    backgroundColor: '#EEF2FF',
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