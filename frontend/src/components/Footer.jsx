import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="mt-auto px-4 pb-4 pt-12 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-[0_16px_50px_-36px_rgba(15,48,53,0.3)] backdrop-blur">
        <div className="grid gap-10 px-6 py-9 sm:px-9 md:grid-cols-[1.4fr_1fr_1fr] md:py-11">
          <div className="max-w-sm">
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white transition-transform group-hover:-rotate-3">
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
              <span className="text-lg font-bold tracking-tight text-brand-primary">
                Bilaas <span className="text-brand-secondary">Kubaro</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              A welcoming space for stories, ideas, and the people who share
              them.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Explore
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-slate-500 transition-colors hover:text-brand-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="text-sm text-slate-500 transition-colors hover:text-brand-primary"
                >
                  Browse blogs
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-slate-500 transition-colors hover:text-brand-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-slate-500 transition-colors hover:text-brand-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Get involved
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Have a story to tell? Create an account and join the community.
            </p>
            <Link
              to="/signup"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
            >
              Create an account
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="size-4"
              >
                <path
                  d="M4.5 10h11m0 0L11 5.5m4.5 4.5L11 14.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <p>© {new Date().getFullYear()} Bilaas Kubaro. All rights reserved.</p>
          <p className="font-medium text-brand-secondary">Stories worth sharing.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer