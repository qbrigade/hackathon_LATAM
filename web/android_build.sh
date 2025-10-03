#!/bin/bash

_notes="
keytool -genkeypair -v \
  -keystore debug-key.jks \
  -alias debug \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

pass: peruanista

Build icon: npm run tauri icon /tmp/icon_peruanista.png
"

key_name=debug-key.jks

export NDK_HOME="/opt/Android/Sdk/ndk/27.2.12479018/"
export ANDROID_HOME="/opt/Android/Sdk/"

# https://v2.tauri.app/reference/cli/#android-build
npm run tauri android build --apk

OUTPUT_APK=./src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk
OUTPUT_AAB=./src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab

zipalign=$ANDROID_HOME/build-tools/35.0.0/zipalign
apksigner=$ANDROID_HOME/build-tools/35.0.0/apksigner
# jarsigner is part of JDK, not Android SDK
jarsigner=jarsigner

rm -f app-aligned.apk app-signed.apk app-signed.aab

# Sign APK
$zipalign -v -p 4 $OUTPUT_APK app-aligned.apk

$apksigner sign \
  --ks $key_name \
  --ks-key-alias debug \
  --ks-pass pass:peruanista \
  --out app-signed.apk \
  app-aligned.apk

# Sign AAB
$jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore $key_name \
  -storepass peruanista \
  -keypass peruanista \
  $OUTPUT_AAB \
  debug

mv $OUTPUT_AAB app-signed.aab
