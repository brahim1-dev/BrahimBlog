import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"

const getFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
  const missingValues = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingValues.length) {
    throw new Error(`Google sign-in is not configured. Missing ${missingValues.join(", ")}; add it to the root .env file.`)
  }

  return config
}

export const signInWithGoogle = async () => {
  const app = getApps().length ? getApp() : initializeApp(getFirebaseConfig())
  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })

  const credential = await signInWithPopup(auth, provider)
  return credential.user.getIdToken()
}
