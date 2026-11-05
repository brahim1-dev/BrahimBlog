# Firebase Google Sign-In Setup

1. In Firebase Console, create or select the project used by this blog.
2. In Authentication, enable the Google sign-in provider.
3. Register a Web app and copy its API key, auth domain, project ID, and app ID.
4. Add `localhost` and your deployed website domain to Firebase Authentication's authorized domains.
5. Create a Firebase Admin service account key for the backend, or run the backend in an environment that provides Google Application Default Credentials. Keep the downloaded JSON key outside the repository and never commit it.

Add the Firebase Web app values to the root `.env.local` (this file is ignored by Git):

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-web-app-id
```

The `VITE_` values are public Firebase Web app configuration and are exposed to the browser. Never prefix private credentials with `VITE_`.

For the backend, download a service-account JSON key from Firebase Console → Project settings → Service accounts. Keep it outside the repository, then set its path in the root `.env`:

```dotenv
GOOGLE_APPLICATION_CREDENTIALS=C:/secure/path/firebase-service-account.json
FIREBASE_PROJECT_ID=your-project-id
```

The backend also supports `FIREBASE_SERVICE_ACCOUNT_KEY_FORADMIN` when it contains valid service-account JSON, but the file-path method is preferred. Do not commit the JSON key or paste it into source files.

If Firebase reports `auth/configuration-not-found`, verify that Authentication is initialized for this project and Google is enabled under Authentication → Sign-in method. The API key and auth domain must come from the same Firebase Web app/project.

Restart the frontend and backend after adding these settings. Google sign-in accepts verified Google email addresses. New Google users are created as enabled `user` accounts; existing accounts with a matching verified email are linked without changing their role or enabled status. Disabled accounts are rejected by the backend.
