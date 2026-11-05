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

const SignUp = () => {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [visiblePasswords, setVisiblePasswords] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    dispatch(clearAuthError())

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      dispatch(setAuthError("Passwords do not match."))
      return
    }

    setIsSubmitting(true)
    dispatch(setAuthStatus("loading"))

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to create your account.")
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

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-brand-primary outline-none transition placeholder:text-slate-400 focus:border-brand-secondary focus:ring-4 focus:ring-brand-sky/40"
  const labelClassName =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600"

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
                  d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm2 2h6m-3-3v6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              Get started
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-brand-primary sm:text-[2rem]">
              Create your account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Join the community and start sharing stories worth reading.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className={labelClassName}>
                Full name
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
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className={labelClassName}>
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
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClassName}>
                Email address
              </label>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-secondary"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m4 7 8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className={labelClassName}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setVisiblePasswords((visible) => !visible)}
                  aria-pressed={visiblePasswords}
                  className="text-xs font-medium text-brand-primary transition-colors hover:text-brand-secondary"
                >
                  {visiblePasswords ? "Hide passwords" : "Show passwords"}
                </button>
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
                  type={visiblePasswords ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClassName}>
                Confirm password
              </label>
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
                  id="confirmPassword"
                  name="confirmPassword"
                  type={visiblePasswords ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter it again"
                  className={inputClassName}
                />
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
              {isSubmitting ? "Creating account..." : "Create account"}
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
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default SignUp
