# 📱 Implementation Plan: Android APK Build & Device Deployment

Build a real Android APK for ChronoFocus / ChronoCluck, install it, and run it on an Android virtual device (emulator) or connected Android hardware.

## User Review Required

> [!IMPORTANT]
> - Installing the `android` CLI tool requires running a Darwin ARM64 installation script (`curl -fsSL https://dl.google.com/android/cli/latest/darwin_arm64/install.sh | bash`).
> - Setting up the Android SDK and Virtual Device will download necessary system images and tools.

## Proposed Changes

---

### [Component: Environment & Android CLI Setup]

#### [NEW] [android-cli](file:///Users/elywolf/.android/bin/android)
- Download and install the `android` CLI tool using the official installer script for Mac ARM64 (`curl -fsSL https://dl.google.com/android/cli/latest/darwin_arm64/install.sh | bash`).
- Verify installation using `android info` and add binary to system execution path.

---

### [Component: Android SDK & Emulator Setup]

- Install required Android SDK platforms and build-tools via `android sdk install`.
- Create a virtual device (emulator) using `android emulator create` and launch it with `android emulator start`.

---

### [Component: Android App Project Creation & Build]

#### [NEW] [android-chronofocus](file:///Users/elywolf/antigravity_workspace/gemini-internship/android-chronofocus)
- Initialize a new Android app project using `android create empty-activity --name="ChronoFocus" --output=./android-chronofocus`.
- Configure app activity layout, branding, and assets (ChronoCluck mascot UI & Webview focus timer integration).
- Build the debug APK (`.apk` file artifact).

---

### [Component: Deployment & Execution Verification]

- Deploy and run the built APK on the active emulator/device using `android run --apks=...`.
- Capture screenshot and verify layout using `android screen capture` and `android layout`.

---

## Verification Plan

### Automated Tests
- Run `android info` to confirm SDK and toolchain setup.
- Run `android describe` on the project directory to verify APK generation.
- Execute `android run` and verify clean installation exit code.

### Manual Verification
- Take a screenshot of the running Android device screen using `android screen capture` to visually confirm ChronoFocus runs on the Android OS interface.
