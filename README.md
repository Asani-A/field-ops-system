# FieldOps - Real-Time Distributed Task System

A distributed field service management platform consisting of a web-based dispatch dashboard and a mobile technician application. The system features real-time bidirectional data synchronization, allowing office managers and field technicians to collaborate instantly.

## Overview

This project demonstrates a serverless "Backend-as-a-Service" architecture using Firebase. It unifies two distinct frontend applications into a single reactive ecosystem where state changes on one device are instantly reflected on all connected clients via WebSockets.

## Key Features

* **Real-Time Synchronization:** Updates to tasks (creation, completion) propagate instantly across all devices using Firestore listeners.
* **Cross-Platform Architecture:**
    * **Web Dashboard:** React + Vite for high-performance administrative control.
    * **Mobile App:** React Native (Expo) for iOS/Android field usage.
* **Authentication:** Unified identity management across web and mobile using Firebase Auth.
* **Offline Persistence:** Mobile application caches data locally to ensure functionality in low-connectivity environments.
* **Type Safety:** Shared TypeScript interfaces ensure data consistency between platforms.

## Tech Stack

* **Core:** TypeScript, React, React Native
* **Build Tools:** Vite (Web), Expo (Mobile)
* **Backend:** Firebase (Serverless)
* **Database:** Cloud Firestore (NoSQL, Real-time)
* **Authentication:** Firebase Auth

## Project Structure

This repository uses a monorepo-style structure to house both client applications:

```
field-ops-system/
├── web-dashboard/      # React Admin Panel (Vite)
│   ├── src/lib/        # Firebase initialization (Web)
│   └── .env.local      # Web Environment Variables
├── mobile-app/         # React Native Technician App (Expo)
│   ├── src/lib/        # Firebase initialization (Native/Cross-Platform)
│   └── .env            # Mobile Environment Variables
```

## Setup & Installation

### Prerequisites
* Node.js (v18 or higher)
* npm
* Expo Go app (for testing mobile on physical devices)

1. Configuration (Environment Variables)

This project requires a Firebase project configuration. You must create environment files for both applications.

Web Dashboard (web-dashboard/.env.local):
```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

Mobile App (mobile-app/.env):
```
EXPO_PUBLIC_API_KEY=your_api_key
EXPO_PUBLIC_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_PROJECT_ID=your_project_id
EXPO_PUBLIC_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_APP_ID=your_app_id
```

2. Running the Web Dashboard

Navigate to the web directory and start the development server:
```
cd web-dashboard
npm install
npm run dev
```
The dashboard will be available at http://localhost:5173.

3. Running the Mobile App

Navigate to the mobile directory and start the Expo bundler:
```
cd mobile-app
npm install
npx expo start
```
* Press w to run in the web browser.
* Scan the QR code to run on a physical device via Expo Go.

## Usage Guide

1. Login: Use the administrative credentials (e.g., admin@hq.com) to log in to both the Web and Mobile apps.
2. Dispatch: Create a new task on the Web Dashboard.
3. Sync: Observe the task appear instantly on the Mobile App.
4. Complete: Tap "Mark Complete" on the Mobile App and observe the status update instantly on the Web Dashboard.
