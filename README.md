Task Management App

A modern, cross-platform task management application built with React Native, featuring offline-first architecture, cloud synchronization, push notifications, and dark/light theme support.

Features

- Authentication: Secure Firebase Email/Password authentication
- Task Management: Create, edit, delete, and complete tasks with ease
- Offline Support: Full offline functionality with SQLite local storage
- Cloud Sync: Bidirectional sync with Firestore when online
- Push Notifications: Local push notifications with customizable task reminders
- Dark/Light Theme: Toggle between dark and light modes with persistent state
- Cross-Platform: iOS and Android support with native performance
- Type-Safe: Full TypeScript support with strict mode

Architecture

  UI Layer                             
  - Components
  - Screens

State Management (Redux Toolkit)
  - Auth State (user, login/logout)
  - Task State (tasks array, CRUD operations)
  - Theme State (light/dark mode)
  - Sync State (online/offline status)

Services Layer
  - Auth Service (Firebase Email/Password)
  - Notification Service (Notifee) 
  - Network Service (Connectivity Monitoring)
  - Sync Service (Offline-first sync)

Database Layer (Repository Pattern)
  - SQLite (Local storage, offline-first)
  - Firestore (Cloud storage, real-time sync)



Offline-First Architecture

The app implements a offline-first strategy:

1. Local Storage : All operations (add, edit, delete) happen on SQLite first
2. Queued Sync: Changes are queued for cloud sync when offline
3. Auto Sync: When online, changes sync to Firestore automatically
4. Conflict Resolution: Last-write-wins for conflicting updates

 Directory Structure

```
src/
	-app/
		-config/
			-env.ts              //Environment configuration
			-firebase.ts         //Firebase initialization
			-theme.ts            //Theme colors (light/dark)
		-database/
			-sqlite.ts          //SQLite initialization
			-task.repository.ts  // Task CRUD operations
			-sync.service.ts     //Bidirectional sync logic
		-services/
			-auth.service.ts     //Firebase authentication
			-notification.service.ts // Push notifications
			-network.service.ts  //Connectivity monitoring
		-store/
			-index.ts            //Redux store configuration
			-slices/
				-auth.slice.ts   //Auth state
				-task.slice.ts   //Task state
				-theme.slice.ts  //Theme state
				- sync.slice.ts   // Sync state
		-navigation/
			-RootNavigator.tsx   //Conditional routing
			-AuthStack.tsx       //Auth screens
			-AppStack.tsx        //App screens
			-lazyScreens.tsx     //Lazy loading
		-ui/
			-screens/
				-LoginScreen.tsx
				-SignupScreen.tsx
				-TaskListScreen.tsx
				-TaskEditorScreen.tsx
			-components/
				-TaskItem.tsx


Libraries Used

Core Framework
- react-native (v0.83.1): Cross-platform mobile framework
- typescript (v5.8.3): Type-safe JavaScript

Navigation
- @react-navigation/native: Navigation routing
- @react-navigation/native-stack: Stack navigator
- react-native-screens: Native screen management
- react-native-safe-area-context: Safe area handling

State Management
- @reduxjs/toolkit (v2.11.2): Redux state management
- react-redux (v9.2.5): React bindings for Redux

Backend & Database
- firebase (v10.12.2): Authentication and Firestore
  - Email/Password authentication
  - Cloud database with real-time sync
- react-native-sqlite-storage (v6.0.1): Local SQLite database
- sql.js (v1.8.0): SQL query execution

Push Notifications
- @notifee/react-native (v9.1.8): Local push notifications with sound

UI & Styling
- react-native-modal-datetime-picker (v18.0.0): Date/time picker
- react-native-vector-icons: Icon library

Networking
- @react-native-community/netinfo (v11.4.0): Network monitoring
- axios (v1.7.7): HTTP client

How to Run

Prerequisites

- Node.js (v18+) and npm
- Xcode (for iOS on macOS)
- Android Studio or Android SDK (for Android)
- CocoaPods (for iOS dependencies)
- Ruby (bundled with macOS)

Installation

# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..

Run Development Environment

iOS:
npm run ios

Android
npm run android

Run Specific Environment

# Development (default)
npm run dev

# Staging
npm run staging

# Production
npm run prod


Build for Production

Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password method)
3. Enable Firestore Database
4. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
5. Place files in:
   - Android: `android/app/`
   - iOS: `ios/TaskManagementApp/`


 Known Limitations

1. Notifications
- Local notifications only: Uses Notifee for local push notifications. Cloud push (Firebase Cloud Messaging) not implemented.
- Android 13+: Requires user to grant notification permission
- iOS: Requires permission on first app launch
- Sound: Custom notification sound requires file inclusion in native bundle

2. Authentication
- Email/Password only: No social login (Google, Facebook, etc.)
- No biometric: Face ID/Touch ID not available
- No password reset: Not implemented
- Session limited: Logout clears all local data

3. Offline Sync
- No conflict resolution UI: Uses automatic last-write-wins strategy
- Large datasets: Performance may degrade with 1000+ tasks
- Background sync: Only syncs when app is active
- No manual retry: Failed syncs don't have retry UI

4. Performance
- Large lists: FlatList optimized but may struggle with 5000+ tasks

5. Development
- Hardcoded credentials: Firebase config in source code
- No CI/CD: GitHub Actions not configured
- Limited tests: not implemented unit test case




