/**
 * src/components/ui/DatePicker.tsx
 * Date input with label, helper text, and calendar icon.
 */
import { type InputHTMLAttributes, forwardRef } from "react";
import { Calendar } from "lucide-react";
import { clsx } from "clsx";

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, helperText, error, required, className, id, name, ...props }, ref) => {
    const inputId = id ?? name;
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-900">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="date"
            required={required}
            className={clsx(
              "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <Calendar size={16} />
          </span>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
export default DatePicker;
