# HostelHub — Hostel Movement & Attendance System

Web-based hostel gate management system for girls' hostels: digital gate register, warden-approved permission slips, night attendance with automatic gate-log cross-check, and a warden alert inbox. Offline-first PWA.

## Features
- Role-based access: Warden, Guard, CR (Class Representative), Student
- Student profiles: category (Self / Guardian), room, department, guardian + home emergency numbers, medical notes, movement history, flags
- Permission slips with warden/CR digital stamp approval
- Gate register: exit/return ticks, accompanied-by tracking, student signature
- Night attendance with auto cross-check — flags mismatches instantly
- Warden inbox: late-return alerts ("this student is late") and mismatch flags
- Daily report sheets (printable), repeat offender list
- CSV import for bulk student onboarding
- PWA: installable, works offline, Firestore syncs on reconnect

## Tech Stack
React · Vite · Tailwind CSS · Firebase (Auth, Firestore, Hosting) · PWA

## Run
```
npm install
npm run dev
```

## Firebase Setup
1. Create a project at console.firebase.google.com
2. Enable Authentication (Email/Password) and Cloud Firestore
3. Copy your web app config into `src/firebase.js`
4. Deploy the rules: `firebase deploy --only firestore:rules` (see `firestore.rules`)
5. Create user documents in the `users` collection: `{ email, role, name }`
6. Deploy hosting: `firebase deploy --only hosting`

Without Firebase config, the app runs in demo mode (localStorage) with seed data.

## Author
Ayesha Javed — BS Information Technology, Rawalpindi Women University
