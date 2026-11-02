import { useState } from "react"
import { Link, NavLink } from "react-router-dom"

const links = [
  { label: "Home", to: "/" },
  { label: "Blogs", to: "/blogs" },
  { label: "Contact", to: "/contact" },
]

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Main navigation"
        className="navbar-shell mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/90 px-5 shadow-[0_12px_40px_-24px_rgba(15,48,53,0.35)] backdrop-blur-xl sm:px-7"
      >
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-3"
            onClick={closeMenu}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#0d6864] text-white shadow-lg shadow-teal-900/15 transition-transform group-hover:-rotate-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
              >
                <path
                  d="M5 5.75A2.75 2.75 0 0 1 7.75 3H20v15H7.75A2.75 2.75 0 0 0 5 20.75v-15Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 17.5A2.5 2.5 0 0 1 7.5 15H20M9 7h7M9 10.5h7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold tracking-tight text-[#183536] sm:text-lg">
                Bilaas <span className="text-[#0d7770]">Kubaro</span>
              </span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                Stories worth sharing
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#eaf5f2] text-[#0d6864]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0d6864]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#0d6864] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition-all hover:-translate-y-0.5 hover:bg-[#095753] hover:shadow-teal-900/25"
            >
              Join the community
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="size-4"
              >
                <path
                  d="M4.5 10h11m0 0-4.5-4.5M15.5 10 11 14.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        <div
          id="mobile-navigation"
          inert={!menuOpen}
          className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-out md:hidden ${
            menuOpen
              ? "grid-rows-[1fr] border-t border-slate-100 pb-4 opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 pt-3">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#eaf5f2] text-[#0d6864]"
                        : "text-slate-600 hover:bg-[#eaf5f2] hover:text-[#0d6864]"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to="/signup"
                onClick={closeMenu}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#0d6864] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#095753]"
              >
                Join the community
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
