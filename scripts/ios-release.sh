#!/bin/zsh
# Builds the App Store version and uploads it to App Store Connect.
# Usage: npm run testflight   (or scripts/ios-release.sh [TEAM_ID], default team 77H93N462G)
# Needs: Xcode signed in to the Apple ID of the paid team (an iPhone is registered to the team since 8 Nov 2026).
set -e -o pipefail
TEAM="${1:-77H93N462G}"
ROOT="${0:A:h:h}"; OUT="$ROOT/release/ios"; mkdir -p "$OUT"
cd "$ROOT"; npm run build >/dev/null; npx cap sync ios >/dev/null
cat > "$OUT/export.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$TEAM</string>
  <key>signingStyle</key><string>automatic</string>
  <key>uploadSymbols</key><true/>
</dict></plist>
PL
cd ios/App
# every upload needs a new build number: use the date and time
BUILD=$(date +%Y%m%d%H%M)
xcodebuild -project App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' \
  -archivePath "$OUT/UnderTheSkin.xcarchive" DEVELOPMENT_TEAM="$TEAM" CURRENT_PROJECT_VERSION="$BUILD" \
  -allowProvisioningUpdates archive | tail -3
xcodebuild -exportArchive -archivePath "$OUT/UnderTheSkin.xcarchive" -exportOptionsPlist "$OUT/export.plist" \
  -exportPath "$OUT/export" -allowProvisioningUpdates | tail -5
echo "Uploaded build $BUILD. It appears in App Store Connect → TestFlight in about 10–30 minutes."
