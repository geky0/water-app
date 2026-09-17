# 💧 HydroDark — Sleek Water Tracker & Hydration Reminder

A high-performance, dark-aesthetic water tracker engineered with an OLED pitch-black background, crimson/neon-red accents, smart local push notifications, and customizable intake goals.

---

## ✨ Features

- **Sleek OLED Black & Crimson Aesthetic**: High-contrast, minimalist UI styled in pitch black (`#070709`) and glowing crimson red (`#FF1E44`).
- **Hydration Progress Ring**: Vector radial gauge showcasing real-time progress toward your target.
- **Smart Drink Reminders**: Local interval notifications (30m, 1h, 1.5h, 2h, etc.) to keep you hydrated.
- **Quick Logging**: 1-tap logging for cups (+200ml), glasses (+350ml), bottles (+500ml), flasks (+750ml), and custom milliliter inputs.
- **History & Daily Logs**: Track intake timestamps throughout the day with one-tap removal.
- **Persistent Storage**: Retains logs, daily streaks, goals, and notification preferences via local storage.
- **Automated iOS `.ipa` Build**: Pre-configured GitHub Actions workflow to build and export an installable `.ipa` binary.

---

## 🚀 Running Locally (Live Preview)

Run the development server:

```bash
npx expo start
```

1. Install the **Expo Go** app on your iPhone.
2. Scan the terminal QR code using your iPhone camera.
3. The HydroDark app will launch immediately on your device with hot reloading.

---

## 📱 How to Get Your `.ipa` File

### Option 1: Automated GitHub Actions (Recommended)
This repository includes a CI workflow at `.github/workflows/build-ios.yml`:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: HydroDark water tracker app"
   git push -u origin master
   ```
2. Navigate to your repository on GitHub:
   `https://github.com/geky0/water-app/actions`
3. The **"Build iOS IPA"** workflow will trigger automatically on macOS runners.
4. Once completed, download the **`HydroDark-iOS-IPA`** artifact containing `HydroDark.ipa` directly from the Actions run page!
5. Install the `.ipa` onto your iOS device using **AltStore**, **Sideloadly**, or **TrollStore**.

---

### Option 2: Expo EAS Build Cloud
You can also generate an installable iOS build using Expo's official build service:

```bash
# Log into your Expo account
npx eas login

# Run the iOS build
npx eas build -p ios --profile preview
```

---

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 57
- **Language**: TypeScript
- **Styling & Icons**: `lucide-react-native`, `react-native-svg`
- **Notifications**: `expo-notifications`
- **Haptics**: `expo-haptics`
- **Storage**: `@react-native-async-storage/async-storage`
