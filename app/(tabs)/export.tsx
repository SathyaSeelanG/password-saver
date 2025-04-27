import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import { Download, FileText, FileSpreadsheet, Table } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { usePasswords } from '@/hooks/usePasswords';
import { exportPdf, exportExcel, exportCsv } from '@/utils/exportUtils';
import EmptyState from '@/components/EmptyState';

export default function ExportScreen() {
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const { passwords } = usePasswords();

  const handleExport = async (type: string) => {
    if (passwords.length === 0) {
      Alert.alert('No Passwords', 'You have no passwords to export.');
      return;
    }

    try {
      setExporting(true);
      setExportType(type);
      Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let fileUri: string;
      let fileName: string;
      let fileContent: string | Blob;

      switch (type) {
        case 'pdf':
          fileContent = await exportPdf(passwords);
          fileName = 'passwords.pdf';
          break;
        case 'excel':
          fileContent = await exportExcel(passwords);
          fileName = 'passwords.xlsx';
          break;
        case 'csv':
          fileContent = await exportCsv(passwords);
          fileName = 'passwords.csv';
          break;
        default:
          throw new Error('Unsupported export type');
      }

      if (Platform.OS === 'web') {
        // For web, we can use the Blob API and download via URL
        if (fileContent instanceof Blob) {
          const url = URL.createObjectURL(fileContent);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // For text content like CSV
          const blob = new Blob([fileContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // For native platforms
        const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        if (!directory) throw new Error('No valid directory found');
        
        fileUri = `${directory}${fileName}`;
        
        if (typeof fileContent === 'string') {
          await FileSystem.writeAsStringAsync(fileUri, fileContent);
        } else {
          // For binary content, we'd need to convert from Blob
          // This is a simplification, actual implementation might differ
          const reader = new FileReader();
          reader.readAsArrayBuffer(fileContent);
          const buffer = await new Promise<ArrayBuffer>((resolve) => {
            reader.onloadend = () => resolve(reader.result as ArrayBuffer);
          });
          await FileSystem.writeAsStringAsync(fileUri, Buffer.from(buffer).toString('base64'), {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      }

      setExporting(false);
      setExportType(null);
      Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Export error:', error);
      setExporting(false);
      setExportType(null);
      Alert.alert('Export Error', 'Failed to export passwords. Please try again.');
      Platform.OS !== 'web' && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Export Passwords</Text>
        <Text style={styles.headerDescription}>
          Export your saved passwords in various formats for backup or use in other applications.
        </Text>
      </View>

      {passwords.length === 0 ? (
        <EmptyState message="No passwords to export" />
      ) : (
        <View style={styles.exportOptions}>
          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => handleExport('pdf')}
            disabled={exporting}
          >
            <View style={[styles.iconContainer, styles.pdfIconContainer]}>
              <FileText size={24} color="#DC2626" />
            </View>
            <Text style={styles.exportTitle}>PDF Format</Text>
            <Text style={styles.exportDescription}>
              Export passwords as a readable PDF document
            </Text>
            <View style={styles.exportButton}>
              {exporting && exportType === 'pdf' ? (
                <Text style={styles.exportButtonText}>Exporting...</Text>
              ) : (
                <>
                  <Download size={16} color="#1E40AF" />
                  <Text style={styles.exportButtonText}>Export as PDF</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => handleExport('excel')}
            disabled={exporting}
          >
            <View style={[styles.iconContainer, styles.excelIconContainer]}>
              <FileSpreadsheet size={24} color="#107C41" />
            </View>
            <Text style={styles.exportTitle}>Excel Format</Text>
            <Text style={styles.exportDescription}>
              Export passwords as an Excel spreadsheet (.xlsx)
            </Text>
            <View style={styles.exportButton}>
              {exporting && exportType === 'excel' ? (
                <Text style={styles.exportButtonText}>Exporting...</Text>
              ) : (
                <>
                  <Download size={16} color="#1E40AF" />
                  <Text style={styles.exportButtonText}>Export as Excel</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportCard}
            onPress={() => handleExport('csv')}
            disabled={exporting}
          >
            <View style={[styles.iconContainer, styles.csvIconContainer]}>
              <Table size={24} color="#3B82F6" />
            </View>
            <Text style={styles.exportTitle}>CSV Format</Text>
            <Text style={styles.exportDescription}>
              Export passwords as a CSV file for easy import
            </Text>
            <View style={styles.exportButton}>
              {exporting && exportType === 'csv' ? (
                <Text style={styles.exportButtonText}>Exporting...</Text>
              ) : (
                <>
                  <Download size={16} color="#1E40AF" />
                  <Text style={styles.exportButtonText}>Export as CSV</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.securityNote}>
        <Text style={styles.securityNoteTitle}>Security Note</Text>
        <Text style={styles.securityNoteText}>
          Exported password files are not encrypted. Make sure to store them in a secure location and delete them after use.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    padding: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 8,
  },
  headerDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  exportOptions: {
    padding: 16,
  },
  exportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pdfIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  excelIconContainer: {
    backgroundColor: '#ECFDF5',
  },
  csvIconContainer: {
    backgroundColor: '#EFF6FF',
  },
  exportTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
  },
  exportDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exportButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
  },
  securityNote: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  securityNoteTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#92400E',
    marginBottom: 8,
  },
  securityNoteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});