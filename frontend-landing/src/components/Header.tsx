"use client";

import React from "react";
import Link from "next/link";

const navLinks = [
  { href: "#solutions", label: "Solutions" },
  { href: "#for-specialists", label: "For Specialists" },
  { href: "#for-gps", label: "For GPs" },
  { href: "#contact", label: "Contact" },
];

const specialistUrl =
  process.env.NEXT_PUBLIC_SPECIALIST_PORTAL_URL || "http://localhost:3000";

export function Header() {
  return React.createElement(
    "div",
    {
      role: "banner",
      className:
        "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#1a4d3c]/10",
    },
    React.createElement(
      "div",
      { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between h-16 lg:h-20" },
        React.createElement(
          Link,
          { href: "/", className: "flex items-center gap-2" },
          React.createElement("img", {
            src: "/logo.png",
            alt: "",
            className: "h-8 w-8 object-contain",
          }),
          React.createElement(
            "span",
            { className: "text-xl font-bold text-[#1a4d3c]" },
            "Vector Referral"
          )
        ),
        React.createElement(
          "nav",
          { className: "hidden md:flex items-center gap-8" },
          ...navLinks.map((link) =>
            React.createElement(
              "a",
              {
                key: link.href,
                href: link.href,
                className:
                  "text-sm font-medium text-gray-600 hover:text-[#1a4d3c] transition-colors",
              },
              link.label
            )
          )
        ),
        React.createElement(
          "div",
          { className: "flex items-center gap-3" },
          React.createElement(
            Link,
            {
              href: "/login",
              className:
                "hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#1a4d3c] border border-[#1a4d3c] rounded-lg hover:bg-[#1a4d3c]/5 transition-colors",
            },
            "Log In"
          ),
          React.createElement(
            Link,
            {
              href: `${specialistUrl}/signup`,
              className:
                "inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#1a4d3c] rounded-lg hover:bg-[#0f3328] transition-colors",
            },
            "Start for Free"
          )
        )
      )
    )
  );
}
