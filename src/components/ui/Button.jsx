import { forwardRef } from "react";

const Button = forwardRef(function Button(
  { variant = "primary", className = "", children, ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 h-12 rounded-full font-semibold text-sm transition-all";
  const styles = {
    primary: "bg-lime text-ink hover:brightness-110 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed",
    ghost: "bg-white/5 text-white hover:bg-white/10",
    outline: "border border-white/15 text-white hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
  };
  return (
    <button ref={ref} className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
});

export default Button;
