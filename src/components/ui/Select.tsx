/**
 * src/components/ui/Select.tsx
 */
import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import type { SelectOption } from "@/types";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, placeholder = "Pilih...", required, className, id, name, ...props }, ref) => {
    const selectId = id ?? name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-gray-900">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            required={required}
            className={clsx(
              "w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              error && "border-red-400",
              className
            )}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <ChevronDown size={16} />
          </span>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
