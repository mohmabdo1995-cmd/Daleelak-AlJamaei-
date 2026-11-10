# PWA Native Installation & Resilient Service Worker Architecture

A robust, mobile-first Progressive Web App (PWA) update for "دليلك الجامعي" that guarantees instant installability on Android and iOS devices, resolves WebAPK minting hangs, and ensures the graduation cap logo appears reliably in the user's mobile app drawer.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and are baked into this architecture:

- **Prompt Presentation**: Automatic welcome banner modal for first-time visitors paired with a persistent, accessible **"تثبيت التطبيق"** (Install App) action button in the top navigation header.
- **Service Worker Strategy**: **Network-First with dynamic asset caching & offline fallback**. Fresh online updates take precedence, while previously visited pages, lectures, and study tools remain accessible offline without network stalls.
- **Mobile Installation Flow**: **Native Android WebAPK with instant 1-tap fallback**. Triggers the system `beforeinstallprompt` directly, with clear on-screen reassurance and quick-step guidance for carriers with high latency (e.g., MTN Sudan / Sudani) to ensure zero installation delays.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms "دليلك الجامعي" from a standard web portal into a native-grade mobile application that can be installed directly onto Android, iOS, and desktop operating systems. The installed app displays the official graduation cap icon (`/pwa-192x192.png`) on home screens and in the Android app drawer, launches full-screen without browser URL bars, and operates seamlessly even when offline.
- **Target Audience**: Sudanese and Arab university students using mobile devices (especially Android Chrome, Samsung Internet, and iOS Safari), often experiencing intermittent mobile connectivity.
- **Key Value**: 100% reliable 1-click installation without app store friction, near-zero device storage usage, and offline study capability for lectures, schedules, and calculators.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Visit Discovery**:
   - The user opens the platform. After a 1.2-second smooth dwell, the welcome modal slides up with the graduation cap icon and key benefits ("تثبيت التطبيق").
   - A single tap on **"تثبيت التطبيق الآن"** invokes the native system installation prompt.
2. **Persistent Header Access**:
   - If dismissed, the user can tap the prominent teal button in the header at any time to re-trigger installation.
3. **Android WebAPK & Quick Fallback**:
   - When the user confirms installation, live visual feedback is displayed (`بدأت عملية التثبيت بنجاح`).
   - If Google Play Services experiences network latency minting the WebAPK, the expandable guidance shows the instant 3-second Chrome menu method: `(⋮)` ➔ **"إضافة إلى الشاشة الرئيسية"**.
4. **Post-Install Transition**:
   - The app listens for the `appinstalled` event, fires a celebratory toast (`تم التثبيت بنجاح! 🎓 ستجد التطبيق الآن في قائمة تطبيقات هاتفك`), and automatically suppresses all install prompts when launched in `standalone` display mode.

### Visual Identity & Theme Tokens

- **Palette**:
  - Deep Navy Canvas (`#071A3D`): Primary brand color, status bar, and splash screen background.
  - Emerald Teal (`#16958E`): Vibrant accent for interactive install CTAs, checkmarks, and active badges.
  - Soft Sky Accent (`#BCEBFF`): Micro-accents, icon highlights, and glowing pill markers.
- **Typography**: Dual Arabic pairing (`Tajawal` for bold headings, `Cairo` for readable body text).
- **Surface Elevation**: Single-elevation `rounded-3xl` cards with subtle hairline borders (`border-[#16958E]/30`) and frosted backdrop blur (`backdrop-blur-md`).
- **Touch Ergonomics**: All mobile touch targets $\ge 44 \times 44\text{px}$, following mobile thumb-zone principles.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Manifest Optimization for Android WebAPK Validation
- **Chosen Approach**: Strict, standards-compliant `manifest.json` stripped of desktop-only experimental flags (`window-controls-overlay`, `shortcuts` arrays). Clean resolution definitions (`192x192` any, `512x512` any, and `512x512` maskable with generous safe-zone padding).
- **Why**: Google's WebAPK minting service validates manifests strictly; unsupported flags trigger server-side build queue timeouts or silently fail to deliver the `.apk` package to the phone.
- **Alternatives Considered**: Keeping rich shortcuts and complex display overrides — rejected due to known mobile WebAPK pipeline stalls.

### Decision 2: Network-First Service Worker with Resilient Precaching
- **Chosen Approach**: `Promise.allSettled()` in the `install` phase to prevent any individual asset network error from aborting the entire Service Worker registration. Network-first fetch handler for navigation and dynamic data with stale-while-revalidate for static scripts/styles/fonts.
- **Why**: University students frequently access the platform over unstable connections. If one background image fails to download, the entire application still installs cleanly and caches all visited pages.
- **Alternatives Considered**: Cache-first for all resources — rejected because live schedule updates and announcements would be delayed.

### Decision 3: Comprehensive Multi-Device Guidance
- **Chosen Approach**: Tri-modal detection handling:
  1. Chromium Android / Desktop: Native `beforeinstallprompt` API.
  2. iOS Safari: Guided 2-step Share Sheet instructions (`Share` ➔ `Add to Home Screen`).
  3. AI Studio / In-App Iframe: Direct URL launch button to break out of sandboxed iframes.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Mobile Device                              │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                         Browser View                         │     │
│   │                                                              │     │
│   │   [Header Component]            [PwaInstallPrompt Component] │     │
│   │   • "تثبيت التطبيق" Button       • Auto-Modal Banner         │     │
│   │   • Custom Event Trigger        • BeforeInstallPrompt State  │     │
│   │   • Standalone Mode Detector    • iOS / Android Fallback     │     │
│   └──────────────────────┬───────────────────────────────┬───────┘     │
│                          │                               │             │
│                          ▼                               ▼             │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │              Native Browser & OS Capabilities                │     │
│   │                                                              │     │
│   │   • window.beforeinstallprompt capture                       │     │
│   │   • navigator.serviceWorker (/sw.js v2.2.0)                  │     │
│   │   • Web App Manifest (/manifest.json)                        │     │
│   │   • App Installed Event ('appinstalled')                     │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Service Worker & Cache Storage                     │
│                                                                        │
│   ┌─────────────────────┐   ┌─────────────────┐   ┌────────────────┐   │
│   │ daleelak-static-v2  │   │ daleelak-fonts  │   │daleelak-dynamic│   │
│   │ • index.html        │   │ • Google Fonts  │   │• Lectures      │   │
│   │ • pwa-192x192.png   │   │ • GStatic       │   │• Subject Media │   │
│   │ • pwa-512x512.png   │   └─────────────────┘   │• Schedules     │   │
│   └─────────────────────┘                         └────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

1. **`index.html` Pre-bootstrap Hook**:
   - Captures `beforeinstallprompt` before React bundles load. Stores in `window.__deferredPWAInstallPrompt` and dispatches `pwa-prompt-available`.
2. **`PwaInstallPrompt.tsx`**:
   - `isStandalone`: Evaluates `display-mode: standalone` and `navigator.standalone`. Completely unmounts if running as installed app.
   - `triggerInstall()`: Invokes native `.prompt()`, tracks `userChoice`, and activates reassurance mode.
   - `showTroubleshootGuide`: Collapsible toggle providing the 1-2-3 Chrome menu fallback.
3. **`Header.tsx`**:
   - Dispatches `trigger-pwa-install` on click so users can initiate installation from the top bar at any time.
4. **`/public/sw.js`**:
   - Manages cache lifecycle, handles `skipWaiting()`, and enables full offline reading of university materials.
