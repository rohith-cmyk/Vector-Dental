import Link from "next/link";
import { Header } from "@/components/Header";

export default function Home() {
  const specialistUrl =
    process.env.NEXT_PUBLIC_SPECIALIST_PORTAL_URL || "http://localhost:3000";
  const gdUrl =
    process.env.NEXT_PUBLIC_GD_PORTAL_URL || "http://localhost:3001";

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-white/80 rounded-full mb-6">
              DIGITAL REFERRALS MADE SIMPLE
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1a4d3c] leading-tight">
              One platform to{" "}
              <span className="relative inline-block">
                manage referrals and grow your practice
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#fef08a]/60 -z-10" />
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Vector Referral helps specialists and general dentists work
              faster—sending referrals in seconds, tracking status in real time,
              and keeping patients on track with automated notifications.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`${specialistUrl}/signup`}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-[#1a4d3c] rounded-lg hover:bg-[#0f3328] transition-colors"
              >
                Start for Free
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-[#1a4d3c] border border-[#1a4d3c] rounded-lg hover:bg-[#1a4d3c]/5 transition-colors"
              >
                Get a Demo
              </Link>
            </div>
          </div>
          {/* Hero visual: placeholder circles (Clause-style avatars) */}
          <div className="mt-16 relative flex justify-center items-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d4edda] border-2 border-[#1a4d3c]/20 flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-[#1a4d3c]/60">
                    {i}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-200/60 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500">
            Trusted by dental practices
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-8 items-center opacity-60">
            <span className="text-gray-400 font-semibold">500+</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 font-semibold">Referrals managed</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 font-semibold">50+</span>
            <span className="text-gray-400 font-semibold">Clinics</span>
          </div>
        </div>
      </section>

      {/* Why Go Digital */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a4d3c]">
              More Secure, More Efficient, Better for Patients
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Paper referrals are slow and error-prone. Vector Referral replaces
              them with a digital process that&apos;s faster, more accurate, and
              HIPAA-compliant.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Security & HIPAA",
                desc: "Encrypted, audit-ready digital referrals",
              },
              {
                title: "Higher Completion Rates",
                desc: "Real-time tracking and patient notifications keep referrals on track",
              },
              {
                title: "Fewer Errors",
                desc: "Complete records, clear status, and proof of delivery",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-6 rounded-2xl bg-[#d4edda]/50 border border-[#1a4d3c]/10"
              >
                <h3 className="text-lg font-semibold text-[#1a4d3c]">
                  {card.title}
                </h3>
                <p className="mt-2 text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {/* Custom Referral Link */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a4d3c]">
                  Custom Referral Link – Make It Easy for GPs to Refer to You
                </h2>
                <p className="mt-4 text-gray-600">
                  Add a personalized referral link to your website and share it
                  with referring offices. GPs submit referrals in seconds—no
                  login, no training.
                </p>
                <Link
                  href={`${specialistUrl}/signup`}
                  className="mt-6 inline-flex items-center text-[#1a4d3c] font-medium hover:underline"
                >
                  Get Your Custom Link →
                </Link>
              </div>
              <div className="h-48 rounded-2xl bg-[#d4edda]/50 border border-[#1a4d3c]/10 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Link preview mockup</span>
              </div>
            </div>

            {/* Specialist Dashboard */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 h-56 rounded-2xl bg-[#d4edda]/50 border border-[#1a4d3c]/10 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Dashboard mockup</span>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a4d3c]">
                  Specialist Dashboard – Full Referral Management
                </h2>
                <p className="mt-4 text-gray-600">
                  Track, manage, and organize all incoming referrals in one place.
                  View patient details, X-rays, status history, and schedule
                  appointments in real time.
                </p>
                <Link
                  href={`${specialistUrl}/signup`}
                  className="mt-6 inline-flex items-center justify-center px-6 py-3 text-white bg-[#1a4d3c] rounded-lg hover:bg-[#0f3328] transition-colors"
                >
                  Start for Free
                </Link>
              </div>
            </div>

            {/* Refer-Magic */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1a4d3c]">
                  Refer-Magic – Send Referrals in Seconds, No Login Required
                </h2>
                <p className="mt-4 text-gray-600">
                  GPs use your referral link to submit patient info, X-rays, and
                  reason for referral. Patients get instant SMS/email
                  notifications. No accounts, no setup.
                </p>
                <Link
                  href={`${gdUrl}/referrals`}
                  className="mt-6 inline-flex items-center text-[#1a4d3c] font-medium hover:underline"
                >
                  Try a Test Referral →
                </Link>
              </div>
              <div className="h-48 rounded-2xl bg-[#d4edda]/50 border border-[#1a4d3c]/10 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Form mockup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Role */}
      <section
        id="solutions"
        className="py-20 lg:py-28 bg-[#faf8f5]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a4d3c]">
              Solutions Designed for Every Practice
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div
              id="for-specialists"
              className="p-8 rounded-2xl bg-white border border-[#1a4d3c]/10 shadow-sm"
            >
              <h3 className="text-xl font-bold text-[#1a4d3c]">
                For Specialists
              </h3>
              <p className="mt-2 font-medium text-gray-700">
                Maximize Referral Conversions & Patient Retention
              </p>
              <p className="mt-4 text-gray-600">
                Full visibility into referrals with real-time tracking. Status
                timeline, automated patient notifications, and direct patient
                engagement increase conversions.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Custom Referral Link – GPs refer directly from your link</li>
                <li>• Specialist Dashboard – Track, manage, and follow up</li>
                <li>• Refer-Magic – Accept referrals from GPs instantly</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`${specialistUrl}/signup`}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#1a4d3c] rounded-lg hover:bg-[#0f3328]"
                >
                  Start for Free
                </Link>
                <Link
                  href={`${gdUrl}/referrals`}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#1a4d3c] border border-[#1a4d3c] rounded-lg hover:bg-[#1a4d3c]/5"
                >
                  Send a Test Referral
                </Link>
              </div>
            </div>
            <div
              id="for-gps"
              className="p-8 rounded-2xl bg-white border border-[#1a4d3c]/10 shadow-sm"
            >
              <h3 className="text-xl font-bold text-[#1a4d3c]">
                For General Practitioners
              </h3>
              <p className="mt-2 font-medium text-gray-700">
                Streamline Referrals, Boost Revenue
              </p>
              <p className="mt-4 text-gray-600">
                Eliminate paper referrals and improve documentation. Keep more
                patients on track with better tracking and fewer referrals lost.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• Refer-Magic – Send referrals instantly, no login required</li>
                <li>• GD Dashboard – Track and manage all outgoing referrals</li>
                <li>• Specialist Directory – Find and refer to specialists</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`${gdUrl}/signup`}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#1a4d3c] rounded-lg hover:bg-[#0f3328]"
                >
                  Start for Free
                </Link>
                <Link
                  href={`${gdUrl}/referrals`}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#1a4d3c] border border-[#1a4d3c] rounded-lg hover:bg-[#1a4d3c]/5"
                >
                  Send a Test Referral
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features (Clause-style) */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              FEATURES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a4d3c] max-w-2xl">
            Everything you need to manage referrals
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Maximize productivity and patient care with real-time tracking,
            automated notifications, and secure file sharing.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Real-Time Dashboard",
                desc: "Track referral volume, completion rates, and time-to-appointment. See insights and trends at a glance.",
              },
              {
                title: "Smart Notifications",
                desc: "Patients receive SMS and email when a referral is submitted. Specialists get notified of new referrals.",
              },
              {
                title: "Status Tracking",
                desc: "GPs can view referral status in real time—Reviewed, Scheduled, Patient Attended, Completed.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-6 rounded-2xl bg-[#d4edda]/50 border border-[#1a4d3c]/10"
              >
                <h3 className="text-lg font-semibold text-[#1a4d3c]">
                  {card.title}
                </h3>
                <p className="mt-2 text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="py-20 lg:py-28 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a4d3c] text-center mb-12">
            See What Dentists Say About Vector Referral
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-[#1a4d3c]/10"
              >
                <p className="text-gray-600 italic">
                  &ldquo;Vector Referral has transformed how we manage referrals.
                  Simple, fast, and our patients love it.&rdquo;
                </p>
                <p className="mt-4 text-sm font-medium text-[#1a4d3c]">
                  — Dr. Placeholder
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 lg:py-20 bg-[#1a4d3c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Discover the full scale of{" "}
              <span className="underline decoration-[#86efac]/60 underline-offset-4">
                Vector Referral
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 text-[#1a4d3c] font-medium bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get a Demo
              </Link>
              <Link
                href={`${specialistUrl}/signup`}
                className="inline-flex items-center justify-center px-6 py-3 text-[#1a4d3c] font-medium bg-[#86efac] rounded-lg hover:bg-[#86efac]/90 transition-colors"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#1a4d3c]">
              Get in touch
            </h2>
            <p className="mt-4 text-gray-600">
              Have questions or ready to transform your dental referral process?
              We&apos;re here to help.
            </p>
            <a
              href="mailto:hello@vectorreferral.com"
              className="mt-6 inline-flex items-center text-[#1a4d3c] font-medium hover:underline"
            >
              hello@vectorreferral.com
            </a>
          </div>
        </div>
      </section>

      {/* Stats + Footer */}
      <section className="py-12 bg-[#f5f0e8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center mb-12">
            <div>
              <p className="text-3xl font-bold text-[#1a4d3c]">2024</p>
              <p className="text-sm text-gray-600 mt-1">Vector Referral Founded</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a4d3c]">500+</p>
              <p className="text-sm text-gray-600 mt-1">Referrals Managed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#1a4d3c]">50+</p>
              <p className="text-sm text-gray-600 mt-1">Practice Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0f3328] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="text-xl font-bold text-white">
                Vector Referral
              </Link>
              <p className="mt-4 text-sm text-white/70">
                hello@vectorreferral.com
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#for-specialists" className="hover:text-white">
                    For Specialists
                  </a>
                </li>
                <li>
                  <a href="#for-gps" className="hover:text-white">
                    For GPs
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-white">
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#contact" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Vector Referral. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
