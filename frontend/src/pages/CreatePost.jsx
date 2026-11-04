import { lazy, Suspense, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiArrowLeft, FiFeather, FiImage, FiLink, FiSend, FiX } from "react-icons/fi"

const RichTextEditor = lazy(() => import("../components/RichTextEditor"))

const CreatePost = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState("")
  const [imageName, setImageName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [link, setLink] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imageInputRef = useRef(null)

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.")
      event.target.value = ""
      return
    }

    if (file.size > 6 * 1024 * 1024) {
      setError("Choose an image smaller than 6 MB.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result)
      setImageName(file.name)
      setError("")
    }
    reader.onerror = () => setError("The image could not be opened. Try another file.")
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage("")
    setImageName("")
    setImageUrl("")
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    const storyText = content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .trim()

    if (!storyText) {
      setError("Write some story content before publishing.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          content: content.trim(),
          image: imageUrl.trim() || image || undefined,
          link: link.trim() || undefined,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Your post could not be published.")
      }

      navigate("/posts")
    } catch (requestError) {
      setError(requestError.message || "Your post could not be published.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] transition-colors hover:text-[#183f3b]"
        >
          <FiArrowLeft aria-hidden="true" className="size-4" /> Back to dashboard
        </Link>

        <div className="mb-8">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#648078]">
            <FiFeather aria-hidden="true" className="size-4 text-[#b35038]" /> New story
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#183f3b] sm:text-4xl">Start with an idea.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Give your story a title, then write the rest in your own words.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 border-y border-[#d9e2dc] py-7">
          <div>
            <label htmlFor="post-title" className="mb-2 block text-sm font-semibold text-[#183f3b]">Title</label>
            <input
              id="post-title"
              name="title"
              type="text"
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What is your story about?"
              className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-base text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
            />
          </div>
          <div>
            <label htmlFor="post-category" className="mb-2 block text-sm font-semibold text-[#183f3b]">Topic</label>
            <input
              id="post-category"
              name="category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="For example, culture or travel"
              className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
            />
          </div>
          <div>
            <label htmlFor="post-image" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#183f3b]">
              <FiImage aria-hidden="true" className="size-4 text-[#1d6b58]" /> Cover image <span className="font-normal text-slate-400">Optional</span>
            </label>
            <label htmlFor="post-image-url" className="mb-2 block text-sm font-medium text-[#52756c]">Image URL</label>
            <input
              id="post-image-url"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
            />
            <p className="mt-2 text-xs text-slate-500">An image URL takes priority. Leave it empty to upload from your computer.</p>
            <label htmlFor="post-image" className="mb-2 mt-4 block text-sm font-medium text-[#52756c]">Or choose a file</label>
            <input
              ref={imageInputRef}
              id="post-image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full cursor-pointer rounded-xl border border-[#d9e2dc] bg-white text-sm text-slate-500 file:mr-4 file:border-0 file:bg-[#e8f2eb] file:px-4 file:py-3 file:font-semibold file:text-[#1d6b58] hover:file:bg-[#dcefe5]"
            />
            <p className="mt-2 text-xs text-slate-500">Image files up to 6 MB.</p>
            {(imageUrl.trim() || image) && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#d9e2dc] bg-white p-3">
                <img src={imageUrl.trim() || image} alt="Post cover preview" className="size-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="truncate text-sm font-medium text-[#183f3b]">
                    {imageUrl.trim() ? "Image from URL" : imageName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Cover image preview</p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove cover image"
                  title="Remove cover image"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-[#f9e3dc] hover:text-[#9b422f]"
                >
                  <FiX aria-hidden="true" className="size-4" />
                </button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="post-link" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#183f3b]">
              <FiLink aria-hidden="true" className="size-4 text-[#1d6b58]" /> Related link <span className="font-normal text-slate-400">Optional</span>
            </label>
            <input
              id="post-link"
              name="link"
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
            />
          </div>
          <div>
            <p id="post-content-label" className="mb-2 text-sm font-semibold text-[#183f3b]">Story</p>
            <Suspense fallback={<div role="status" className="rich-editor-shell flex min-h-72 items-center px-4 text-sm text-slate-500">Loading editor...</div>}>
              <RichTextEditor
                value={content}
                onChange={setContent}
                labelledBy="post-content-label"
              />
            </Suspense>
          </div>

          {error && <p role="alert" className="text-sm text-[#9b422f]">{error}</p>}

          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
            <Link to="/posts" className="py-2 text-sm font-semibold text-[#52756c] hover:text-[#183f3b]">Cancel</Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#123e43] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58] disabled:cursor-wait disabled:opacity-60"
            >
              <FiSend aria-hidden="true" className="size-4" />
              {isSubmitting ? "Publishing..." : "Publish story"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default CreatePost