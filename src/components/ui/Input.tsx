/**
 * src/components/ui/Input.tsx
 * Labeled text input with optional helper text, required indicator, and icon.
 */
import { type InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode; // rendered on the right side
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, icon, required, className, id, name, ...props }, ref) => {
    const inputId = id ?? name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        {helperText && (
          <p className="text-xs text-gray-400">{helperText}</p>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            className={clsx(
              "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              error && "border-red-400 focus:ring-red-400",
              icon && "pr-10",
              className
            )}
            {...props}
          />
          {icon && (
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
              {icon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
