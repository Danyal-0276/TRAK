#!/bin/bash

# iOS Release Build Script for TRAK
# This script builds and exports a release IPA file
# Usage: ./build-release.sh [app-store|ad-hoc|enterprise|development]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCHEME="TRAK"
WORKSPACE="TRAK.xcworkspace"
ARCHIVE_PATH="build/TRAK.xcarchive"
EXPORT_PATH="build"
EXPORT_METHOD="${1:-app-store}"  # Default to app-store if not specified

echo -e "${GREEN}🚀 Starting iOS Release Build for TRAK${NC}"
echo ""

# Validate export method
if [[ ! "$EXPORT_METHOD" =~ ^(app-store|ad-hoc|enterprise|development)$ ]]; then
    echo -e "${RED}❌ Invalid export method: $EXPORT_METHOD${NC}"
    echo "Valid options: app-store, ad-hoc, enterprise, development"
    exit 1
fi

echo -e "${YELLOW}📦 Export Method: $EXPORT_METHOD${NC}"
echo ""

# Check if we're in the ios directory
if [ ! -f "$WORKSPACE" ]; then
    echo -e "${RED}❌ Error: $WORKSPACE not found${NC}"
    echo "Please run this script from the ios directory"
    exit 1
fi

# Step 1: Install/Update Pods
echo -e "${YELLOW}📦 Step 1: Installing CocoaPods dependencies...${NC}"
if ! command -v pod &> /dev/null; then
    echo -e "${RED}❌ CocoaPods not found. Please install: sudo gem install cocoapods${NC}"
    exit 1
fi
pod install
echo -e "${GREEN}✅ Pods installed${NC}"
echo ""

# Step 2: Clean build folder
echo -e "${YELLOW}🧹 Step 2: Cleaning build folder...${NC}"
rm -rf build
mkdir -p build
echo -e "${GREEN}✅ Build folder cleaned${NC}"
echo ""

# Step 3: Create ExportOptions.plist if it doesn't exist
EXPORT_OPTIONS_FILE="ExportOptions.plist"
if [ ! -f "$EXPORT_OPTIONS_FILE" ]; then
    echo -e "${YELLOW}📝 Step 3: Creating ExportOptions.plist...${NC}"
    cat > "$EXPORT_OPTIONS_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>$EXPORT_METHOD</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
EOF
    echo -e "${GREEN}✅ ExportOptions.plist created${NC}"
    echo -e "${YELLOW}⚠️  Please edit ExportOptions.plist and add your Team ID if needed${NC}"
else
    echo -e "${GREEN}✅ ExportOptions.plist already exists${NC}"
fi
echo ""

# Step 4: Build Archive
echo -e "${YELLOW}🏗️  Step 4: Building archive...${NC}"
echo "This may take several minutes..."
xcodebuild clean archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination 'generic/platform=iOS' \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Archive build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archive created successfully${NC}"
echo ""

# Step 5: Export IPA
echo -e "${YELLOW}📤 Step 5: Exporting IPA...${NC}"
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "$EXPORT_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ IPA export failed${NC}"
    echo -e "${YELLOW}💡 Tip: Make sure you have:${NC}"
    echo "   - Valid Apple Developer account"
    echo "   - Proper code signing configured in Xcode"
    echo "   - Correct Team ID in ExportOptions.plist"
    exit 1
fi

echo ""
echo -e "${GREEN}✅✅✅ Build Successful! ✅✅✅${NC}"
echo ""
echo -e "${GREEN}📱 IPA Location: $EXPORT_PATH/TRAK.ipa${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
if [ "$EXPORT_METHOD" == "app-store" ]; then
    echo "1. Upload to App Store Connect using Transporter or Xcode"
    echo "2. Or use: xcrun altool --upload-app --file $EXPORT_PATH/TRAK.ipa --type ios --apiKey YOUR_API_KEY --apiIssuer YOUR_ISSUER_ID"
elif [ "$EXPORT_METHOD" == "ad-hoc" ]; then
    echo "1. Distribute the IPA to registered devices"
    echo "2. Install via TestFlight or direct distribution"
fi
echo ""



