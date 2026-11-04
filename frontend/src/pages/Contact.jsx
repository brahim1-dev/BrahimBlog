import { useState } from "react"
import {
  FiArrowUpRight,
  FiCheck,
  FiMail,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi"

const CONTACT_EMAIL = "braahim@gmail.com"
const WHATSAPP_NUMBER = "252611434258"

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General question",
    message: "",
    channel: "whatsapp",
  })
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setError("")
    setStatus("")
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError("")
    setStatus("")

    const message = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Topic: ${form.topic}`,
      "",
      form.message.trim(),
    ].join("\n")

    if (form.channel === "whatsapp") {
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
      const openedWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer")

      if (!openedWindow) {
        setError("Your browser blocked the WhatsApp window. Use the direct WhatsApp link instead.")
        return
      }

      setStatus("WhatsApp opened with your message. Review it there, then tap Send.")
      return
    }

    const subject = encodeURIComponent(`${form.topic} | Message from ${form.name.trim()}`)
    const body = encodeURIComponent(message)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setStatus("Your email app should open with the message ready to review and send.")
  }

  return (
    <main className="px-4 pb-20 pt-9 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl border-b border-[#d9e2dc] pb-8 sm:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b35038]">Bilaas Kubaro · Contact</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#183f3b] sm:text-5xl">
            Let&apos;s start a conversation.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Have a question, a story idea, or something you&apos;d like to share? Send a note using the form below.
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:gap-14">
          <section aria-labelledby="contact-form-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#648078]">Write to us</p>
                <h2 id="contact-form-heading" className="mt-1 text-2xl font-semibold tracking-tight text-[#183f3b]">
                  Your message
                </h2>
              </div>
              <span className="hidden items-center gap-1.5 text-xs text-[#648078] sm:inline-flex">
                <FiCheck aria-hidden="true" className="size-3.5" /> No account needed
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 border-y border-[#d9e2dc] py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-[#183f3b]">Your name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={updateForm}
                    placeholder="Name"
                    className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-[#183f3b]">Your email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={updateForm}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-topic" className="mb-2 block text-sm font-semibold text-[#183f3b]">What&apos;s this about?</label>
                <select
                  id="contact-topic"
                  name="topic"
                  value={form.topic}
                  onChange={updateForm}
                  className="w-full rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#183f3b] outline-none transition focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                >
                  <option>General question</option>
                  <option>Story feedback</option>
                  <option>Writing collaboration</option>
                  <option>Technical support</option>
                  <option>Something else</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-[#183f3b]">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={7}
                  value={form.message}
                  onChange={updateForm}
                  placeholder="Tell us a little more..."
                  className="w-full resize-y rounded-xl border border-[#d9e2dc] bg-white px-4 py-3 text-sm leading-6 text-[#183f3b] outline-none transition placeholder:text-slate-400 focus:border-[#1d6b58] focus:ring-2 focus:ring-[#1d6b58]/15"
                />
                <p className="mt-2 text-right text-xs text-slate-400">{form.message.length}/3000</p>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-[#183f3b]">Send using</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 transition-colors ${form.channel === "whatsapp" ? "border-[#1d6b58] bg-[#e8f2eb]" : "border-[#d9e2dc] bg-white hover:bg-[#f7f9f6]"}`}>
                    <input
                      type="radio"
                      name="channel"
                      value="whatsapp"
                      checked={form.channel === "whatsapp"}
                      onChange={updateForm}
                      className="accent-[#1d6b58]"
                    />
                    <FiMessageCircle aria-hidden="true" className="size-4 text-[#1d6b58]" />
                    <span className="text-sm font-medium text-[#183f3b]">WhatsApp</span>
                  </label>
                  <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 transition-colors ${form.channel === "email" ? "border-[#1d6b58] bg-[#e8f2eb]" : "border-[#d9e2dc] bg-white hover:bg-[#f7f9f6]"}`}>
                    <input
                      type="radio"
                      name="channel"
                      value="email"
                      checked={form.channel === "email"}
                      onChange={updateForm}
                      className="accent-[#1d6b58]"
                    />
                    <FiMail aria-hidden="true" className="size-4 text-[#1d6b58]" />
                    <span className="text-sm font-medium text-[#183f3b]">Email</span>
                  </label>
                </div>
              </fieldset>

              {error && <p role="alert" className="text-sm text-[#9b422f]">{error}</p>}
              {status && <p role="status" className="text-sm text-[#1d6b58]">{status}</p>}

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#123e43] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1d6b58]"
              >
                <FiSend aria-hidden="true" className="size-4" />
                Continue to {form.channel === "whatsapp" ? "WhatsApp" : "email"}
              </button>
              <p className="text-xs leading-5 text-slate-500">
                Your chosen app will open with this message filled in. Review and send it there.
              </p>
            </form>
          </section>

          <aside className="self-start bg-[#123e43] p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d6f27a]">Other ways to reach us</p>
            <h2 className="mt-3 text-2xl font-semibold leading-snug">Choose what works for you.</h2>
            <div className="mt-7 divide-y divide-white/15">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 py-5 first:pt-0"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#d6f27a]">
                  <FiMessageCircle aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/55">WhatsApp</span>
                  <span className="mt-1 block break-all text-sm font-medium text-white">+252611434258</span>
                </span>
                <FiArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-white/50 transition-colors group-hover:text-[#d6f27a]" />
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="group flex items-start gap-4 py-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#d6f27a]">
                  <FiMail aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Email</span>
                  <span className="mt-1 block break-all text-sm font-medium text-white">{CONTACT_EMAIL}</span>
                </span>
                <FiArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-white/50 transition-colors group-hover:text-[#d6f27a]" />
              </a>
            </div>
            <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-6 text-white/65">
              For story ideas, feedback, collaborations, or anything else, send a note and tell us what&apos;s on your mind.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Contact