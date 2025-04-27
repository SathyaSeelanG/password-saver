export const generatePassword = (length: number = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let password = '';
  
  // Ensure at least one character from each category
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+';
  
  password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
  password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest of the password randomly
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export const checkPasswordStrength = (password: string) => {
  let score = 0;
  
  // Length check
  if (password.length >= 12) {
    score += 1;
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 0.5;
  if (/[A-Z]/.test(password)) score += 0.5;
  if (/[0-9]/.test(password)) score += 0.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
  
  // Penalize for common patterns
  if (/123/.test(password) || /abc/.test(password)) score -= 0.5;
  if (/password/i.test(password) || /qwerty/i.test(password)) score -= 1;
  
  // Ensure score is between 1 and 4
  score = Math.max(1, Math.min(4, Math.round(score)));
  
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  
  return { score, label: labels[score - 1] };
};