import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const getFirebaseAuth = () => {
  if (getApps().length) return getAuth(getApp())

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FORADMIN
  let credential = applicationDefault()
  let projectId = process.env.FIREBASE_PROJECT_ID || undefined

  if (serviceAccountKey && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey)
      credential = cert(serviceAccount)
      projectId ||= serviceAccount.project_id
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_FORADMIN must contain valid service-account JSON")
    }
  }

  const firebaseApp = initializeApp({ credential, projectId })

  return getAuth(firebaseApp)
}

export const verifyGoogleIdToken = async (idToken) =>
  getFirebaseAuth().verifyIdToken(idToken)
