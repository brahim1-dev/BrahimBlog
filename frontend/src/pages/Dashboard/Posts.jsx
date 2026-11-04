import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import DOMPurify from "dompurify"
import { FiArrowUpRight, FiEdit3, FiImage, FiRefreshCw, FiSearch, FiTrash2, FiX } from "react-icons/fi"
import AdminNav from "./AdminNav"

const formatDate = (date) => {
  if (!date) return "Recently published"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

const getExcerpt = (content) =>
  DOMPurify.sanitize(content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim()

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [deletingPostId, setDeletingPostId] = useState("")
  const searchTerm = search.trim().toLocaleLowerCase()
  const filteredPosts = posts.filter((post) =>
    [post.title, post.category, post.author?.username, post.author?.fullName, getExcerpt(post.content)]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(searchTerm)),
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadPosts = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/admin/posts", {
          credentials: "include",
          signal: controller.signal,
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Posts could not be loaded.")
        }

        setPosts(Array.isArray(result) ? result : [])
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Posts could not be loaded.")
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadPosts()
    return () => controller.abort()
  }, [reloadKey])

  const handleDelete = async (post) => {
    const { default: Swal } = await import("sweetalert2")
    const confirmation = await Swal.fire({
      title: "Delete this post?",
      text: `This permanently deletes “${post.title}”.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete post",
      cancelButtonText: "Keep post",
      confirmButtonColor: "#9b422f",
      cancelButtonColor: "#52756c",
      reverseButtons: true,
      focusCancel: true,
    })

    if (!confirmation.isConfirmed) return

    setDeletingPostId(post._id)
    setError("")
    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "The post could not be deleted.")
      }

      setPosts((currentPosts) => currentPosts.filter((currentPost) => currentPost._id !== post._id))
    } catch (requestError) {
      setError(requestError.message || "The post could not be deleted.")
    } finally {
      setDeletingPostId("")
    }
  }

  return (
    <main className="px-4 pb-20 pt-9 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] hover:text-[#183f3b]">
          <FiEdit3 aria-hidden="true" className="size-4" /> Back to dashboard
        </Link>
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#b35038]">Administration</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#183f3b] sm:text-4xl">Manage posts</h1>
            <p className="mt-2 text-sm text-slate-500">Review, edit, or remove posts across the blog.</p>
          </div>
          {!isLoading && !error && <p className="text-sm text-slate-500">{posts.length} posts</p>}
        </header>

        <AdminNav />

        {!isLoading && !error && posts.length > 0 && (
          <div className="flex flex-col justify-between gap-3 border-b border-[#e2e8e3] py-4 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:max-w-sm">
              <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#648078]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search posts or authors"
                aria-label="Search posts or authors"
                className="min-h-11 w-full rounded-xl border border-[#d9e2dc] bg-white/80 pl-10 pr-10 text-sm text-[#183f3b] outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-[#e8f2eb]">
                  <FiX aria-hidden="true" className="size-4" />
                </button>
              )}
            </label>
            <p className="text-sm text-slate-500" aria-live="polite">Showing {filteredPosts.length} of {posts.length}</p>
          </div>
        )}

        {error ? (
          <div role="alert" className="mt-5 flex flex-col items-start justify-between gap-3 border-y border-[#e5d8d1] py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-[#9b422f]">{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#183f3b]">
              <FiRefreshCw aria-hidden="true" className="size-4" /> Retry
            </button>
          </div>
        ) : isLoading ? (
          <p className="border-y border-[#e2e8e3] py-6 text-sm text-slate-500">Loading posts...</p>
        ) : filteredPosts.length ? (
          <div className="divide-y divide-[#e2e8e3]">
            {filteredPosts.map((post) => (
              <article key={post._id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 gap-4">
                  {post.image ? (
                    <img src={post.image} alt="" loading="lazy" className="size-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-[#e8f2eb] text-[#648078]">
                      <FiImage aria-hidden="true" className="size-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#648078]">
                      <span>{post.category || "Stories"}</span>
                      <span aria-hidden="true" className="size-1 rounded-full bg-[#aabbb0]" />
                      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                      <span className="rounded-full bg-[#e8f2eb] px-2 py-1 text-[10px] text-[#1d6b58]">{post.author?.username || "Unknown author"}</span>
                    </p>
                    <h2 className="truncate text-lg font-semibold text-[#183f3b]">{post.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{getExcerpt(post.content)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                  <Link to={`/edit-post/${post._id}`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d9e2dc] px-3 text-sm font-semibold text-[#183f3b] hover:bg-[#e8f2eb]">
                    <FiEdit3 aria-hidden="true" className="size-4" /> Edit
                  </Link>
                  <Link to={`/blogs/${post._id}`} aria-label={`View ${post.title}`} className="inline-flex size-9 items-center justify-center rounded-lg border border-[#d9e2dc] text-[#1d6b58] hover:bg-[#e8f2eb]">
                    <FiArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    disabled={Boolean(deletingPostId)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#e5d8d1] px-3 text-sm font-semibold text-[#9b422f] hover:bg-[#f9e3dc] disabled:cursor-wait disabled:opacity-60"
                  >
                    <FiTrash2 aria-hidden="true" className="size-4" />
                    {deletingPostId === post._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : posts.length ? (
          <p className="border-y border-[#e2e8e3] py-8 text-sm text-slate-500">No posts match your search.</p>
        ) : (
          <p className="border-y border-[#e2e8e3] py-8 text-sm text-slate-500">There are no posts yet.</p>
        )}
      </div>
    </main>
  )
}

export default Posts
