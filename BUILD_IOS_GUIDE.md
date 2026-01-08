# How to Build iOS App for TRAK Mobile App

This guide explains how to build iOS apps (IPA files) for your React Native app.

## ⚠️ Important Requirements

**iOS builds require:**
- **macOS** (macOS 12.0 or later)
- **Xcode** (latest version recommended, minimum Xcode 14.0)
- **Apple Developer Account** (for App Store distribution or TestFlight)
- **CocoaPods** (for managing iOS dependencies)

**Note:** You cannot build iOS apps on Windows or Linux. You need access to a Mac.

---

## 📋 Prerequisites Setup

### 1. Install Xcode

1. Open the **App Store** on your Mac
2. Search for "Xcode"
3. Click **Get** or **Install**
4. Wait for installation to complete (this may take a while)

### 2. Install Xcode Command Line Tools

```bash
xcode-select --install
```

### 3. Install CocoaPods

```bash
sudo gem install cocoapods
```

Verify installation:
```bash
pod --version
```

### 4. Install iOS Dependencies

Navigate to your project's iOS directory and install pods:

```bash
cd ios
pod install
cd ..
```

**Note:** Run `pod install` whenever you:
- Add new React Native dependencies
- Update React Native version
- Modify native iOS code

---

## 🔧 Method 1: Build for Simulator (Development/Testing)

### Using React Native CLI

```bash
npm run ios
```

This will:
- Start Metro bundler
- Build the app
- Launch iOS Simulator
- Install and run the app

### Using Xcode

1. Open `ios/TRAK.xcworkspace` (NOT `.xcodeproj`) in Xcode
2. Select a simulator from the device dropdown (top bar)
3. Click the **Play** button (▶️) or press `Cmd + R`
4. Wait for the build to complete

---

## 🚀 Method 2: Build for Physical Device (Development)

### Step 1: Configure Signing in Xcode

1. Open `ios/TRAK.xcworkspace` in Xcode
2. Select the **TRAK** project in the left sidebar
3. Select the **TRAK** target
4. Go to **Signing & Capabilities** tab
5. Check **"Automatically manage signing"**
6. Select your **Team** (your Apple Developer account)
7. Xcode will automatically create a provisioning profile

### Step 2: Connect Your iPhone/iPad

1. Connect your iOS device via USB
2. Unlock your device
3. Trust the computer if prompted

### Step 3: Build and Run

1. In Xcode, select your physical device from the device dropdown
2. Click the **Play** button (▶️) or press `Cmd + R`
3. On your device, go to **Settings → General → VPN & Device Management**
4. Trust the developer certificate
5. The app will launch on your device

---

## 📦 Method 3: Build Release IPA (For Distribution)

### Option A: Using Xcode (Recommended)

#### Step 1: Configure Release Build Settings

1. Open `ios/TRAK.xcworkspace` in Xcode
2. Select the **TRAK** project
3. Select the **TRAK** target
4. Go to **Signing & Capabilities**
5. Select your **Team** and ensure signing is configured
6. Go to **Build Settings** tab
7. Search for "Code Signing Identity"
8. Set **Release** configuration to use your distribution certificate

#### Step 2: Archive the App

1. In Xcode, select **Product → Scheme → TRAK**
2. Select **Any iOS Device** from the device dropdown (not a simulator)
3. Go to **Product → Archive**
4. Wait for the archive to complete (this may take several minutes)
5. The **Organizer** window will open automatically

#### Step 3: Export IPA

1. In the Organizer, select your archive
2. Click **Distribute App**
3. Choose distribution method:
   - **App Store Connect** - For App Store submission
   - **Ad Hoc** - For testing on specific devices
   - **Enterprise** - For enterprise distribution
   - **Development** - For development builds
4. Follow the wizard to export the IPA file

**Result:** IPA file will be saved to your chosen location

---

### Option B: Using Command Line (xcodebuild)

#### Step 1: Create Archive

```bash
cd ios
xcodebuild clean archive \
  -workspace TRAK.xcworkspace \
  -scheme TRAK \
  -configuration Release \
  -archivePath build/TRAK.xcarchive \
  -destination 'generic/platform=iOS'
```

#### Step 2: Export IPA

```bash
xcodebuild -exportArchive \
  -archivePath build/TRAK.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

**Note:** You need to create an `ExportOptions.plist` file with export settings. See example below.

---

## 📝 ExportOptions.plist Example

Create `ios/ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string> <!-- or "ad-hoc", "enterprise", "development" -->
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
```

**Method options:**
- `app-store` - For App Store submission
- `ad-hoc` - For testing on registered devices
- `enterprise` - For enterprise distribution
- `development` - For development builds

---

## 🔄 Method 4: Build Using React Native CLI (Development)

### For Simulator

```bash
npm run ios
```

### For Physical Device

```bash
npm run ios -- --device
```

### Specify Device

```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

---

## 🏗️ Method 5: Build Scripts (Automation)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "ios": "react-native run-ios",
    "ios:device": "react-native run-ios --device",
    "ios:release": "cd ios && xcodebuild -workspace TRAK.xcworkspace -scheme TRAK -configuration Release -archivePath build/TRAK.xcarchive archive",
    "pod:install": "cd ios && pod install",
    "pod:update": "cd ios && pod update"
  }
}
```

---

## ☁️ Alternative: Cloud Build Services (If No Mac Access)

If you don't have access to a Mac, consider these cloud build services:

### 1. **Expo Application Services (EAS Build)**
- Free tier available
- Builds iOS apps in the cloud
- Requires Expo setup

### 2. **Codemagic**
- Free tier: 500 build minutes/month
- CI/CD for React Native
- Supports iOS and Android

### 3. **Bitrise**
- Free tier available
- CI/CD platform
- Good for React Native projects

### 4. **GitHub Actions (with macOS Runner)**
- Free for public repos
- Requires macOS runner (paid for private repos)
- Can automate iOS builds

### 5. **AppCircle**
- Free tier available
- Mobile CI/CD platform
- Supports React Native

---

## 🔐 Apple Developer Account Setup

### For App Store Distribution:

1. **Enroll in Apple Developer Program**
   - Visit: https://developer.apple.com/programs/
   - Cost: $99/year
   - Required for App Store submission

2. **Create App ID**
   - Go to https://developer.apple.com/account
   - Certificates, Identifiers & Profiles
   - Create a new App ID (e.g., `com.trak`)

3. **Create Certificates**
   - Development Certificate (for testing)
   - Distribution Certificate (for App Store)

4. **Create Provisioning Profiles**
   - Development Profile
   - App Store Distribution Profile

**Note:** Xcode can automatically manage these if you enable "Automatically manage signing"

---

## 📱 Testing on Physical Device

### Without Apple Developer Account (Free):

1. Connect your iPhone/iPad
2. In Xcode, select your device
3. Xcode will create a free development certificate
4. Build and run (app expires after 7 days)

### With Apple Developer Account:

1. Register device UDID in Apple Developer Portal
2. Create Ad Hoc provisioning profile
3. Build and distribute to registered devices

---

## 🐛 Troubleshooting

### Issue: "No such module 'React'"

**Solution:**
```bash
cd ios
pod install
cd ..
```

### Issue: "Code signing error"

**Solution:**
- Check your Apple Developer account
- Ensure certificates are valid
- Verify provisioning profiles match your bundle ID

### Issue: "Build failed: Pods not found"

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Issue: "Xcode version mismatch"

**Solution:**
- Update Xcode to latest version
- Update CocoaPods: `sudo gem install cocoapods`

### Issue: "Metro bundler not starting"

**Solution:**
```bash
npm start -- --reset-cache
```

### Issue: "Archive button is disabled"

**Solution:**
- Select "Any iOS Device" (not a simulator)
- Ensure you're using `.xcworkspace`, not `.xcodeproj`

---

## 📍 Build Output Locations

- **Simulator Build**: `ios/build/Build/Products/Debug-iphonesimulator/TRAK.app`
- **Device Build**: `ios/build/Build/Products/Debug-iphoneos/TRAK.app`
- **Archive**: `~/Library/Developer/Xcode/Archives/`
- **IPA**: Location specified during export

---

## ✅ Quick Reference

| Build Type | Command | Output |
|------------|---------|--------|
| Simulator | `npm run ios` | Runs in simulator |
| Device (Dev) | `npm run ios -- --device` | Installs on device |
| Archive | Xcode → Product → Archive | `.xcarchive` |
| Export IPA | Xcode Organizer → Distribute | `.ipa` file |

---

## 🎯 Current Project Status

✅ **iOS Project**: Configured and ready
✅ **Podfile**: Set up correctly
✅ **Xcode Project**: `TRAK.xcworkspace` available

⚠️ **Next Steps**:
1. Access a Mac with Xcode installed
2. Run `cd ios && pod install`
3. Open `TRAK.xcworkspace` in Xcode
4. Configure signing and build

---

## 📚 Additional Resources

- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [CocoaPods Guide](https://guides.cocoapods.org/)
- [Xcode Archive Guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)

---

## 💡 Tips

1. **Always use `.xcworkspace`**, not `.xcodeproj` when CocoaPods is involved
2. **Run `pod install`** after every `npm install` that adds native dependencies
3. **Keep Xcode updated** to avoid compatibility issues
4. **Use TestFlight** for beta testing before App Store submission
5. **Archive regularly** to keep backups of working builds

