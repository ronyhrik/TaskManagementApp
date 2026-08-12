# Task Management App

A cross-platform (iOS/Android) task management app built with React Native, featuring offline-first storage, Firebase-backed authentication and cloud sync, local + push notifications, and dark/light theming.

## Features

- **Authentication** — Firebase Email/Password auth
- **Task management** — create, edit, delete, and complete tasks
- **Offline-first** — every operation hits SQLite first, then syncs to the cloud
- **Cloud sync** — bidirectional sync with Firestore, last-write-wins conflict resolution
- **Notifications** — on-device reminders (Notifee) for task due times, plus Firebase Cloud Messaging push notifications routed through the same local-notification channel
- **Dark/light theme** — persisted across app restarts
- **Multi-environment** — dev/staging/prod configs (see [Environments](#environments) below)

## Architecture

**Offline-first, layered architecture:**

```
UI (screens/components)
  → Redux Toolkit (state)
  → Services (business logic: auth, task, notification, messaging, network)
  → Datasources (task.local / task.remote / theme.storage)
  → SQLite (source of truth) + Firestore (cloud mirror)
```

**Why this shape:**
- **SQLite as the source of truth, Firestore as a mirror** — every read/write hits SQLite first so the app is fully usable offline; a sync pass pushes pending local changes and pulls remote ones when connectivity returns (`task.service.ts::syncTasks`), resolved last-write-wins by `updatedAt`.
- **Datasources vs. services** — datasources (`src/app/datasources/`) only know how to talk to one storage backend (local SQLite or remote Firestore); services (`src/app/services/`) hold the actual business rules (e.g. "cancel and reschedule a reminder when a task's due time changes") and are what the UI/Redux layer calls. This keeps swapping a backend (e.g. Firestore → a different API) a datasource-only change.
- **`@react-native-firebase/*` (native SDKs) instead of the Firebase JS SDK** — needed for background FCM push delivery and better native performance; the JS SDK can't receive pushes while the app is killed.
- **Redux Toolkit slices per domain** (`auth`, `tasks`, `theme`, `sync`) rather than one global reducer, so each feature's state/thunks stay colocated and independently testable.

### Directory structure

```
src/app/
  config/
    env.ts              # typed wrapper around react-native-config
    firebase.ts          # @react-native-firebase getters (auth/firestore/messaging)
    theme.ts              # light/dark color tokens
  database/
    sqlite.ts             # SQLite connection + schema init
  datasources/
    task.local.datasource.ts   # SQLite CRUD for tasks
    task.remote.datasource.ts  # Firestore CRUD + FCM token storage
    theme.storage.ts           # persisted theme preference
  services/
    auth.service.ts         # Firebase Email/Password auth
    task.service.ts          # task CRUD + reminder scheduling + sync orchestration
    notification.service.ts  # Notifee local reminders
    messaging.service.ts     # FCM registration + foreground push handling
    network.service.ts       # connectivity monitoring (NetInfo)
  store/
    index.ts, hooks.ts
    slices/
      auth.slice.ts, task.slice.ts, theme.slice.ts, sync.slice.ts
  navigation/
    RootNavigator.tsx, AuthStack.tsx, AppStack.tsx, lazyScreens.tsx
  ui/
    screens/   # LoginScreen, SignupScreen, TaskListScreen, TaskEditorScreen
    components/ # TaskItem, ThemedButton
  types/
    task.ts
  utils/
    logger.ts   # console logging gated behind ENABLE_LOGS
```

## Libraries used

| Library | Why |
|---|---|
| `react-native` 0.83.1 / `react` 19.2 | Core framework |
| `typescript` | Type safety across the app |
| `@react-navigation/native` + `native-stack` | Navigation; `react-native-screens` + `react-native-safe-area-context` are its native dependencies |
| `@reduxjs/toolkit` + `react-redux` | App state (auth/tasks/theme/sync) |
| `@react-native-firebase/app`, `/auth`, `/firestore`, `/messaging` | Native Firebase SDKs — auth, cloud DB, and push notifications |
| `react-native-sqlite-storage` | Local offline-first database |
| `@notifee/react-native` | Local task-reminder notifications and displaying foreground FCM pushes |
| `react-native-config` | Per-environment `.env` values (`APP_ENV`, `API_URL`, `ENABLE_LOGS`) exposed to JS |
| `@react-native-community/netinfo` | Connectivity monitoring, triggers sync when back online |
| `react-native-date-picker` | Reminder date/time picker in the task editor |
| `@react-native-async-storage/async-storage` | Persisted theme preference |

## Environments

The app supports **dev / staging / prod**, but the two platforms are wired to different degrees — see [ENVIRONMENTS.md](ENVIRONMENTS.md) for the full detail (including a scope note on what was intentionally left out and why). Summary:

| | dev | staging | prod |
|---|---|---|---|
| JS config (`APP_ENV`, `API_URL`, `ENABLE_LOGS`) | ✅ | ✅ | ✅ |
| Android build variant + Firebase backend | ✅ real project | ✅ (placeholder backend) | ✅ (placeholder backend) |
| iOS build configuration | Base config only — see note below | — | — |

All three environments currently point at the **same** Firebase project (`taskmanagementapp-41745`). Fully isolated per-environment Firebase backends and per-environment iOS build configurations were out of scope for this assignment; see [Known limitations](#known-limitations).

### How to run each environment

**1. Install dependencies (once):**
```sh
npm install
cd ios && pod install && cd ..
```

**2. Copy the sample env file(s) you need** (see [Sample .env files](#sample-env-files) below) — at minimum copy `.env.example` to `.env` so the default build works.

**3. Android — fully wired, per-environment:**
```sh
npx react-native run-android --mode devDebug       # dev
npx react-native run-android --mode stagingDebug   # staging
npx react-native run-android --mode prodDebug      # prod

# Release APKs
cd android && ./gradlew assembleDevRelease   # or assembleStagingRelease / assembleProdRelease
```
Each variant automatically picks up the matching `.env.*` file and `android/app/src/<flavor>/google-services.json`.

**4. iOS — default configuration only:**
```sh
npx react-native run-ios
```
This always builds against the base `.env` (dev values) and the base `GoogleService-Info.plist` at `ios/TaskManagementApp/`. The `--mode Debug-Dev` / `Debug-Staging` / `Debug-Prod` variants referenced in `ENVIRONMENTS.md` require a one-time manual Xcode configuration step that has **not** been completed — see that file if you want to finish it.

## Sample .env files

Real `.env*` files are git-ignored. Copy the matching sample and adjust values if needed:

| Sample | Copy to | Used by |
|---|---|---|
| `.env.example` | `.env` | Default build (`npx react-native run-ios`, or Android without `--mode`) |
| `.env.development.example` | `.env.development` | `--mode devDebug` |
| `.env.staging.example` | `.env.staging` | `--mode stagingDebug` |
| `.env.production.example` | `.env.production` | `--mode prodDebug` |

Firebase config files (`GoogleService-Info.plist`, `google-services.json`) are **not** templated — they're committed as-is since they contain no secrets (Firebase relies on server-side security rules, not client config secrecy), and the app won't build without them.

## Known limitations

**Notifications**
- Local reminders (Notifee) and FCM push both work, but FCM push delivery to a specific user requires a server/Cloud Function to actually send the message — none is included, only the client-side token registration (`messaging.service.ts`).
- Android 13+ and iOS both require the user to grant notification permission on first run; if denied, reminders silently never fire (checked in Settings, not surfaced in-app).

**Authentication**
- Email/Password only — no social login, no biometric unlock, no password reset flow.
- Logging out clears all local data (no local cache retained for a logged-out user).

**Offline sync**
- Last-write-wins by timestamp — no manual conflict resolution UI.
- Sync only runs when the app is active and connectivity changes; no background sync.
- No retry UI for a failed sync — it retries next time connectivity changes or the app restarts.

**Environments**
- All three environments share one Firebase project — no data isolation between dev/staging/prod.
- iOS has no per-environment build configuration; it always builds against dev-equivalent config regardless of intent. See [ENVIRONMENTS.md](ENVIRONMENTS.md) for the (optional, undone) steps to finish this.

**Testing / CI**
- No automated test coverage beyond the default RN template test.
- No CI/CD pipeline configured.

**Performance**
- Task list is a plain `FlatList`; not verified against very large (5000+) task counts.
