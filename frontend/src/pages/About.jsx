import { Link } from "react-router-dom"
import { FiArrowRight, FiArrowUpRight, FiBookOpen, FiFeather, FiUsers } from "react-icons/fi"

const principles = [
  {
    number: "01",
    icon: FiBookOpen,
    title: "Stories with substance",
    description: "Personal experiences, useful ideas, and thoughtful perspectives belong here in equal measure.",
  },
  {
    number: "02",
    icon: FiFeather,
    title: "Room to find your voice",
    description: "A good post can start small. Shape an idea, add the details that matter, and share it when it feels ready.",
  },
  {
    number: "03",
    icon: FiUsers,
    title: "A community of readers",
    description: "Every story begins with one person and becomes more meaningful when someone else takes the time to read it.",
  },
]

const About = () => {
  return (
    <main className="px-4 pb-20 pt-9 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <section className="grid items-center gap-8 border-b border-[#d9e2dc] pb-10 md:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] md:gap-14 md:pb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b35038]">About Bilaas Kubaro</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#183f3b] sm:text-5xl">
              Every good story makes room for another.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Bilaas Kubaro is a place to share ideas, experiences, and the things you have learned along the way. We believe thoughtful writing can help people see a familiar subject from a new angle.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/blogs"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#123e43] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58]"
              >
                Explore stories <FiArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                to="/create-post"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d9e2dc] px-4 text-sm font-semibold text-[#183f3b] transition-colors hover:bg-[#e8f2eb]"
              >
                Share your story <FiArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
          <figure className="relative min-h-64 overflow-hidden rounded-xl bg-[#e8f2eb] md:min-h-[23rem]">
            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85"
              alt="Notebook and pen ready for a new story"
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123e43]/85 to-transparent px-5 pb-5 pt-16 text-sm font-medium text-white">
              A place for ideas to take shape.
            </figcaption>
          </figure>
        </section>

        <section className="grid gap-8 py-10 md:grid-cols-[0.7fr_1.3fr] md:gap-14 md:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">What we value</p>
            <h2 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-[#183f3b] sm:text-3xl">
              Curiosity, care, and a point of view.
            </h2>
          </div>
          <div className="divide-y divide-[#d9e2dc] border-y border-[#d9e2dc]">
            {principles.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5 sm:py-6">
                <span className="flex items-center gap-2 text-xs font-semibold text-[#b35038] sm:flex-col sm:items-start">
                  {number} <Icon aria-hidden="true" className="size-4 text-[#1d6b58]" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#183f3b]">{title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col justify-between gap-5 border-t border-[#d9e2dc] pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#648078]">Keep the conversation going</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#183f3b]">Read, write, or say hello.</h2>
          </div>
          <Link to="/contact" className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-[#d9e2dc] px-4 text-sm font-semibold text-[#183f3b] transition-colors hover:bg-[#e8f2eb] sm:self-auto">
            Get in touch <FiArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}

export default About
