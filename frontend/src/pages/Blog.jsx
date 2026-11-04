import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import DOMPurify from "dompurify"
import {
  FiArrowRight,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi"

const formatDate = (date) => {
  if (!date) return "Recently published"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

const getPlainText = (content) =>
  DOMPurify.sanitize(content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim()

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All stories")
  const [reloadKey, setReloadKey] = useState(0)
  const [visibleCount, setVisibleCount] = useState(9)
  const searchTerm = search.trim().toLocaleLowerCase()
  const categories = [...new Set(posts.map((post) => post.category?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "All stories" || post.category?.trim() === activeCategory
    const matchesSearch = [post.title, post.category, getPlainText(post.content), post.author?.fullName, post.author?.username]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(searchTerm))

    return matchesCategory && matchesSearch
  })
  const visiblePosts = filteredPosts.slice(0, visibleCount)

  useEffect(() => {
    const controller = new AbortController()

    const loadPosts = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/posts", { signal: controller.signal })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "The blog posts could not be loaded.")
        }

        setPosts(Array.isArray(result) ? result : [])
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "The blog posts could not be loaded.")
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadPosts()
    return () => controller.abort()
  }, [reloadKey])

  return (
    <main className="px-4 pb-20 pt-9 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <section className="flex flex-col justify-between gap-6 border-b border-[#d9e2dc] pb-8 sm:flex-row sm:items-end sm:pb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b35038]">Bilaas Kubaro · Browse</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#183f3b] sm:text-5xl">
              The story archive.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Find a new perspective, follow a topic, or settle into a story.
            </p>
          </div>
          <Link
            to="/create-post"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#123e43] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58] sm:self-auto"
          >
            <FiPlus aria-hidden="true" className="size-4" /> Create a post
          </Link>
        </section>

        <section aria-labelledby="archive-heading" className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">From the community</p>
              <h2 id="archive-heading" className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">All stories</h2>
            </div>
            {!isLoading && !error && posts.length > 0 && (
              <label className="relative block w-full sm:max-w-xs">
                <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#648078]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setVisibleCount(9)
                  }}
                  placeholder="Search stories"
                  aria-label="Search stories"
                  className="min-h-11 w-full rounded-xl border border-[#d9e2dc] bg-white/80 pl-10 pr-10 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("")
                      setVisibleCount(9)
                    }}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-[#e8f2eb] hover:text-[#183f3b]"
                  >
                    <FiX aria-hidden="true" className="size-4" />
                  </button>
                )}
              </label>
            )}
          </div>

          {!isLoading && !error && posts.length > 0 && (
            <div role="group" aria-label="Filter by topic" className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {["All stories", ...categories].map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => {
                    setActiveCategory(category)
                    setVisibleCount(9)
                  }}
                  className={`min-h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? "border-[#123e43] bg-[#123e43] text-white"
                      : "border-[#d9e2dc] bg-white/70 text-[#52756c] hover:border-[#1d6b58] hover:text-[#183f3b]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {error ? (
            <div role="alert" className="mt-6 flex flex-col items-start gap-4 border-y border-[#e5d8d1] py-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#9b422f]">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#d9e2dc] px-3 py-2 text-sm font-semibold text-[#183f3b] hover:bg-white"
              >
                <FiRefreshCw aria-hidden="true" className="size-4" /> Try again
              </button>
            </div>
          ) : isLoading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading stories">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-lg border border-[#d9e2dc] bg-white/70">
                  <div className="aspect-[16/10] bg-[#e8eee9]" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-24 rounded bg-[#dfe8e1]" />
                    <div className="h-5 rounded bg-[#e8eee9]" />
                    <div className="h-3 rounded bg-[#edf1ed]" />
                    <div className="h-3 w-4/5 rounded bg-[#edf1ed]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length ? (
            <>
              <p className="mt-4 text-sm text-slate-500" aria-live="polite">
                Showing {visiblePosts.length} of {filteredPosts.length} {filteredPosts.length === 1 ? "story" : "stories"}
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post) => {
                  const description = getPlainText(post.content)
                  const author = post.author && typeof post.author === "object" ? post.author : null

                  return (
                    <article key={post._id} className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#d9e2dc] bg-white/85 transition-colors hover:border-[#9ab9aa]">
                      <Link to={`/blogs/${post._id}`} aria-label={`Read ${post.title}`} className="relative block aspect-[16/10] overflow-hidden bg-[#e8f2eb]">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[#79938a]">
                            <FiImage aria-hidden="true" className="size-8" />
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#648078]">
                          <span>{post.category || "Stories"}</span>
                          <span aria-hidden="true" className="size-1 rounded-full bg-[#aabbb0]" />
                          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                        </div>
                        <h3 className="mt-3 text-xl font-semibold leading-snug text-[#183f3b]">
                          <Link to={`/blogs/${post._id}`} className="transition-colors hover:text-[#1d6b58]">
                            {post.title}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {description || "Open this post to read the full story."}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                          <span className="truncate text-xs font-medium text-slate-500">
                            {author?.fullName || author?.username || "Bilaas Kubaro"}
                          </span>
                          <Link to={`/blogs/${post._id}`} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
                            Read <FiArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              {visiblePosts.length < filteredPosts.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + 9)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1d6b58] px-5 text-sm font-semibold text-[#1d6b58] transition-colors hover:bg-[#e8f2eb]"
                  >
                    Load more
                    <FiArrowRight aria-hidden="true" className="size-4 rotate-90" />
                  </button>
                </div>
              )}
            </>
          ) : posts.length ? (
            <div className="mt-8 border-y border-[#e2e8e3] py-8">
              <p className="font-semibold text-[#183f3b]">No stories match these filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setActiveCategory("All stories")
                  setVisibleCount(9)
                }}
                className="mt-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-8 border-y border-[#e2e8e3] py-10">
              <h3 className="text-xl font-semibold text-[#183f3b]">No stories have been published yet.</h3>
              <p className="mt-2 text-sm text-slate-500">Be the first to share an idea with the community.</p>
              <Link to="/create-post" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
                Create a post <FiArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Blog