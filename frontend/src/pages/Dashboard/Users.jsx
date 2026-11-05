import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { FiPower, FiRefreshCw, FiTrash2, FiUsers } from "react-icons/fi"
import { selectCurrentUser } from "../../redux/UserSlice"
import AdminNav from "./AdminNav"

const Users = () => {
	const currentUser = useSelector(selectCurrentUser)
	const [users, setUsers] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")
	const [reloadKey, setReloadKey] = useState(0)
	const [updatingUserId, setUpdatingUserId] = useState("")
	const [updatingStatusId, setUpdatingStatusId] = useState("")
	const [deletingUserId, setDeletingUserId] = useState("")

	useEffect(() => {
		const controller = new AbortController()

		const loadUsers = async () => {
			setIsLoading(true)
			setError("")

			try {
				const response = await fetch("/api/admin/users", {
					credentials: "include",
					signal: controller.signal,
				})
				const result = await response.json()

				if (!response.ok) {
					throw new Error(result.error || "Users could not be loaded.")
				}

				setUsers(Array.isArray(result) ? result : [])
			} catch (requestError) {
				if (requestError.name !== "AbortError") {
					setError(requestError.message || "Users could not be loaded.")
				}
			} finally {
				if (!controller.signal.aborted) setIsLoading(false)
			}
		}

		loadUsers()
		return () => controller.abort()
	}, [reloadKey])

	const handleRoleChange = async (member, role) => {
		if (member.role === role) return

		const { default: Swal } = await import("sweetalert2")
		const confirmation = await Swal.fire({
			title: `${role === "admin" ? "Grant admin access" : "Remove admin access"}?`,
			text: `${member.fullName} (@${member.username}) will have the ${role} role.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: role === "admin" ? "Grant access" : "Change to user",
			cancelButtonText: "Cancel",
			confirmButtonColor: "#123e43",
			cancelButtonColor: "#52756c",
			reverseButtons: true,
			focusCancel: true,
		})

		if (!confirmation.isConfirmed) return

		setUpdatingUserId(member._id)
		setError("")
		try {
			const response = await fetch(`/api/admin/users/${member._id}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ role }),
			})
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || "The user role could not be updated.")
			}

			setUsers((currentUsers) => currentUsers.map((user) =>
				user._id === member._id ? { ...user, role: result.role } : user,
			))
		} catch (requestError) {
			setError(requestError.message || "The user role could not be updated.")
		} finally {
			setUpdatingUserId("")
		}
	}

	const handleStatusChange = async (member) => {
		const isActive = member.isActive === false
		const { default: Swal } = await import("sweetalert2")
		const confirmation = await Swal.fire({
			title: isActive ? "Enable this account?" : "Disable this account?",
			text: isActive
				? `${member.username} will be able to sign in and use the blog again.`
				: `${member.username} will be signed out and blocked from signing in, posting, and accessing posts with this account.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: isActive ? "Enable account" : "Disable account",
			cancelButtonText: "Cancel",
			confirmButtonColor: isActive ? "#1d6b58" : "#9b422f",
			cancelButtonColor: "#52756c",
			reverseButtons: true,
			focusCancel: true,
		})

		if (!confirmation.isConfirmed) return

		setUpdatingStatusId(member._id)
		setError("")
		try {
			const response = await fetch(`/api/admin/users/${member._id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ isActive }),
			})
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || "The account status could not be updated.")
			}

			setUsers((currentUsers) => currentUsers.map((user) =>
				user._id === member._id ? { ...user, isActive: result.isActive } : user,
			))
		} catch (requestError) {
			setError(requestError.message || "The account status could not be updated.")
		} finally {
			setUpdatingStatusId("")
		}
	}

	const handleDeleteUser = async (member) => {
		const { default: Swal } = await import("sweetalert2")
		const confirmation = await Swal.fire({
			title: "Delete this user?",
			text: `This permanently deletes ${member.username} and all ${member.postCount} of their posts.`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Delete user",
			cancelButtonText: "Keep user",
			confirmButtonColor: "#9b422f",
			cancelButtonColor: "#52756c",
			reverseButtons: true,
			focusCancel: true,
		})

		if (!confirmation.isConfirmed) return

		setDeletingUserId(member._id)
		setError("")
		try {
			const response = await fetch(`/api/admin/users/${member._id}`, {
				method: "DELETE",
				credentials: "include",
			})
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || "The user could not be deleted.")
			}

			setUsers((currentUsers) => currentUsers.filter((user) => user._id !== member._id))
		} catch (requestError) {
			setError(requestError.message || "The user could not be deleted.")
		} finally {
			setDeletingUserId("")
		}
	}

	const adminCount = users.filter((user) => user.role === "admin").length

	return (
		<main className="px-4 pb-20 pt-9 sm:px-6 sm:pt-14">
			<div className="mx-auto max-w-6xl">
				<Link to="/dashboard" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#52756c] hover:text-[#183f3b]">
					<FiUsers aria-hidden="true" className="size-4" /> Back to dashboard
				</Link>
				<header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#b35038]">Administration</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#183f3b] sm:text-4xl">Manage users</h1>
						<p className="mt-2 text-sm text-slate-500">Review accounts and control admin access.</p>
					</div>
					{!isLoading && !error && (
						<p className="text-sm text-slate-500">{users.length} users · {adminCount} admins</p>
					)}
				</header>

				<AdminNav />

				{error && (
					<div role="alert" className="mb-5 flex flex-col items-start justify-between gap-3 border-y border-[#e5d8d1] py-4 sm:flex-row sm:items-center">
						<p className="text-sm text-[#9b422f]">{error}</p>
						<button type="button" onClick={() => setReloadKey((key) => key + 1)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#183f3b]">
							<FiRefreshCw aria-hidden="true" className="size-4" /> Retry
						</button>
					</div>
				)}

				{isLoading ? (
					<p className="border-y border-[#e2e8e3] py-6 text-sm text-slate-500">Loading users...</p>
				) : users.length ? (
					<div className="overflow-x-auto border-y border-[#d9e2dc]">
						<table className="w-full min-w-[700px] border-collapse text-left">
							<thead>
								<tr className="border-b border-[#e2e8e3] text-xs uppercase tracking-[0.12em] text-[#648078]">
									<th scope="col" className="py-3 pr-4 font-semibold">User</th>
									<th scope="col" className="py-3 pr-4 font-semibold">Email</th>
									<th scope="col" className="py-3 pr-4 font-semibold">Posts</th>
									<th scope="col" className="py-3 pr-4 font-semibold">Status</th>
									<th scope="col" className="py-3 pr-4 font-semibold">Role</th>
									<th scope="col" className="py-3 text-right font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#e2e8e3]">
								{users.map((member) => (
									<tr key={member._id}>
										<td className="py-4 pr-4">
											<div className="flex items-center gap-3">
												<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dcefe5] text-sm font-semibold text-[#1d6b58]">
													{member.profileImage ? (
														<img src={member.profileImage} alt="" className="size-full object-cover" />
													) : (member.fullName || member.username || "U").charAt(0).toUpperCase()}
												</div>
												<div className="min-w-0">
													<p className="truncate text-sm font-semibold text-[#183f3b]">{member.fullName}</p>
													<p className="mt-0.5 text-xs text-slate-500">@{member.username}{member._id === currentUser?._id ? " · you" : ""}</p>
												</div>
											</div>
										</td>
										<td className="py-4 pr-4 text-sm text-slate-600">{member.email}</td>
										<td className="py-4 pr-4 text-sm text-slate-600">{member.postCount}</td>
										<td className="py-4 pr-4">
											<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${member.isActive === false ? "bg-[#f9e3dc] text-[#9b422f]" : "bg-[#e8f2eb] text-[#1d6b58]"}`}>
												{member.isActive === false ? "Disabled" : "Enabled"}
											</span>
										</td>
										<td className="py-4 pr-4">
											<label className="sr-only" htmlFor={`role-${member._id}`}>Role for {member.username}</label>
											<select
												id={`role-${member._id}`}
												value={member.role}
												disabled={Boolean(updatingUserId) || member._id === currentUser?._id}
												onChange={(event) => handleRoleChange(member, event.target.value)}
												className="rounded-lg border border-[#d9e2dc] bg-white px-3 py-2 text-sm text-[#183f3b] outline-none focus:border-[#1d6b58] disabled:opacity-60"
											>
												<option value="user">User</option>
												<option value="admin">Admin</option>
											</select>
										</td>
										<td className="py-4 text-right">
											<button
												type="button"
												onClick={() => handleStatusChange(member)}
												disabled={Boolean(updatingStatusId) || member._id === currentUser?._id}
												className={`mr-2 inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${member.isActive === false ? "border-[#1d6b58] text-[#1d6b58] hover:bg-[#e8f2eb]" : "border-[#e5d8d1] text-[#9b422f] hover:bg-[#f9e3dc]"}`}
											>
												<FiPower aria-hidden="true" className="size-4" />
												{updatingStatusId === member._id ? "Updating..." : member.isActive === false ? "Enable" : "Disable"}
											</button>
											<button
												type="button"
												aria-label={`Delete ${member.username}`}
												title={member._id === currentUser?._id ? "Use profile settings to delete your account" : "Delete user and all posts"}
												disabled={Boolean(deletingUserId) || member._id === currentUser?._id}
												onClick={() => handleDeleteUser(member)}
												className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e5d8d1] text-[#9b422f] hover:bg-[#f9e3dc] disabled:cursor-not-allowed disabled:opacity-40"
											>
												<FiTrash2 aria-hidden="true" className="size-4" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="border-y border-[#e2e8e3] py-8 text-sm text-slate-500">No users found.</p>
				)}
			</div>
		</main>
	)
}

export default Users
