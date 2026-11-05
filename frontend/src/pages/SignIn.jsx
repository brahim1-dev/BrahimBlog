import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import GoogleAuthButton from "../components/GoogleAuthButton"
import {
  clearAuthError,
  setAuthError,
  setAuthStatus,
  setUser,
} from "../redux/UserSlice"

const SignIn = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)
    dispatch(clearAuthError())
    dispatch(setAuthStatus("loading"))

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to sign in. Please try again.")
      }

      dispatch(setUser(result))
      navigate("/dashboard")
    } catch (requestError) {
      const message =
        requestError instanceof TypeError
          ? "Unable to reach the server. Please try again in a moment."
          : requestError.message
      setError(message)
      dispatch(setAuthError(message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <section className="mx-auto max-w-md">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-brand-primary"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="size-4 transition-transform group-hover:-translate-x-1"
          >
            <path
              d="M15.5 10h-11m0 0L9 4.5M4.5 10 9 15.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </Link>

        <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-[0_24px_70px_-38px_rgba(15,48,53,0.35)] backdrop-blur sm:p-9">
          <div className="mb-8">
            <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand-sky/35 text-brand-primary">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
              >
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              Welcome back
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-brand-primary sm:text-[2rem]">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your details below to continue to your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
              >
                Username
              </label>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-secondary"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M5 20a7 7 0 0 1 14 0"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Your username"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-primary outline-none transition placeholder:text-slate-400 focus:border-brand-secondary focus:ring-4 focus:ring-brand-sky/40"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-secondary"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-brand-primary outline-none transition placeholder:text-slate-400 focus:border-brand-secondary focus:ring-4 focus:ring-brand-sky/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-brand-secondary transition-colors hover:text-brand-primary"
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-5"
                    >
                      <path
                        d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7a15.7 15.7 0 0 1-3.1 3.9M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7c.8 0 1.5-.1 2.2-.3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="size-5"
                    >
                      <path
                        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[0_10px_20px_-10px_rgba(8,98,136,0.5)] transition-all hover:-translate-y-0.5 hover:bg-brand-secondary hover:shadow-[0_10px_20px_-10px_rgba(8,98,136,0.6)] focus:outline-none focus:ring-4 focus:ring-brand-sky/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="M4.5 10h11m0 0L11 5.5m4.5 4.5L11 14.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            <span className="h-px flex-1 bg-slate-100" />
            or
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <GoogleAuthButton />

          <div className="my-6 border-t border-slate-100" />
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
            >
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default SignIn
