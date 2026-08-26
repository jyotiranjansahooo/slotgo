"use client";

import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({
  children,
}: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="slotgo-page-transition">
      {children}

      <style jsx>{`
        .slotgo-page-transition {
          animation: slotgoPageEnter
            320ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes slotgoPageEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .slotgo-page-transition {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}