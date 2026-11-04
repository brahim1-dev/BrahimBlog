import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { FiArrowLeft, FiImage, FiSave, FiX } from "react-icons/fi"

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const imageInputRef = useRef(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [currentImage, setCurrentImage] = useState("")
  const [newImage, setNewImage] = useState("")
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    const loadPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`, { signal: controller.signal })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "This post could not be loaded.")
        }

        setTitle(result.title || "")
        setCategory(result.category || "")
        setContent(result.content || "")
        setLink(result.link || "")
        setCurrentImage(result.image || "")
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "This post could not be loaded.")
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadPost()
    return () => controller.abort()
  }, [id])

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
      setNewImage(reader.result)
      setRemoveCurrentImage(false)
      setError("")
    }
    reader.onerror = () => setError("The image could not be opened. Try another file.")
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    if (newImage) {
      setNewImage("")
      if (imageInputRef.current) imageInputRef.current.value = ""
      return
    }

    setNewImage("")
    setRemoveCurrentImage(Boolean(currentImage))
    setCurrentImage("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    const updatedPost = {
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      link: link.trim() || null,
      image: imageUrl.trim() || newImage || (removeCurrentImage ? null : undefined),
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedPost),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Your changes could not be saved.")
      }

      navigate("/posts")
    } catch (requestError) {
      setError(requestError.message || "Your changes could not be saved.")
    } finally {
      setIsSaving(false)
    }
  }

  const previewImage = imageUrl.trim() || newImage || (!removeCurrentImage ? currentImage : "")

  return (
    <main className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/posts"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] transition-colors hover:text-[#183f3b]"
        >
          <FiArrowLeft aria-hidden="true" className="size-4" /> Back to your posts
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#648078]">Story editor</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#183f3b] sm:text-4xl">Edit your post</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Make your changes, then save them when you&apos;re ready.</p>
        </div>

        {isLoading ? (
          <p className="border-y border-[#d9e2dc] py-8 text-sm text-slate-500">Loading post...</p>
        ) : error && !title ? (
          <div className="border-y border-[#e5d8d1] py-6">
            <p role="alert" className="text-sm text-[#9b422f]">{error}</p>
            <Link to="/posts" className="mt-4 inline-flex text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
              Return to your posts
            </Link>
          </div>
        ) : (
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
                className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
              />
            </div>
            <div>
              <label htmlFor="post-image" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#183f3b]">
                <FiImage aria-hidden="true" className="size-4 text-[#1d6b58]" /> Cover image
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
              <p className="mt-2 text-xs text-slate-500">An image URL takes priority. Leave it empty to choose a file from your computer.</p>
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
              <p className="mt-2 text-xs text-slate-500">Leave both image fields empty to keep the current image. Files up to 6 MB.</p>
              {previewImage && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#d9e2dc] bg-white p-3">
                  <img src={previewImage} alt="Post cover preview" className="size-20 rounded-lg object-cover" />
                  <p className="min-w-0 flex-1 pt-1 text-sm text-[#183f3b]">
                    {imageUrl.trim() ? "Image from URL" : newImage ? "New cover image" : "Current cover image"}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
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
              <label htmlFor="post-link" className="mb-2 block text-sm font-semibold text-[#183f3b]">Related link</label>
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
              <label htmlFor="post-content" className="mb-2 block text-sm font-semibold text-[#183f3b]">Story</label>
              <textarea
                id="post-content"
                name="content"
                required
                rows={12}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="w-full resize-y rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm leading-7 text-[#183f3b] outline-none transition placeholder:text-slate-400 focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
              />
            </div>

            {error && <p role="alert" className="text-sm text-[#9b422f]">{error}</p>}

            <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
              <Link to="/posts" className="py-2 text-sm font-semibold text-[#52756c] hover:text-[#183f3b]">Cancel</Link>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#123e43] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58] disabled:cursor-wait disabled:opacity-60"
              >
                <FiSave aria-hidden="true" className="size-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default EditPost