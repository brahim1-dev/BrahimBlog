import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import DOMPurify from "dompurify"
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiImage,
  FiLock,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi"
import { clearUser, selectCurrentUser, setUser } from "../redux/UserSlice"

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

const Profile = () => {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const imageInputRef = useRef(null)
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [uploadedImage, setUploadedImage] = useState("")
  const [removeProfileImage, setRemoveProfileImage] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileStatus, setProfileStatus] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordStatus, setPasswordStatus] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [posts, setPosts] = useState([])
  const [isFetchingPosts, setIsFetchingPosts] = useState(true)
  const [postsError, setPostsError] = useState("")
  const [deletingPostId, setDeletingPostId] = useState("")
  const [deleteAccountError, setDeleteAccountError] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const isLoadingPosts = Boolean(user?.username) && isFetchingPosts
  const hasPassword = user?.hasPassword !== false

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
          setPostsError(requestError.message || "Your posts could not be loaded.")
        }
      } finally {
        if (!controller.signal.aborted) setIsFetchingPosts(false)
      }
    }

    loadPosts()
    return () => controller.abort()
  }, [user?.username])

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setProfileError("Choose a valid image file.")
      event.target.value = ""
      return
    }

    if (file.size > 6 * 1024 * 1024) {
      setProfileError("Choose an image smaller than 6 MB.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setUploadedImage(reader.result)
      setRemoveProfileImage(false)
      setProfileError("")
    }
    reader.onerror = () => setProfileError("The image could not be opened. Try another file.")
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileError("")
    setProfileStatus("")
    setIsSavingProfile(true)

    const profileImage = profileImageUrl.trim()
      || uploadedImage
      || (removeProfileImage ? null : undefined)

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          profileImage,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Your profile could not be saved.")
      }

      dispatch(setUser(result))
      setProfileImageUrl("")
      setUploadedImage("")
      setRemoveProfileImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
      setProfileStatus("Your profile has been updated.")
    } catch (requestError) {
      setProfileError(requestError.message || "Your profile could not be saved.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordError("")
    setPasswordStatus("")

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Use at least 8 characters for your new password.")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Your password could not be changed.")
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordStatus("Your password has been changed.")
    } catch (requestError) {
      setPasswordError(requestError.message || "Your password could not be changed.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeletePost = async (post) => {
    const { default: Swal } = await import("sweetalert2")
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

  const handleDeleteAccount = async () => {
    const { default: Swal } = await import("sweetalert2")
    const confirmation = await Swal.fire({
      title: "Delete your account?",
      text: hasPassword
        ? "Your profile and all your posts will be permanently deleted. Enter your password to continue."
        : "Your profile and all your posts will be permanently deleted. Verify your Google account to continue.",
      icon: "warning",
      input: hasPassword ? "password" : undefined,
      inputPlaceholder: hasPassword ? "Current password" : undefined,
      inputAttributes: hasPassword ? { autocomplete: "current-password", autocapitalize: "off" } : undefined,
      inputValidator: hasPassword ? (password) => password ? undefined : "Your password is required." : undefined,
      showCancelButton: true,
      confirmButtonText: "Delete account",
      cancelButtonText: "Keep my account",
      confirmButtonColor: "#9b422f",
      cancelButtonColor: "#52756c",
      reverseButtons: true,
      focusCancel: true,
    })

    if (!confirmation.isConfirmed) return

    setDeleteAccountError("")
    setIsDeletingAccount(true)

    try {
      let verification
      if (hasPassword) {
        verification = { password: confirmation.value }
      } else {
        const { signInWithGoogle } = await import("../firebase.js")
        verification = { googleIdToken: await signInWithGoogle() }
      }

      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(verification),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Your account could not be deleted.")
      }

      dispatch(clearUser())
      navigate("/", { replace: true })
    } catch (requestError) {
      setDeleteAccountError(requestError.message || "Your account could not be deleted.")
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (!user) {
    return (
      <main className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-3xl border-y border-[#d9e2dc] py-10">
          <h1 className="text-3xl font-semibold text-[#183f3b]">Sign in to manage your profile</h1>
          <Link to="/signin" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
            Sign in <FiArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </main>
    )
  }

  const previewImage = profileImageUrl.trim()
    || uploadedImage
    || (removeProfileImage ? "" : user.profileImage || "")
  const initial = (user.fullName || user.username || "U").charAt(0).toUpperCase()

  return (
    <main className="px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] hover:text-[#183f3b]">
          <FiArrowLeft aria-hidden="true" className="size-4" /> Back to dashboard
        </Link>

        <header className="flex flex-col justify-between gap-5 border-b border-[#d9e2dc] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#b35038]">Account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#183f3b] sm:text-4xl">Your profile</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your details, security, and posts.</p>
          </div>
          <Link to="/create-post" className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl bg-[#123e43] px-4 text-sm font-semibold text-white hover:bg-[#1d6b58] sm:self-auto">
            <FiPlus aria-hidden="true" className="size-4" /> Create post
          </Link>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:gap-14">
          <div className="space-y-12">
            <section aria-labelledby="my-posts-heading">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">Your writing</p>
                  <h2 id="my-posts-heading" className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">My posts</h2>
                </div>
                {!isLoadingPosts && !postsError && (
                  <span className="text-sm text-slate-500">{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
                )}
              </div>

              {postsError ? (
                <p role="alert" className="border-y border-[#e5d8d1] py-5 text-sm text-[#9b422f]">{postsError}</p>
              ) : isLoadingPosts ? (
                <p className="border-y border-[#e2e8e3] py-5 text-sm text-slate-500">Loading your posts...</p>
              ) : posts.length ? (
                <div className="divide-y divide-[#e2e8e3] border-y border-[#e2e8e3]">
                  {posts.map((post) => (
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
                          </p>
                          <h3 className="truncate text-lg font-semibold text-[#183f3b]">{post.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                            {getExcerpt(post.content) || "Open this post to read the full story."}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                        <Link to={`/edit-post/${post._id}`} className="inline-flex min-h-9 items-center rounded-lg border border-[#d9e2dc] px-3 text-sm font-semibold text-[#183f3b] hover:bg-[#e8f2eb]">
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post)}
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
              ) : (
                <div className="border-y border-[#e2e8e3] py-8">
                  <p className="font-semibold text-[#183f3b]">You haven&apos;t published a post yet.</p>
                  <Link to="/create-post" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
                    Write your first post <FiArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              )}
            </section>

            <section aria-labelledby="profile-details-heading">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">Personal details</p>
                <h2 id="profile-details-heading" className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">Profile details</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-5 border-y border-[#d9e2dc] py-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dcefe5] text-2xl font-semibold text-[#1d6b58]">
                    {previewImage ? <img src={previewImage} alt="Profile preview" className="size-full object-cover" /> : initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="profile-image-url" className="mb-2 block text-sm font-semibold text-[#183f3b]">Profile picture URL</label>
                    <input
                      id="profile-image-url"
                      type="url"
                      value={profileImageUrl}
                      onChange={(event) => {
                        setProfileImageUrl(event.target.value)
                        setRemoveProfileImage(false)
                        setProfileError("")
                      }}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-2.5 text-sm text-[#183f3b] outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
                        <FiUpload aria-hidden="true" className="size-4" /> Upload from computer
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                      </label>
                      {previewImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImageUrl("")
                            setUploadedImage("")
                            setRemoveProfileImage(true)
                            if (imageInputRef.current) imageInputRef.current.value = ""
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9b422f] hover:text-[#7d3024]"
                        >
                          <FiX aria-hidden="true" className="size-4" /> Remove picture
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">A URL takes priority over an upload. Image files up to 6 MB.</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-full-name" className="mb-2 block text-sm font-semibold text-[#183f3b]">Full name</label>
                    <input
                      id="profile-full-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={100}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold text-[#183f3b]">Email</label>
                    <input
                      id="profile-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-500">Username: <span className="font-medium text-[#183f3b]">@{user.username}</span></p>
                {profileError && <p role="alert" className="text-sm text-[#9b422f]">{profileError}</p>}
                {profileStatus && <p role="status" className="text-sm text-[#1d6b58]">{profileStatus}</p>}
                <button type="submit" disabled={isSavingProfile} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#123e43] px-4 text-sm font-semibold text-white hover:bg-[#1d6b58] disabled:cursor-wait disabled:opacity-60">
                  <FiSave aria-hidden="true" className="size-4" /> {isSavingProfile ? "Saving..." : "Save profile"}
                </button>
              </form>
            </section>
          </div>

          <aside className="space-y-8 self-start">
            <section aria-labelledby="password-heading" className="border-t-2 border-[#d6f27a] bg-[#f3f4e9] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-white text-[#1d6b58]">
                  <FiLock aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#648078]">Security</p>
                  <h2 id="password-heading" className="text-lg font-semibold text-[#183f3b]">Change password</h2>
                </div>
              </div>
              {!hasPassword ? (
                <p className="mt-5 text-sm leading-6 text-slate-600">
                  This account signs in with Google. Its password is managed in your Google account.
                </p>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-[#183f3b]">Current password</label>
                  <input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-[#d9e2dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15" />
                </div>
                <div>
                  <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#183f3b]">New password</label>
                  <input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-[#d9e2dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15" />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#183f3b]">Confirm new password</label>
                  <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-[#d9e2dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15" />
                </div>
                {passwordError && <p role="alert" className="text-sm text-[#9b422f]">{passwordError}</p>}
                {passwordStatus && <p role="status" className="text-sm text-[#1d6b58]">{passwordStatus}</p>}
                <button type="submit" disabled={isChangingPassword} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#123e43] px-4 text-sm font-semibold text-white hover:bg-[#1d6b58] disabled:cursor-wait disabled:opacity-60">
                  <FiLock aria-hidden="true" className="size-4" /> {isChangingPassword ? "Updating..." : "Update password"}
                </button>
                </form>
              )}
            </section>

            <section aria-labelledby="delete-account-heading" className="border-t-2 border-[#b35038] bg-[#fbf2ee] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b422f]">Danger zone</p>
              <h2 id="delete-account-heading" className="mt-2 text-lg font-semibold text-[#713b30]">Delete account</h2>
              <p className="mt-2 text-sm leading-6 text-[#805d54]">
                Permanently remove your account, profile picture, and every post you have published.
              </p>
              {deleteAccountError && <p role="alert" className="mt-3 text-sm text-[#9b422f]">{deleteAccountError}</p>}
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b35038] px-3 text-sm font-semibold text-[#9b422f] transition-colors hover:bg-[#f9e3dc] disabled:cursor-wait disabled:opacity-60"
              >
                <FiTrash2 aria-hidden="true" className="size-4" />
                {isDeletingAccount ? "Deleting account..." : "Delete my account"}
              </button>
            </section>

            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b58] hover:text-[#123e43]">
              Explore the community <FiArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Profile