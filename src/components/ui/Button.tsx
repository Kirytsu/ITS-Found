/**
 * src/components/ui/Button.tsx
 */
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "destructive" | "outline" | "ghost";
type Size = "full" | "half" | "auto";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:     "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300",
  secondary:   "bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950 disabled:bg-blue-300",
  destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-300",
  outline:     "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50",
  ghost:       "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  full: "w-full",
  half: "w-1/2",
  auto: "w-auto",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "auto", icon, loading = false, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold",
        "transition-colors duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading
        ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : icon}
      {children}
    </button>
  )
);

Button.displayName = "Button";
export default Button;
