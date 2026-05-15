/**
 * src/components/ui/Textarea.tsx
 * Multi-line text input with label and helper text.
 */
import { type TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, required, rows = 5, className, id, name, ...props }, ref) => {
    const textareaId = id ?? name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          required={required}
          rows={rows}
          className={clsx(
            "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 resize-none",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
