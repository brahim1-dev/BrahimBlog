import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"
import { FiArrowLeft, FiArrowUpRight, FiBookOpen, FiEdit3, FiLink, FiPlus, FiTrash2 } from "react-icons/fi"
import { selectCurrentUser } from "../redux/UserSlice"

const formatDate = (date) => {
  if (!date) return "Recently published"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

const PostList = () => {
  const user = useSelector(selectCurrentUser)
  const [posts, setPosts] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState("")
  const [deletingPostId, setDeletingPostId] = useState("")
  const isLoading = Boolean(user?.username) && isFetching

  const handleDelete = async (post) => {
    const confirmation = await Swal.fire({
      title: "Delete this post?",
      text: "This action cannot be undone.",
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
      await Swal.fire({
        title: "Couldn't delete post",
        text: requestError.message || "The post could not be deleted.",
        icon: "error",
        confirmButtonColor: "#123e43",
      })
    } finally {
      setDeletingPostId("")
    }
  }

  useEffect(() => {
    if (!user?.username) return undefined

    const controller = new AbortController()

    const loadPosts = async () => {
      try {
        const response = await fetch(
          `/api/posts/user/${encodeURIComponent(user.username)}`,
          { signal: controller.signal },
        )
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Your posts could not be loaded.")
        }

        setPosts(Array.isArray(result) ? result : [])
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Your posts could not be loaded.")
        }
      } finally {
        if (!controller.signal.aborted) setIsFetching(false)
      }
    }

    loadPosts()
    return () => controller.abort()
  }, [user?.username])

  return (
    <main className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] transition-colors hover:text-[#183f3b]"
        >
          <FiArrowLeft aria-hidden="true" className="size-4" /> Back to dashboard
        </Link>

        <div className="flex flex-col justify-between gap-5 border-b border-[#d9e2dc] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#648078]">The archive</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#183f3b] sm:text-4xl">Your posts</h1>
            <p className="mt-2 text-sm text-slate-500">
              {user?.username ? `Stories by @${user.username}` : "Sign in to see your stories."}
            </p>
          </div>
          <Link
            to="/create-post"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#123e43] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58] sm:self-auto"
          >
            <FiPlus aria-hidden="true" className="size-4" /> Create post
          </Link>
        </div>

        {error ? (
          <p role="alert" className="py-8 text-sm text-[#9b422f]">{error}</p>
        ) : isLoading ? (
          <p className="py-8 text-sm text-slate-500">Loading your posts...</p>
        ) : !user?.username ? (
          <div className="py-10">
            <Link to="/signin" className="text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
              Sign in to view your posts <FiArrowUpRight aria-hidden="true" className="inline size-4" />
            </Link>
          </div>
        ) : posts.length ? (
          <div className="divide-y divide-[#e2e8e3]">
            {posts.map((post) => (
              <article key={post._id} className="flex flex-col justify-between gap-4 py-6 sm:flex-row sm:items-center">
                <div className="flex min-w-0 gap-4">
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#648078]">
                      <span>{post.category || "Uncategorized"}</span>
                      <span aria-hidden="true" className="size-1 rounded-full bg-[#aabbb0]" />
                      <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                    </p>
                    <h2 className="truncate text-xl font-semibold text-[#183f3b]">{post.title}</h2>
                    {post.content && (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-500">
                        {post.content}
                      </p>
                    )}
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]"
                      >
                        <FiLink aria-hidden="true" className="size-4" /> Open related link
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
                  <Link
                    to={`/edit-post/${post._id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d9e2dc] px-3 text-sm font-semibold text-[#183f3b] transition-colors hover:border-[#1d6b58] hover:bg-[#e8f2eb]"
                  >
                    <FiEdit3 aria-hidden="true" className="size-4" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    disabled={Boolean(deletingPostId)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#e5d8d1] px-3 text-sm font-semibold text-[#9b422f] transition-colors hover:bg-[#f9e3dc] disabled:cursor-wait disabled:opacity-60"
                  >
                    <FiTrash2 aria-hidden="true" className="size-4" />
                    {deletingPostId === post._id ? "Deleting..." : "Delete"}
                  </button>
                  <Link
                    to={`/blogs/${post._id}`}
                    className="inline-flex min-h-10 items-center gap-1 self-start px-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43] sm:self-auto"
                  >
                    Read <FiArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-10">
            <FiBookOpen aria-hidden="true" className="size-7 text-[#1d6b58]" />
            <h2 className="mt-4 text-xl font-semibold text-[#183f3b]">No stories here yet</h2>
            <p className="mt-2 text-sm text-slate-500">When you publish your first post, it will appear here.</p>
            <Link to="/create-post" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
              Write your first post <FiArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default PostList