# Instant House Help Booking System

A smart, automated platform for booking nearby house help professionals instantly. Built with React.js, Firebase, and Modern CSS.

## Features
- **Instant Booking**: Find professionals in minutes.
- **3D Earth Visualization**: Interactive globe with real-time location mapping.
- **Smart Matching**: Auto-assigns the nearest available provider.
- **Secure Auth**: Powered by Firebase Authentication.
- **Premium UI**: Glassmorphism design with smooth animations.

## Tech Stack
- **Frontend**: React.js, Vite, Framer Motion
- **Maps**: Leaflet (OpenStreetMap)
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- Firebase account created

### 2. Installation
```bash
npm install
```

### 3. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Register a Web App.
4. Copy the `firebaseConfig` object.
5. Open `src/lib/firebase.js` and paste your config keys.

### 4. Run Locally
```bash
npm run dev
```

## Folder Structure
- `src/components`: UI components (Navbar, Cards)
- `src/pages`: Main application pages (Home, Booking, Login)
- `src/lib`: Configuration files (Firebase)
- `src/assets`: Static assets

## Deployment
To deploy to Firebase Hosting:
1. `npm install -g firebase-tools`
2. `firebase login`
3. `firebase init` (Select Hosting, point to `dist` folder)
4. `npm run build`
5. `firebase deploy`
