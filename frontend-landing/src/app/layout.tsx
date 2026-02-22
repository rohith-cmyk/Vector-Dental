import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vector Referral | Dental Referral Management Made Simple",
  description:
    "One platform to manage referrals and grow your practice. Send referrals in seconds, track status in real time, and keep patients on track with automated notifications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
