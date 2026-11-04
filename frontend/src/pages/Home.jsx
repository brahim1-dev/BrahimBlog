import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import DOMPurify from "dompurify"
import { FiArrowRight, FiArrowUpRight, FiImage, FiPlus, FiRefreshCw, FiSearch, FiX } from "react-icons/fi"

const formatDate = (date) => {
  if (!date) return "Recently published"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

const getDescription = (content) =>
  DOMPurify.sanitize(content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim()

const Home = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const searchTerm = search.trim().toLocaleLowerCase()
  const filteredPosts = posts.filter((post) =>
    [post.title, post.category, getDescription(post.content)]
      .filter(Boolean)
      .some((value) => value.toLocaleLowerCase().includes(searchTerm)),
  )
  const featuredPost = filteredPosts[0]
  const visiblePosts = filteredPosts.slice(0, 6)

  useEffect(() => {
    const controller = new AbortController()

    const loadPosts = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/posts", { signal: controller.signal })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Stories could not be loaded.")
        }

        setPosts(Array.isArray(result) ? result : [])
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Stories could not be loaded.")
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b35038]">Bilaas Kubaro · The blog</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#183f3b] sm:text-5xl">
              Stories worth sharing.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Fresh ideas, lived experiences, and good reads from our community.
            </p>
          </div>
          <Link
            to="/create-post"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#123e43] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58] sm:self-auto"
          >
            <FiPlus aria-hidden="true" className="size-4" /> Create a post
          </Link>
        </section>

        {!isLoading && !error && featuredPost && (
          <section aria-label="Featured latest post" className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">Featured</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">The latest story</h2>
            </div>
            <article className="grid overflow-hidden rounded-2xl bg-[#123e43] text-white md:grid-cols-[1.15fr_1fr]">
              <Link
                to={`/blogs/${featuredPost._id}`}
                aria-label={`Read ${featuredPost.title}`}
                className="group relative block aspect-[16/10] min-h-56 overflow-hidden bg-[#1d514f] md:aspect-auto md:min-h-[22rem]"
              >
                {featuredPost.image ? (
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fetchPriority="high"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-white/60">
                    <FiImage aria-hidden="true" className="size-10" />
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
                  Featured
                </span>
              </Link>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#d6f27a]">
                  <span>{featuredPost.category || "Stories"}</span>
                  <span aria-hidden="true" className="size-1 rounded-full bg-white/50" />
                  <time dateTime={featuredPost.createdAt}>{formatDate(featuredPost.createdAt)}</time>
                </div>
                <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  <Link to={`/blogs/${featuredPost._id}`} className="transition-colors hover:text-[#d6f27a]">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/75 sm:text-base">
                  {getDescription(featuredPost.content) || "Open this post to read the full story."}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
                  <span className="text-sm font-medium text-white/70">
                    By {featuredPost.author?.fullName || featuredPost.author?.username || "Bilaas Kubaro"}
                  </span>
                  <Link
                    to={`/blogs/${featuredPost._id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#123e43] transition-colors hover:bg-[#d6f27a]"
                  >
                    Read story <FiArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        <section aria-labelledby="latest-stories-heading" className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">The latest</p>
              <h2 id="latest-stories-heading" className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">
                Recent posts
              </h2>
            </div>
            {!isLoading && !error && posts.length > 0 && (
              <label className="relative block w-full sm:max-w-xs">
                <FiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#648078]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts"
                  aria-label="Search posts"
                  className="min-h-11 w-full rounded-xl border border-[#d9e2dc] bg-white/80 pl-10 pr-10 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-[#e8f2eb] hover:text-[#183f3b]"
                  >
                    <FiX aria-hidden="true" className="size-4" />
                  </button>
                )}
              </label>
            )}
          </div>

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
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading posts">
              {[0, 1, 2].map((item) => (
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
                {search ? `${filteredPosts.length} matching ${filteredPosts.length === 1 ? "post" : "posts"}` : `${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePosts.map((post) => {
                  const description = getDescription(post.content)
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
              {filteredPosts.length > 6 && (
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/blogs"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1d6b58] px-5 text-sm font-semibold text-[#1d6b58] transition-colors hover:bg-[#e8f2eb]"
                  >
                    See all posts
                    <FiArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              )}
            </>
          ) : posts.length ? (
            <div className="mt-8 border-y border-[#e2e8e3] py-8">
              <p className="font-semibold text-[#183f3b]">No posts match your search.</p>
              <button type="button" onClick={() => setSearch("")} className="mt-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
                Clear search
              </button>
            </div>
          ) : (
            <div className="mt-8 border-y border-[#e2e8e3] py-10">
              <h3 className="text-xl font-semibold text-[#183f3b]">The first story is yours to tell.</h3>
              <p className="mt-2 text-sm text-slate-500">Start a post and share an idea with the community.</p>
              <Link to="/create-post" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
                Create a post <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Home