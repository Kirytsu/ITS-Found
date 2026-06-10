/**
 * src/app/(main)/layout.tsx
 *
 * BEST PRACTICE RESPONSIVE LAYOUT:
 *
 * Structure:
 *   <body>
 *     <TopNavbar />          ← fixed sidebar on desktop, fixed top-bar on mobile
 *     <div lg:pl-64>         ← offset main content by sidebar width on desktop
 *       <div pt-14 lg:pt-0>  ← offset below mobile top-bar height (h-14)
 *         <main>             ← actual page content, max-w centered within available space
 *
 * Sticky action bars inside pages MUST use: fixed bottom-0 left-0 right-0 lg:left-64
 */
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Suspense } from "react";
import TopNavbar from "@/components/ui/TopNavbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  let unreadCount = 0;
  if (session) {
    unreadCount = await db.notification.count({
      where: { userId: session.userId, isRead: false },
    });
  }

  return (
    <>
      {/* Fixed sidebar (desktop) + fixed top-bar (mobile) */}
      <Suspense fallback={<div className="h-14 bg-white dark:bg-gray-900" />}>
        <TopNavbar
          unreadCount={unreadCount}
          userName={session?.name}
          isAdmin={session?.role === "ADMIN"}
        />
      </Suspense>

      {/*
        Wrapper that:
        - On mobile:  no left offset (sidebar is a drawer)
        - On desktop: left offset = sidebar width (lg:pl-64)
      */}
      <div className="pt-14 lg:pt-0 min-h-screen bg-gray-50 dark:bg-gray-950">
        {/*
          Inner wrapper that:
          - On mobile:  top offset = mobile navbar height (pt-14)
          - On desktop: no top offset (no top bar)
        */}
        <div className="pt-14 lg:pt-0 min-h-screen bg-gray-50">
          {/*
            Page content container:
            - Consistent horizontal padding
            - Vertical padding for breathing room
            - max-w-3xl to keep content readable on large screens
              (centered WITHIN the lg:pl-64 offset space)
          */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
