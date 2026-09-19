# 🔥 Ping Mobile App (`Ping`)

**Ping** is a high-performance, visually stunning dating and social connection mobile application built with **React Native CLI**, **TypeScript**, and **React 19**.

---

## 🎨 Design System & Aesthetics

Ping follows a custom design system centered around vibrant, warm colors, modern typography, glassmorphism card elevation, and smooth touch interactions.

### 💖 Color Palette

| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Magenta (Primary)** | `#E8447A` | Primary buttons, active tabs, brand accents |
| **Coral (Secondary)** | `#F2865F` | Highlights, gradient transitions, secondary buttons |
| **Peach (Accent)** | `#F4A47C` | Tags, superlike accents, dynamic badges |
| **Plum (Dark Text/Bg)** | `#2B1620` | Dark mode background, primary text headers |
| **Cream (Light Bg)** | `#FBEEE6` | App main background, card backgrounds |
| **Blush (Muted)** | `#FBDCE6` | Subtle pill backgrounds, light borders |

---

## ✨ Application Features

- 📱 **3-Step Animated Onboarding Flow**
  - Custom vector illustrations (`OnboardingIllustrations.tsx`)
  - Feature highlights carousel: *Discover Nearby Matches*, *Real-Time Instant Chat*, *Vibe Check & Match*
- 🔑 **Authentication Screen**
  - Dynamic Login & Sign-Up tab toggle
  - Email/Password form validation with custom input fields (`Input.tsx`)
  - **Google One-Tap / OAuth Sign-In** integration button
- 🔥 **Tinder-Style Home Card Stack (`HomeScreen.tsx`)**
  - Smooth card stack deck (`CardStack.tsx`)
  - Profile details, location distance, match score badges, bio, interests tags (`Tag.tsx`)
  - Interactive Action Bar: Pass (❌), Superlike (⭐), Like (💖)
  - Auto-advance on user swipe/action
- 📡 **Built-in Network Logger & Axios Client**
  - Intercepts all outgoing HTTP requests and incoming responses
  - Console logs formatted with HTTP status, URL, response payload, and request duration

---

## 🛠 Tech Stack

- **Framework:** React Native CLI v0.87.1
- **UI Library:** React 19.2
- **Language:** TypeScript v6
- **Vector Graphics:** `react-native-svg` (Solid-fill vector components for reliable native rendering)
- **Safe Area:** `react-native-safe-area-context`
- **HTTP Client:** Axios with custom logger interceptors

---

## 🔑 How Google Authentication Works

Ping uses a **Firebase-Free, Server-Verified Google OAuth Flow**:

```
[ Mobile App ]                         [ Ping Backend ]                 [ Google OAuth ]
      |                                        |                               |
      |--- 1. User taps "Google Sign-In" ------>|                               |
      |--- 2. @react-native-google-signin ---->|--- Get ID Token ------------->|
      |                                        |<-- Return Signed ID Token ----|
      |--- 3. Send POST /api/auth/google ----->|                               |
      |       { idToken }                      |--- 4. Verify ID Token -------->|
      |                                        |<-- Valid Google User Profile -|
      |                                        |--- 5. Issue JWT Access/Refresh|
      |<-- 6. Return JWT + User Profile -------|
```

### Steps to enable Google Sign-In:

1. Install Google Sign-In native module:
   ```bash
   npm install @react-native-google-signin/google-signin
   ```
2. Configure Web Client ID in `App.tsx` or auth service:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
   });
   ```
3. Pass `idToken` from the client to backend `POST /api/auth/google`.

---

## 🏁 Getting Started

### Prerequisites

- Node.js >= 22.11.0
- JDK 17+
- Android Studio & Android SDK (for Android builds)
- Xcode & CocoaPods (for iOS builds, macOS required)

### 1. Installation

```bash
cd Ping
npm install
```

### 2. Run Metro Bundler

```bash
npm start
```

### 3. Launch App on Emulator/Device

**Android:**
```bash
npm run android
```

**iOS:**
```bash
cd ios && pod install && cd ..
npm run ios
```

---

## 📂 Project Structure

```
Ping/
├── App.tsx                        # Root component with SafeAreaProvider & navigation state
├── index.js                       # Entry point
├── package.json
├── tsconfig.json
└── src/
    ├── components/                # Reusable UI components
    │   ├── Button.tsx             # Primary, secondary, outline, text buttons
    │   ├── Input.tsx              # Text inputs with icon slots & error messages
    │   ├── Tag.tsx                # Interest pill tags
    │   ├── Header.tsx             # App top navigation header
    │   ├── CardStack.tsx          # Swipeable profile deck container
    │   └── illustrations/         # Custom SVG vector assets
    │       ├── OnboardingIllustrations.tsx
    │       └── BrandAssets.tsx
    ├── screens/                   # Page view screens
    │   ├── OnboardingScreen.tsx   # 3-page introduction carousel
    │   ├── AuthScreen.tsx         # Login & Register views
    │   └── HomeScreen.tsx         # Main Tinder-style card deck
    ├── services/                  # API client & services
    │   ├── apiClient.ts           # Axios instance
    │   └── logger.ts              # Network request/response logger
    ├── theme/                     # Design system tokens
    │   ├── colors.ts              # Palette colors
    │   └── typography.ts          # Font weights & text presets
    └── types/                     # Shared TypeScript interfaces
        ├── user.ts                # Profile & match types
        └── api.ts                 # API response schemas
```
