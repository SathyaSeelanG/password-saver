# Password Saver

A secure React Native mobile application for storing and managing your passwords locally. Your passwords are encrypted on your device and never sent to any server.

## Features

- **Secure Storage**: All passwords are encrypted on your device
- **PIN Protection**: App access is secured with a PIN code
- **Biometric Authentication**: Optional support for fingerprint/Face ID
- **Search Functionality**: Quickly find saved passwords
- **Export Options**: Export passwords as PDF, Excel, or CSV
- **Modern UI**: Clean and intuitive interface

## Screenshots

(Screenshots to be added)

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or Yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS development: Xcode
- For Android development: Android Studio

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/password-saver.git
   cd password-saver
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or with Yarn:
   ```
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   or with Yarn:
   ```
   yarn dev
   ```

4. Open the app:
   - On iOS simulator: Press `i` in the Expo CLI
   - On Android emulator: Press `a` in the Expo CLI
   - On physical device: Scan the QR code using the Expo Go app

## Building for Production

### For Android

1. Generate an APK/AAB:
   ```
   expo build:android
   ```

2. You'll be prompted to choose between APK and AAB:
   - APK is for direct installations
   - AAB is for Google Play Store submission

### For iOS

1. Generate an IPA:
   ```
   expo build:ios
   ```

2. You'll be prompted to choose between:
   - Building for App Store (to submit to the Apple App Store)
   - Building for Ad Hoc distribution (for testing on registered devices)

### For Web

1. Build for web:
   ```
   npm run build:web
   ```
   or with Yarn:
   ```
   yarn build:web
   ```

2. The output will be available in the `web-build` directory

## Troubleshooting

- **Issues with dependencies**: Try removing the `node_modules` folder and package-lock.json, then run `npm install` again.
- **Expo errors**: Make sure you have the latest version of Expo CLI installed.
- **iOS/Android specific issues**: Check the respective platform documentation or Expo forums.

## Privacy

This application stores all data locally on your device. No data is sent to external servers. Your passwords are encrypted using AES-256 encryption with your PIN as the encryption key.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from [Lucide](https://lucide.dev/)
- Font from [Google Fonts](https://fonts.google.com/specimen/Inter)
- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)