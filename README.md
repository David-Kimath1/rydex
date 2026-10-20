# RydEx

RydEx is a React and Vite ride-booking prototype being prepared for a Nairobi pilot. It currently includes a map-based fare estimate, ride-category selection, account screens, and a progressive web app shell.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

The development server runs on port `6173`.

## Firebase setup

Firebase Authentication handles email/password sign-in. Cloud Firestore stores profiles and roles, and a callable Cloud Function securely assigns roles. You need a Firebase project before authentication can work.

### Test roles locally without upgrading Firebase

For a quick visual preview of the Admin, Customer, and Driver panels without Java, emulators, or a Firebase upgrade, run `npm run dev` and open `http://localhost:6173/dev/panels`. The sample role selector and account assignments on that page are local UI previews only; they do not authenticate users or change Firebase data.

To test the actual sign-up and role assignment flow, use the Firebase Emulator Suite. Emulator data is local and separate from your live Firebase project; no billing plan upgrade or cloud deployment is needed.

1. Install Java 21 or later, which the Auth and Firestore emulators require.
2. In `.env.local`, set `VITE_USE_FIREBASE_EMULATORS=true`. Keep the Firebase web app settings and bootstrap email filled in as usual.
3. Create `functions/.env.rydex-kenya` with the same bootstrap email:

   ```env
   ADMIN_BOOTSTRAP_EMAIL=first-admin@example.com
   ```

   Replace the example with the same address as `VITE_FIREBASE_ADMIN_BOOTSTRAP_EMAIL`. This file is ignored by Git.
4. In one terminal, run `npm run emulators`. The first run downloads emulator binaries. Open the Emulator UI at `http://127.0.0.1:4000` to inspect local test users and data.
5. In another terminal, run `npm run dev`. Create the first admin account in the app. The Auth emulator prints a verification link in its terminal output; open that link, then return to the app and sign in again if needed. Use **Set up first administrator** on the pending-account page.
6. Sign up with two other test email addresses, verify both using the links printed by the Auth emulator, then assign one **Customer** and the other **Driver** from the admin panel. Sign out and sign in with each account to test its panel.
7. Stop the emulators with Ctrl+C. The emulator data is local test data; it does not create users or roles in the live Firebase project.

When testing the live Firebase project instead, set `VITE_USE_FIREBASE_EMULATORS=false` (or remove it) and restart Vite. Do not deploy Cloud Functions on the Spark plan.

1. Create a project in the [Firebase console](https://console.firebase.google.com/).
2. In **Project settings → General**, create a Web app and copy its config values. Copy `.env.example` to `.env.local` and populate all `VITE_FIREBASE_*` values:

   ```sh
   cp .env.example .env.local
   ```

   These are Firebase web app configuration values, not service-account credentials. Never place a service-account private key in the client app or in a `VITE_` variable.
3. In **Authentication → Sign-in method**, enable **Email/Password**. Add `localhost` and your deployed domain to **Authentication → Settings → Authorized domains**.
4. Create a **Cloud Firestore** database in production mode.
5. Install and sign in to the Firebase CLI, then select the project from the repository:

   ```sh
   npm install -g firebase-tools
   firebase login
   firebase use --add
   ```

6. Deploy Firestore security rules and the role-management functions:

   ```sh
   npm --prefix functions install
   firebase deploy --only firestore:rules,functions
   ```

   During deployment, configure `ADMIN_BOOTSTRAP_EMAIL` to the email address that will become the first administrator. Cloud Functions deployment requires the project to use the Blaze (pay-as-you-go) plan; review Firebase pricing and set budget alerts.
7. Put the same email in `VITE_FIREBASE_ADMIN_BOOTSTRAP_EMAIL` in `.env.local`, then restart Vite. Sign up with this address, verify its email from the Firebase verification email, and use **Set up first administrator** on the pending-account screen. This bootstrap operation is restricted to that verified email and can only initialize the first admin once.
8. Admins can then open **Admin** and assign verified accounts as customers or drivers. Signup never grants a role: new accounts start as pending. The Firestore rules prevent users from changing their own role, and callable functions enforce admin role changes.

After approval, customers choose between the ride-booking MVP and customer dashboard. Driver accounts go to a separate driver dashboard.

### Moving from Supabase

The app no longer connects to Supabase. Existing Supabase accounts and passwords are not automatically copied: password hashes cannot be migrated through the client app. Users need to create Firebase accounts and verify their email. Do not delete the old Supabase project or data until you have exported anything you need and confirmed the Firebase rollout.

## Commands

```sh
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Current pilot limitations

- Fare estimates use OSRM road-route distance and duration. If routing fails or returns no valid route, the app shows an error rather than pricing a straight-line fallback.
- Boda estimates use a KSh 50 minimum, KSh 25/km, KSh 10 rounding, and a ceiling of 90% of the Economy estimate for the same route. The fare card shows the base and per-kilometer rates.
- Firebase email/password authentication, Firestore profiles, role-based access, and admin role assignment are set up. Ride history and preferences still use this browser's local storage.
- Driver matching is simulated with sample drivers. There is no live dispatch, driver app, payment processing, or production support/safety workflow yet. Do not use the current build to accept real bookings or payments.
- Routing and map tiles use public third-party services. Review service terms, limits, and operational reliability before a live launch.
