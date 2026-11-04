import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiClock,
  FiEdit3,
  FiFeather,
  FiFolder,
  FiLogOut,
  FiPlus,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi"
import { clearUser, selectCurrentUser } from "../redux/UserSlice"

const formatDate = (date) => {
  if (!date) return "Recently updated"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

const Dashboard = () => {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState("")
  const [logoutError, setLogoutError] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || user?.username || "Writer"

  const handleLogout = async () => {
    const { default: Swal } = await import("sweetalert2")
    const confirmation = await Swal.fire({
      title: "Sign out?",
      text: "You may lose any unsaved changes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, sign out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#9b422f",
      cancelButtonColor: "#52756c",
      reverseButtons: true,
      focusCancel: true,
    })

    if (!confirmation.isConfirmed) return

    setLogoutError("")
    setIsLoggingOut(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Unable to sign out. Please try again.")
      }

      dispatch(clearUser())
      navigate("/signin", { replace: true })
    } catch (requestError) {
      setLogoutError(requestError.message || "Unable to sign out. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    if (!user?.username) {
      return undefined
    }

    const controller = new AbortController()

    const loadPosts = async () => {
      setIsFetching(true)
      setError("")

      try {
        const response = await fetch(
          `/api/posts/user/${encodeURIComponent(user.username)}`,
          { signal: controller.signal },
        )
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Your stories could not be loaded.")
        }

        setPosts(Array.isArray(result) ? result : [])
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Your stories could not be loaded.")
        }
      } finally {
        if (!controller.signal.aborted) setIsFetching(false)
      }
    }

    loadPosts()
    return () => controller.abort()
  }, [user?.username, reloadKey])

  const categories = new Set(
    posts.map((post) => post.category?.trim()).filter(Boolean),
  ).size
  const latestPost = posts[0]
  const isLoading = Boolean(user?.username) && isFetching

  return (
    <main className="px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#123e43] px-6 py-8 text-white shadow-[0_28px_70px_-42px_rgba(18,62,67,0.65)] sm:px-10 sm:py-11">
          <div className="absolute -right-10 -top-20 -z-10 size-72 rounded-full border border-white/10 sm:right-12 sm:size-96" />
          <div className="absolute -right-1 -top-10 -z-10 size-52 rounded-full border border-[#d6f27a]/20 sm:right-24 sm:size-72" />
          <div className="absolute bottom-0 right-0 -z-10 h-24 w-1/2 bg-gradient-to-t from-[#d6f27a]/10 to-transparent" />

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d6f27a]">
                <FiFeather aria-hidden="true" className="size-4" />
                Your writer&apos;s room
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Good to see you, <span className="text-[#d6f27a]">{firstName}.</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
                A little space to gather your thoughts, shape your stories, and send them out into the world.
              </p>
            </div>
            <Link
              to="/create-post"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#d6f27a] px-5 text-sm font-bold text-[#173d37] transition-transform hover:-translate-y-0.5 md:self-auto"
            >
              <FiPlus aria-hidden="true" className="size-4" />
              Write a story
            </Link>
          </div>
        </section>

        <nav aria-label="Dashboard actions" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Link
            to="/posts"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d9e2dc] bg-white/70 px-3 text-sm font-semibold text-[#183f3b] transition-colors hover:border-[#1d6b58] hover:bg-[#e8f2eb]"
          >
            <FiBookOpen aria-hidden="true" className="size-4 text-[#1d6b58]" />
            My posts
          </Link>
          <Link
            to="/create-post"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d9e2dc] bg-white/70 px-3 text-sm font-semibold text-[#183f3b] transition-colors hover:border-[#1d6b58] hover:bg-[#e8f2eb]"
          >
            <FiPlus aria-hidden="true" className="size-4 text-[#1d6b58]" />
            Create post
          </Link>
          <Link
            to="/profile"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d9e2dc] bg-white/70 px-3 text-sm font-semibold text-[#183f3b] transition-colors hover:border-[#1d6b58] hover:bg-[#e8f2eb]"
          >
            <FiUser aria-hidden="true" className="size-4 text-[#1d6b58]" />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e5d8d1] bg-white/70 px-3 text-sm font-semibold text-[#9b422f] transition-colors hover:bg-[#f9e3dc] disabled:cursor-wait disabled:opacity-60"
          >
            <FiLogOut aria-hidden="true" className="size-4" />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </nav>
        {logoutError && <p role="alert" className="mt-2 text-right text-sm text-[#9b422f]">{logoutError}</p>}

        <section aria-label="Writing overview" className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="flex min-h-28 items-center gap-4 border-b border-[#d9e2dc] px-2 py-4 sm:border-b-0 sm:border-r sm:px-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#dcefe5] text-[#1d6b58]">
              <FiBookOpen aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-[#183f3b]">
                {isLoading ? "—" : posts.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">Stories published</p>
            </div>
          </div>
          <div className="flex min-h-28 items-center gap-4 border-b border-[#d9e2dc] px-2 py-4 sm:border-b-0 sm:border-r sm:px-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0ce] text-[#ad6a19]">
              <FiFolder aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-[#183f3b]">
                {isLoading ? "—" : categories}
              </p>
              <p className="mt-1 text-sm text-slate-500">Topics explored</p>
            </div>
          </div>
          <div className="flex min-h-28 items-center gap-4 px-2 py-4 sm:px-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f9e3dc] text-[#b35038]">
              <FiClock aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-[#183f3b]">
                {isLoading ? "Loading..." : latestPost ? formatDate(latestPost.createdAt) : "Ready when you are"}
              </p>
              <p className="mt-1 text-sm text-slate-500">{latestPost ? "Last story published" : "Your first story awaits"}</p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <div>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#648078]">The archive</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">Your recent stories</h2>
              </div>
              <Link
                to="/blogs"
                className="inline-flex items-center gap-1.5 pb-1 text-sm font-semibold text-[#1d6b58] transition-colors hover:text-[#123e43]"
              >
                Browse blog <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            {error ? (
              <div role="alert" className="flex flex-col items-start gap-4 border-y border-[#e5d8d1] py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#9b422f]">{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#d9e2dc] px-3 py-2 text-sm font-semibold text-[#183f3b] hover:bg-white"
                >
                  <FiRefreshCw aria-hidden="true" className="size-4" /> Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="divide-y divide-[#e2e8e3] border-y border-[#e2e8e3]" aria-label="Loading stories">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="animate-pulse py-5">
                    <div className="h-3 w-24 rounded bg-[#dfe8e1]" />
                    <div className="mt-3 h-5 max-w-sm rounded bg-[#e8eee9]" />
                    <div className="mt-3 h-3 w-32 rounded bg-[#edf1ed]" />
                  </div>
                ))}
              </div>
            ) : posts.length ? (
              <div className="divide-y divide-[#e2e8e3] border-y border-[#e2e8e3]">
                {posts.slice(0, 5).map((post) => (
                  <article key={post._id} className="group flex items-center justify-between gap-4 py-5">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#648078]">
                        <span>{post.category || "Uncategorized"}</span>
                        <span aria-hidden="true" className="size-1 rounded-full bg-[#aabbb0]" />
                        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      </div>
                      <h3 className="truncate text-lg font-semibold text-[#183f3b] transition-colors group-hover:text-[#1d6b58] sm:text-xl">
                        {post.title}
                      </h3>
                    </div>
                    <Link
                      to={`/edit-post/${post._id}`}
                      aria-label={`Edit ${post.title}`}
                      title="Edit story"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#d9e2dc] text-[#52756c] transition-colors hover:border-[#1d6b58] hover:bg-[#e8f2eb] hover:text-[#1d6b58]"
                    >
                      <FiEdit3 aria-hidden="true" className="size-4" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="border-y border-[#e2e8e3] py-9">
                <p className="text-lg font-semibold text-[#183f3b]">Your first story starts with a sentence.</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Pick an idea you keep coming back to. You can shape the rest as you go.
                </p>
                <Link
                  to="/create-post"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]"
                >
                  Start writing <FiArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            )}
          </div>

          <aside id="profile" className="scroll-mt-28 self-start border-t-2 border-[#d6f27a] bg-[#f3f4e9] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">Your profile</p>
            <div className="mt-4 flex size-12 items-center justify-center rounded-full bg-[#dcefe5] text-lg font-semibold text-[#1d6b58]">
              {(user?.fullName || user?.username || "W").charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-semibold leading-snug text-[#183f3b]">
              {user?.fullName || "Writer profile"}
            </h2>
            <p className="mt-1 text-sm text-[#61736d]">{user?.username ? `@${user.username}` : "Sign in to view your profile"}</p>
            {user?.email && <p className="mt-3 break-all text-sm text-[#61736d]">{user.email}</p>}
            <div className="mt-5 flex items-center gap-2 border-t border-[#dce1d4] pt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#648078]">
              <FiFeather aria-hidden="true" className="size-4 text-[#b35038]" />
              Stories worth sharing
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

export default Dashboard