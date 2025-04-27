import { Platform } from 'react-native';
import { Password } from '@/types';
import * as XLSX from 'xlsx';

export const exportPdf = async (passwords: Password[]): Promise<Blob> => {
  // Note: In a real app, you'd use a proper PDF library
  // For web, this is a placeholder implementation using HTML
  if (Platform.OS === 'web') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Passwords Export</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Password Export</h1>
        <p>Exported on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>App/Website</th>
              <th>Username</th>
              <th>Email/Phone</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            ${passwords.map(p => `
              <tr>
                <td>${p.appName}</td>
                <td>${p.username}</td>
                <td>${p.emailOrPhone}</td>
                <td>${p.password}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    return new Blob([html], { type: 'application/pdf' });
  }
  
  // For native platforms, we'd need a proper PDF generation library
  // This is a placeholder that returns a text blob
  const text = passwords.map(p => 
    `${p.appName}, ${p.username}, ${p.emailOrPhone}, ${p.password}`
  ).join('\n');
  
  return new Blob([text], { type: 'application/pdf' });
};

export const exportExcel = async (passwords: Password[]): Promise<Blob> => {
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(
    passwords.map(p => ({
      'App/Website': p.appName,
      'Username': p.username,
      'Email/Phone': p.emailOrPhone,
      'Password': p.password,
      'Created': new Date(p.createdAt).toLocaleString(),
    }))
  );
  
  // Set column widths
  const wscols = [
    { wch: 20 }, // App/Website
    { wch: 20 }, // Username
    { wch: 25 }, // Email/Phone
    { wch: 25 }, // Password
    { wch: 20 }, // Created
  ];
  ws['!cols'] = wscols;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Passwords');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const exportCsv = async (passwords: Password[]): Promise<string> => {
  // Create CSV header
  let csv = 'App/Website,Username,Email/Phone,Password,Created\n';
  
  // Add each password entry
  passwords.forEach(p => {
    // Escape any commas in fields
    const appName = p.appName.includes(',') ? `"${p.appName}"` : p.appName;
    const username = p.username.includes(',') ? `"${p.username}"` : p.username;
    const emailOrPhone = p.emailOrPhone.includes(',') ? `"${p.emailOrPhone}"` : p.emailOrPhone;
    const password = p.password.includes(',') ? `"${p.password}"` : p.password;
    const created = new Date(p.createdAt).toLocaleString();
    
    csv += `${appName},${username},${emailOrPhone},${password},${created}\n`;
  });
  
  return csv;
};