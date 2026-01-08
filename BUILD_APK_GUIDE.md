# How to Build APK for TRAK Mobile App

This guide explains how to build both **Debug** and **Release** APK files for your React Native app.

## 📍 APK Location

After building, your APK files will be located at:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔧 Method 1: Build Debug APK (For Testing)

Debug APKs are signed with a debug keystore and are suitable for testing.

### Using Gradle (Recommended)

**Windows PowerShell:**
```powershell
cd android
.\gradlew.bat assembleDebug
```

**Windows Command Prompt:**
```cmd
cd android
gradlew.bat assembleDebug
```

**macOS/Linux:**
```bash
cd android
./gradlew assembleDebug
```

### Using React Native CLI

```bash
npm run android -- --mode=debug
```

**Result:** APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🚀 Method 2: Build Release APK (For Production)

Release APKs are optimized, minified, and ready for distribution.

### Step 1: Generate a Release Keystore (First Time Only)

If you haven't created a release keystore yet, generate one:

**Windows PowerShell:**
```powershell
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore trak-release-key.keystore -alias trak-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**macOS/Linux:**
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore trak-release-key.keystore -alias trak-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** 
- Remember the password you set - you'll need it for future builds
- Keep the keystore file safe - losing it means you can't update your app on Google Play Store
- Store the keystore password securely

### Step 2: Configure Release Signing

Edit `android/app/build.gradle` and update the `signingConfigs` section:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

And update the `buildTypes` section:

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### Step 3: Create gradle.properties

Create or edit `android/gradle.properties` and add:

```properties
MYAPP_RELEASE_STORE_FILE=trak-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=trak-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

**⚠️ Security Note:** Add `android/gradle.properties` to `.gitignore` to avoid committing passwords!

### Step 4: Build Release APK

**Windows PowerShell:**
```powershell
cd android
.\gradlew.bat assembleRelease
```

**Windows Command Prompt:**
```cmd
cd android
gradlew.bat assembleRelease
```

**macOS/Linux:**
```bash
cd android
./gradlew assembleRelease
```

**Result:** APK will be at `android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 Method 3: Build AAB (Android App Bundle) for Google Play Store

AAB (Android App Bundle) is the preferred format for Google Play Store distribution as it allows Google to optimize APKs for different device configurations.

**Windows PowerShell:**
```powershell
cd android
.\gradlew.bat bundleRelease
```

**macOS/Linux:**
```bash
cd android
./gradlew bundleRelease
```

**Result:** AAB will be at `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🧹 Clean Build (If You Encounter Issues)

If you encounter build issues, try cleaning first:

**Windows PowerShell:**
```powershell
cd android
.\gradlew.bat clean
.\gradlew.bat assembleDebug  # or assembleRelease
```

**macOS/Linux:**
```bash
cd android
./gradlew clean
./gradlew assembleDebug  # or assembleRelease
```

---

## ✅ Quick Reference

| Build Type | Command | Output Location |
|------------|---------|----------------|
| Debug APK | `gradlew assembleDebug` | `app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `gradlew assembleRelease` | `app/build/outputs/apk/release/app-release.apk` |
| Release AAB | `gradlew bundleRelease` | `app/build/outputs/bundle/release/app-release.aab` |

---

## 📱 Installing the APK

### On Android Device:

1. **Enable Developer Options:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging

3. **Transfer APK to Device:**
   - Connect via USB, or
   - Transfer via email/cloud storage

4. **Install:**
   - Open the APK file on your device
   - Allow installation from unknown sources if prompted
   - Tap Install

### Using ADB (Android Debug Bridge):

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔍 Troubleshooting

### Issue: "Execution failed for task ':app:mergeDebugResources'"
**Solution:** Clean the build: `gradlew clean` then rebuild

### Issue: "SDK location not found"
**Solution:** Set `ANDROID_HOME` environment variable or create `local.properties` in `android/` folder:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Issue: "Gradle build failed"
**Solution:** 
- Check internet connection (Gradle downloads dependencies)
- Ensure Java JDK is installed (version 17+ recommended)
- Try: `gradlew clean` then rebuild

---

## 📝 Notes

- **Debug APK**: Larger file size, includes debug symbols, not optimized
- **Release APK**: Smaller file size, optimized, minified, ready for production
- **Keystore**: Keep your release keystore safe! You'll need it for all future updates
- **Version Code**: Increment `versionCode` in `android/app/build.gradle` for each release
- **Version Name**: Update `versionName` in `android/app/build.gradle` for each release

---

## 🎯 Current Build Status

✅ **Debug APK**: Successfully built at `android/app/build/outputs/apk/debug/app-debug.apk`

⚠️ **Release APK**: Requires keystore configuration (see Step 1-3 above)

