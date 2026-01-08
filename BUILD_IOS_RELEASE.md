# Building iOS Release Build for TRAK

This guide provides step-by-step instructions for building a release IPA file for your TRAK iOS app.

## ⚠️ Prerequisites

**You MUST have:**
- **macOS** (macOS 12.0 or later)
- **Xcode** (latest version recommended)
- **Apple Developer Account** (for App Store or Ad Hoc distribution)
- **CocoaPods** installed (`sudo gem install cocoapods`)

**Note:** iOS builds cannot be done on Windows. You need access to a Mac.

---

## 🚀 Quick Start: Automated Build Script

### Step 1: Navigate to iOS Directory

```bash
cd ios
```

### Step 2: Make Script Executable

```bash
chmod +x build-release.sh
```

### Step 3: Run Build Script

**For App Store distribution:**
```bash
./build-release.sh app-store
```

**For Ad Hoc testing:**
```bash
./build-release.sh ad-hoc
```

**For Enterprise distribution:**
```bash
./build-release.sh enterprise
```

**For Development:**
```bash
./build-release.sh development
```

The script will:
1. Install CocoaPods dependencies
2. Clean build folder
3. Create archive
4. Export IPA file

**Output:** `ios/build/TRAK.ipa`

---

## 📱 Method 1: Using Xcode (Recommended for First Time)

### Step 1: Open Project in Xcode

```bash
cd ios
open TRAK.xcworkspace
```

**Important:** Always open `.xcworkspace`, NOT `.xcodeproj` when using CocoaPods!

### Step 2: Configure Signing & Capabilities

1. In Xcode, select the **TRAK** project in the left sidebar
2. Select the **TRAK** target
3. Go to **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (your Apple Developer account)
6. Xcode will automatically configure signing

**Bundle Identifier:** Should be `com.trak` (update if needed)

### Step 3: Update Bundle Identifier (If Needed)

If your bundle ID is still the default:
1. In **Signing & Capabilities**, click on the Bundle Identifier
2. Change from `org.reactjs.native.example.TRAK` to `com.trak`
3. Ensure it matches your App ID in Apple Developer Portal

### Step 4: Select Build Configuration

1. In the top toolbar, click on the scheme selector
2. Select **TRAK** scheme
3. Select **Any iOS Device** (not a simulator)

### Step 5: Create Archive

1. Go to **Product → Archive**
2. Wait for the archive to complete (5-15 minutes)
3. The **Organizer** window will open automatically

### Step 6: Export IPA

1. In the Organizer, select your archive
2. Click **Distribute App**
3. Choose distribution method:
   - **App Store Connect** - For App Store submission
   - **Ad Hoc** - For testing on specific devices
   - **Enterprise** - For enterprise distribution
   - **Development** - For development builds
4. Follow the wizard:
   - Select your distribution certificate
   - Choose provisioning profile (if manual signing)
   - Review options
   - Click **Export**
5. Choose save location

**Result:** IPA file will be saved to your chosen location

---

## 🔧 Method 2: Using Command Line (xcodebuild)

### Step 1: Install Dependencies

```bash
cd ios
pod install
```

### Step 2: Clean Build

```bash
rm -rf build
mkdir -p build
```

### Step 3: Create Archive

```bash
xcodebuild clean archive \
  -workspace TRAK.xcworkspace \
  -scheme TRAK \
  -configuration Release \
  -archivePath build/TRAK.xcarchive \
  -destination 'generic/platform=iOS' \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO
```

**Note:** The `CODE_SIGN_IDENTITY=""` flags are for building without immediate signing. You'll sign during export.

### Step 4: Export IPA

```bash
xcodebuild -exportArchive \
  -archivePath build/TRAK.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

**Note:** Make sure `ExportOptions.plist` exists in the `ios` directory. See template below.

---

## 📝 ExportOptions.plist Configuration

The `ExportOptions.plist` file controls how the IPA is exported. A template is provided in `ios/ExportOptions.plist`.

### For App Store Distribution:

```xml
<key>method</key>
<string>app-store</string>
```

### For Ad Hoc Distribution:

```xml
<key>method</key>
<string>ad-hoc</string>
```

### For Enterprise Distribution:

```xml
<key>method</key>
<string>enterprise</string>
```

### Manual Signing (if needed):

If you need to specify a Team ID or provisioning profile:

```xml
<key>teamID</key>
<string>YOUR_TEAM_ID</string>

<key>provisioningProfiles</key>
<dict>
    <key>com.trak</key>
    <string>Your Provisioning Profile Name</string>
</dict>
```

---

## 🔐 Apple Developer Account Setup

### 1. Enroll in Apple Developer Program

- Visit: https://developer.apple.com/programs/
- Cost: $99/year
- Required for App Store distribution

### 2. Create App ID

1. Go to https://developer.apple.com/account
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+**
4. Select **App IDs** → **Continue**
5. Select **App**
6. Enter:
   - **Description:** TRAK
   - **Bundle ID:** `com.trak` (or your preferred ID)
7. Click **Continue** → **Register**

### 3. Configure Signing in Xcode

Xcode can automatically manage certificates and provisioning profiles:
1. Open project in Xcode
2. Go to **Signing & Capabilities**
3. Enable **"Automatically manage signing"**
4. Select your Team
5. Xcode will create certificates and profiles automatically

---

## 📤 Uploading to App Store Connect

### Option 1: Using Transporter App

1. Download **Transporter** from Mac App Store
2. Open Transporter
3. Drag and drop your `.ipa` file
4. Click **Deliver**
5. Wait for upload to complete

### Option 2: Using Xcode Organizer

1. In Xcode, go to **Window → Organizer**
2. Select your archive
3. Click **Distribute App**
4. Select **App Store Connect**
5. Follow the wizard to upload

### Option 3: Using Command Line (xcrun altool)

```bash
xcrun altool --upload-app \
  --file build/TRAK.ipa \
  --type ios \
  --apiKey YOUR_API_KEY \
  --apiIssuer YOUR_ISSUER_ID
```

---

## 🧪 Testing with Ad Hoc Distribution

### Step 1: Register Device UDIDs

1. Go to Apple Developer Portal
2. Navigate to **Devices**
3. Add device UDIDs (you can find UDID in iTunes or Xcode)

### Step 2: Create Ad Hoc Provisioning Profile

1. Go to **Profiles** → **+**
2. Select **Ad Hoc**
3. Select your App ID
4. Select certificates
5. Select registered devices
6. Download profile

### Step 3: Build Ad Hoc IPA

```bash
./build-release.sh ad-hoc
```

### Step 4: Distribute

- Upload to TestFlight (recommended)
- Or distribute IPA directly to registered devices
- Install via iTunes or Apple Configurator

---

## 🐛 Troubleshooting

### Issue: "No signing certificate found"

**Solution:**
1. Open Xcode → Preferences → Accounts
2. Add your Apple ID
3. Download certificates
4. Configure signing in project settings

### Issue: "Provisioning profile doesn't match"

**Solution:**
1. Check Bundle Identifier matches App ID
2. Regenerate provisioning profile
3. Or use automatic signing in Xcode

### Issue: "Archive button is disabled"

**Solution:**
- Select **"Any iOS Device"** (not a simulator)
- Ensure you're using `.xcworkspace`, not `.xcodeproj`

### Issue: "Pod install fails"

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Issue: "Build fails with code signing error"

**Solution:**
1. Check Apple Developer account is active
2. Verify certificates are valid
3. Ensure Bundle ID matches App ID
4. Try cleaning: `xcodebuild clean`

### Issue: "Export fails"

**Solution:**
- Check `ExportOptions.plist` is correct
- Verify Team ID is correct
- Ensure you have proper distribution certificate
- Check provisioning profile matches export method

---

## 📍 Build Output Locations

- **Archive:** `~/Library/Developer/Xcode/Archives/` or `ios/build/TRAK.xcarchive`
- **IPA:** `ios/build/TRAK.ipa` (when using script)
- **Xcode Archive:** `~/Library/Developer/Xcode/Archives/YYYY-MM-DD/TRAK.xcarchive`

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Install Pods | `cd ios && pod install` |
| Build Archive (Script) | `./build-release.sh app-store` |
| Build Archive (CLI) | `xcodebuild archive -workspace TRAK.xcworkspace -scheme TRAK` |
| Export IPA | `xcodebuild -exportArchive -archivePath build/TRAK.xcarchive -exportPath build -exportOptionsPlist ExportOptions.plist` |
| Open in Xcode | `open ios/TRAK.xcworkspace` |

---

## 🎯 Build Checklist

Before building release:

- [ ] Updated version number in Xcode (Marketing Version)
- [ ] Updated build number (Current Project Version)
- [ ] Bundle Identifier configured (`com.trak`)
- [ ] Signing & Capabilities configured in Xcode
- [ ] Apple Developer account active
- [ ] CocoaPods dependencies installed (`pod install`)
- [ ] Tested on device/simulator
- [ ] ExportOptions.plist configured
- [ ] App icons and assets ready

---

## 📚 Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Xcode Archive Guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)

---

## 💡 Tips

1. **Always use `.xcworkspace`** when CocoaPods is involved
2. **Test on device** before creating release build
3. **Increment build number** for each release
4. **Use TestFlight** for beta testing
5. **Keep archives** for future reference
6. **Automate with CI/CD** (GitHub Actions, Codemagic, etc.) for regular releases

---

## 🚨 Important Notes

- **Windows users:** You cannot build iOS apps on Windows. You need macOS access.
- **Cloud builds:** Consider Codemagic, Bitrise, or GitHub Actions with macOS runners
- **Keystore security:** Keep your Apple Developer credentials secure
- **App Store review:** Allow 24-48 hours for App Store review process

