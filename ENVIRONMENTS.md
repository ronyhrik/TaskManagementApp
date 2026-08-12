# Multi-environment setup (dev / staging / prod)

## Current state

| Piece | dev | staging | prod |
|---|---|---|---|
| JS config (`APP_ENV`, `API_URL`, `ENABLE_LOGS`) | ✅ wired | ✅ wired | ✅ wired |
| Android product flavor + build variant | ✅ wired, builds today | ✅ wired, builds today | ✅ wired, builds today |
| Android Firebase backend | real project | placeholder (copy of dev's config) | placeholder (copy of dev's config) |
| iOS build configuration | ⏸️ skipped (out of scope, see below) | ⏸️ skipped | ⏸️ skipped |
| iOS Firebase backend | real project | placeholder (copy of dev's config) | placeholder (copy of dev's config) |

**Scope note:** per-environment iOS builds and fully isolated Firebase backends per environment were judged out of scope for this assignment and intentionally not completed. All three environments currently point at the **same** Firebase project (`taskmanagementapp-41745`), and iOS builds with the default Debug/Release configuration only (always loading the base `.env`). The Android side (JS config + flavors) already demonstrates the multi-environment setup end to end. The sections below ("One-time manual Xcode setup" and "Completing the backend separation") are left in place as reference/leftover scaffolding — the `Podfile`'s `post_install` ENVFILE mapping is a harmless no-op until those steps are actually done — in case this gets picked up later, but neither is required.

---

## Building each environment

### Android (fully wired — no manual step needed)

```sh
# Debug builds
npx react-native run-android --mode devDebug
npx react-native run-android --mode stagingDebug
npx react-native run-android --mode prodDebug

# Release APKs
cd android && ./gradlew assembleDevRelease   # or assembleStagingRelease / assembleProdRelease
```

Each variant automatically picks up `.env.development` / `.env.staging` / `.env.production` (via the `envConfigFiles` map in `android/app/build.gradle`) and the matching `android/app/src/<flavor>/google-services.json`.

### iOS (not set up — skipped for this assignment)

```sh
npx react-native run-ios
```

Just builds the default configuration (base `.env`, dev values). The per-environment commands below (`--mode Debug-Dev` etc.) won't work unless the manual Xcode step in the next section is done first.

```sh
npx react-native run-ios --mode Debug-Dev
npx react-native run-ios --mode Debug-Staging
npx react-native run-ios --mode Debug-Prod
```

No new Scheme is needed — `--mode` just tells Xcode which build configuration to use within the existing "TaskManagementApp" scheme.

---

## (Optional, not done) One-time manual Xcode setup for iOS environments

This project intentionally does **not** script `.xcodeproj` changes — Xcode project files are edited by hand here. Do this once in Xcode:

1. Open `ios/TaskManagementApp.xcworkspace` (after running `pod install`).
2. **Duplicate build configurations**: Project navigator → select the `TaskManagementApp` project (blue icon) → *Info* tab → *Configurations*. For both `Debug` and `Release`, click **+** → *Duplicate "Debug"/"Release" Configuration*, and name the results exactly:
   - `Debug-Dev`, `Release-Dev`
   - `Debug-Staging`, `Release-Staging`
   - `Debug-Prod`, `Release-Prod`

   (These 6 names are what the `Podfile`'s `post_install` hook and the run commands above already expect.)

3. **Re-run `pod install`** so CocoaPods mirrors the new configuration names into the Pods project and applies the `ENVFILE` mapping already added to the `Podfile`.

4. **Add the GoogleService-Info.plist swap script**: select the `TaskManagementApp` target → *Build Phases* → **+** → *New Run Script Phase*. Name it "Select GoogleService-Info.plist for environment", drag it to run **after** "Copy Bundle Resources", and paste:

   ```sh
   set -e
   case "${CONFIGURATION}" in
     *Dev*) SRC="${SRCROOT}/config/dev/GoogleService-Info.plist" ;;
     *Staging*) SRC="${SRCROOT}/config/staging/GoogleService-Info.plist" ;;
     *Prod*) SRC="${SRCROOT}/config/prod/GoogleService-Info.plist" ;;
     *) SRC="${SRCROOT}/TaskManagementApp/GoogleService-Info.plist" ;;
   esac
   echo "Using GoogleService-Info.plist from ${SRC}"
   cp -f "${SRC}" "${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/GoogleService-Info.plist"
   ```

   The per-environment plist files already exist at `ios/config/dev/`, `ios/config/staging/`, `ios/config/prod/` (currently placeholders — see below).

That's it — steps 1–4 only need to be done once and are then part of the `.xcodeproj`/`Podfile.lock` going forward.

---

## (Optional, not done) Completing the backend separation

Right now dev/staging/prod all share one Firebase project. To give each environment its own isolated backend (separate Auth users, separate Firestore data):

1. In the [Firebase console](https://console.firebase.google.com), create 2 new projects (e.g. `taskmanagementapp-staging`, `taskmanagementapp-prod`) — free, just needs your Google account, no Play Store/App Store account involved.
2. In each new project, register an Android app and an iOS app using the **same** identifiers as today (Android package `com.taskmanagementapp`, iOS bundle ID — check `ios/TaskManagementApp.xcodeproj` project settings for the exact value). Firebase allows the same package name / bundle ID across different projects.
3. Download each project's config files and drop them in place of the placeholders:
   - Android: `android/app/src/staging/google-services.json`, `android/app/src/prod/google-services.json`
   - iOS: `ios/config/staging/GoogleService-Info.plist`, `ios/config/prod/GoogleService-Info.plist`
4. Enable Email/Password auth and create a Firestore database in each new project (same as the existing dev project).

No build configuration changes are needed for this — the flavors/configurations already read from these exact paths.
