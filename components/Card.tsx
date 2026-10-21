import type { ElementType, HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  /** Render as a different element, for example <article> or <section> (default: div). */
  as?: ElementType;
}

export default function Card({ children, className = "", as: Component = "div", ...rest }: CardProps) {
  return (
    <Component className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`} {...rest}>
      {children}
    </Component>
  );
}