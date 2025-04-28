import { Platform } from 'react-native';
import { Password } from '@/types';
import * as XLSX from 'xlsx';

export const exportPdf = async (passwords: Password[]): Promise<Blob> => {
  // For web, create an HTML document that we'll convert to PDF-like format
  if (Platform.OS === 'web') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Passwords Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          h1 { color: #6366F1; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #EEF2FF; color: #4B5563; font-weight: bold; }
          .header { margin-bottom: 30px; }
          .date { color: #6B7280; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Saver - Exported Passwords</h1>
          <p class="date">Exported on ${new Date().toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>App/Website</th>
              <th>Username</th>
              <th>Email/Phone</th>
              <th>Password</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${passwords.map(p => `
              <tr>
                <td>${p.appName}</td>
                <td>${p.username}</td>
                <td>${p.emailOrPhone}</td>
                <td>${p.password}</td>
                <td>${new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Create a Blob with HTML content
    const htmlBlob = new Blob([html], { type: 'text/html' });
    
    // Due to browser limitations, we can't convert directly to PDF in the browser
    // Instead, we'll let the browser handle the HTML display and printing
    return htmlBlob;
  }
  
  // For native platforms, we'd need a proper PDF generation library
  // This is a placeholder that returns a text blob
  const text = `Password Export - ${new Date().toLocaleString()}\n\n`;
  const textContent = passwords.map(p => 
    `App/Website: ${p.appName}\nUsername: ${p.username}\nEmail/Phone: ${p.emailOrPhone}\nPassword: ${p.password}\nCreated: ${new Date(p.createdAt).toLocaleString()}\n\n`
  ).join('');
  
  return new Blob([text + textContent], { type: 'text/plain' });
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