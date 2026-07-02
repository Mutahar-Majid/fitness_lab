import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function SectionHeader({ eyebrow, title, children }: SectionHeaderProps) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
}

export function PrimaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={joinClasses("primary-button", className)} {...props} />;
}

export function SecondaryButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={joinClasses("secondary-button", className)} {...props} />;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}
