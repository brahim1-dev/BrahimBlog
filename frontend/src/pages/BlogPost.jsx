import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import DOMPurify from "dompurify"
import { FiArrowLeft, FiArrowUpRight, FiCalendar, FiClock, FiEdit3, FiShare2 } from "react-icons/fi"
import { selectCurrentUser } from "../redux/UserSlice"

const formatDate = (date) => {
  if (!date) return "Recently published"

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

const BlogPost = () => {
  const { id } = useParams()
  const user = useSelector(selectCurrentUser)
  const [pageState, setPageState] = useState({ id: null, post: null, error: "" })
  const [shareMessage, setShareMessage] = useState("")
  const isCurrentPost = pageState.id === id
  const post = isCurrentPost ? pageState.post : null
  const error = isCurrentPost ? pageState.error : ""
  const isLoading = !isCurrentPost

  useEffect(() => {
    const controller = new AbortController()

    const loadPost = async () => {
      try {
        const response = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "This story could not be found.")
        }

        setPageState({ id, post: result, error: "" })
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setPageState({
            id,
            post: null,
            error: requestError.message || "This story could not be loaded.",
          })
        }
      }
    }

    loadPost()
    return () => controller.abort()
  }, [id])

  const handleShare = async () => {
    const shareUrl = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url: shareUrl })
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setShareMessage("Link copied")
    } catch (shareError) {
      if (shareError.name === "AbortError") return

      const { default: Swal } = await import("sweetalert2")
      await Swal.fire({
        title: "Share this story",
        input: "text",
        inputValue: shareUrl,
        confirmButtonText: "Done",
        confirmButtonColor: "#123e43",
      })
    }
  }

  if (isLoading) {
    return (
      <main className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-4 w-32 rounded bg-[#dfe8e1]" />
          <div className="mt-8 h-4 w-24 rounded bg-[#dfe8e1]" />
          <div className="mt-4 h-10 max-w-3xl rounded bg-[#e8eee9]" />
          <div className="mt-3 h-10 max-w-xl rounded bg-[#e8eee9]" />
          <div className="mt-8 aspect-[16/8] rounded-2xl bg-[#e8eee9]" />
          <div className="mx-auto mt-10 max-w-2xl space-y-3">
            <div className="h-4 rounded bg-[#edf1ed]" />
            <div className="h-4 rounded bg-[#edf1ed]" />
            <div className="h-4 w-4/5 rounded bg-[#edf1ed]" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-3xl">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] hover:text-[#183f3b]">
            <FiArrowLeft aria-hidden="true" className="size-4" /> Back to stories
          </Link>
          <div className="mt-10 border-y border-[#e5d8d1] py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b35038]">Story unavailable</p>
            <h1 className="mt-3 text-2xl font-semibold text-[#183f3b]">We couldn&apos;t open this story.</h1>
            <p role="alert" className="mt-2 text-sm leading-6 text-slate-500">
              {error || "This story may have been removed or the address may be incorrect."}
            </p>
            <Link to="/blogs" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
              Explore other stories <FiArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const author = post.author && typeof post.author === "object" ? post.author : null
  const authorId = author?._id || post.author
  const isOwner = Boolean(user?._id && authorId && String(user._id) === String(authorId))
  const safeContent = DOMPurify.sanitize(post.content || "")
  const plainContent = DOMPurify.sanitize(post.content || "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
  const wordCount = plainContent.trim().split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220))

  return (
    <main className="px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <article className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] transition-colors hover:text-[#183f3b]">
            <FiArrowLeft aria-hidden="true" className="size-4" /> All stories
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                to={`/edit-post/${post._id}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d9e2dc] px-3 text-sm font-semibold text-[#183f3b] transition-colors hover:bg-[#e8f2eb]"
              >
                <FiEdit3 aria-hidden="true" className="size-4" /> Edit story
              </Link>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d9e2dc] px-3 text-sm font-semibold text-[#183f3b] transition-colors hover:bg-[#e8f2eb]"
            >
              <FiShare2 aria-hidden="true" className="size-4" />
              {shareMessage || "Share"}
            </button>
          </div>
        </div>

        <header className="mx-auto mt-10 max-w-4xl">
          <p className="inline-flex rounded-full bg-[#dcefe5] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#1d6b58]">
            {post.category || "Stories"}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#183f3b] sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[#d9e2dc] pb-6 text-sm text-slate-500">
            <span className="font-semibold text-[#183f3b]">
              {author?.fullName || author?.username || "Bilaas Kubaro Writer"}
            </span>
            {author?.username && <span>@{author.username}</span>}
            <span className="inline-flex items-center gap-1.5">
              <FiCalendar aria-hidden="true" className="size-4" />
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock aria-hidden="true" className="size-4" />
              {readingMinutes} min read
            </span>
          </div>
        </header>

        {post.image && (
          <figure className="mt-8 overflow-hidden rounded-2xl bg-[#e8f2eb]">
            <img
              src={post.image}
              alt={post.title}
              fetchPriority="high"
              className="max-h-[34rem] w-full object-cover"
            />
          </figure>
        )}

        <div className="blog-post-content mx-auto mt-10 max-w-[42rem]">
          <div dangerouslySetInnerHTML={{ __html: safeContent }} />
          {post.link && (
            <aside className="mt-10 border-l-2 border-[#b35038] bg-[#f3f4e9] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#648078]">Further reading</p>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]"
              >
                {post.link} <FiArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </aside>
          )}
        </div>

        <footer className="mx-auto mt-14 flex max-w-[42rem] flex-col justify-between gap-4 border-t border-[#d9e2dc] pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">Thanks for spending a little time with this story.</p>
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
            More stories <FiArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </footer>
      </article>
    </main>
  )
}

export default BlogPost