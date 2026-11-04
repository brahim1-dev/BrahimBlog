import { NavLink } from "react-router-dom"

const adminTabs = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/posts", label: "Posts" },
]

const AdminNav = () => (
  <nav aria-label="Admin sections" className="mb-8 flex gap-2 border-b border-[#d9e2dc]">
    {adminTabs.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) =>
          `border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            isActive
              ? "border-[#1d6b58] text-[#183f3b]"
              : "border-transparent text-slate-500 hover:text-[#183f3b]"
          }`
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </nav>
)

export default AdminNav
