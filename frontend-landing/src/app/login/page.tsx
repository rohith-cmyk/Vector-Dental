"use client";

import Link from "next/link";

const SPECIALIST_URL =
  process.env.NEXT_PUBLIC_SPECIALIST_PORTAL_URL || "http://localhost:3000";
const GD_URL = process.env.NEXT_PUBLIC_GD_PORTAL_URL || "http://localhost:3001";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <header className="border-b border-[#1a4d3c]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#1a4d3c]">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            Vector Referral
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-[#1a4d3c] text-center mb-2">
            Choose your portal
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Select where you&apos;d like to sign in
          </p>

          <div className="space-y-4">
            <a
              href={`${SPECIALIST_URL}/login`}
              className="block w-full p-6 rounded-2xl bg-white border-2 border-[#1a4d3c]/20 hover:border-[#1a4d3c] hover:bg-[#d4edda]/30 transition-all text-left group"
            >
              <h2 className="text-lg font-semibold text-[#1a4d3c] group-hover:underline">
                Specialist Portal
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                For specialists receiving referrals from GPs
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-[#1a4d3c]">
                Sign in →
              </span>
            </a>

            <a
              href={`${GD_URL}/login`}
              className="block w-full p-6 rounded-2xl bg-white border-2 border-[#1a4d3c]/20 hover:border-[#1a4d3c] hover:bg-[#d4edda]/30 transition-all text-left group"
            >
              <h2 className="text-lg font-semibold text-[#1a4d3c] group-hover:underline">
                General Dentist Portal
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                For GPs referring patients to specialists
              </p>
              <span className="mt-3 inline-block text-sm font-medium text-[#1a4d3c]">
                Sign in →
              </span>
            </a>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={`${SPECIALIST_URL}/signup`}
              className="font-medium text-[#1a4d3c] hover:underline"
            >
              Start for Free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
