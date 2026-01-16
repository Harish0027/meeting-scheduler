"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();

  // Check if we're on an authenticated app route
  const isAppRoute = [
    "/dashboard",
    "/event-types",
    "/bookings",
    "/availability",
  ].some((route) => pathname?.startsWith(route));

  // Check if we're on the login page
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <head>
        <title>Cal.com - Meeting Scheduler</title>
        <meta
          name="description"
          content="The better way to schedule your meetings"
        />
      </head>
      <body className="antialiased bg-white">
        {isAppRoute ? (
          <AppShell>{children}</AppShell>
        ) : (
          <>
            {!isLoginPage && <Navbar />}
            <main className="min-h-screen">{children}</main>
          </>
        )}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#374151",
              border: "1px solid #E5E7EB",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            success: {
              iconTheme: {
                primary: "#111827",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
