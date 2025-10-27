# Share Target Example App

This is an example Capacitor app that demonstrates the `@capgo/capacitor-share-target` plugin.

## Running the Example

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the web assets:
   ```bash
   npm run build
   ```

3. Sync with native platforms:
   ```bash
   npx cap sync
   ```

4. Run on Android:
   ```bash
   npx cap run android
   ```

5. Run on iOS:
   ```bash
   npx cap run ios
   ```

## Testing Share Functionality

### Android
1. Build and install the app on your device
2. Go to any app that supports sharing (e.g., Chrome, Gallery, Files)
3. Select content to share (text, image, file, etc.)
4. Choose "Share Target Example" from the share sheet
5. The app will open and display the shared content

### iOS
1. Set up a Share Extension target in Xcode (see plugin README)
2. Build and install the app on your device
3. Go to any app that supports sharing
4. Tap the share button and select your app
5. The app will open and display the shared content
