import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { setAuthError, setAuthStatus, setUser } from "../redux/UserSlice"

const GoogleAuthButton = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSignIn = async () => {
    setError("")
    setIsLoading(true)
    dispatch(setAuthStatus("loading"))

    try {
      const { signInWithGoogle } = await import("../firebase.js")
      const idToken = await signInWithGoogle()
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to sign in with Google.")
      }

      dispatch(setUser(result))
      navigate("/dashboard")
    } catch (requestError) {
      if (requestError.code === "auth/popup-closed-by-user") {
        dispatch(setAuthStatus("idle"))
        return
      }

      const firebaseMessages = {
        "auth/configuration-not-found": "Firebase Authentication is not initialized for this project. In Firebase Console, open Authentication and enable the Google provider. Verify the web app auth domain and project ID belong to this same project.",
        "auth/operation-not-allowed": "Google sign-in is disabled for this Firebase project. Enable Google under Authentication > Sign-in method.",
        "auth/unauthorized-domain": "This website domain is not authorized for Firebase Authentication. Add it under Authentication > Settings > Authorized domains.",
        "auth/invalid-api-key": "The Firebase API key is invalid. Copy the Web API key from the correct Firebase project into VITE_FIREBASE_API_KEY.",
      }
      const message = firebaseMessages[requestError.code]
        || (requestError instanceof TypeError
          ? "Unable to reach the server. Please try again."
          : requestError.message || "Unable to sign in with Google.")
      setError(message)
      dispatch(setAuthError(message))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
      >
        <FcGoogle aria-hidden="true" className="size-5" />
        {isLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}

export default GoogleAuthButton
