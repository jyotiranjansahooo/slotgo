import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        "rounded-2xl border border-white/10",
        "bg-white/[0.035]",
        "shadow-xl shadow-black/10",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}