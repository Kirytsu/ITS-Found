/**
 * src/components/ui/SearchInput.tsx
 * Search bar with magnifying glass icon.
 */
import { type InputHTMLAttributes, forwardRef } from "react";
import { Search } from "lucide-react";
import { clsx } from "clsx";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ containerClassName, className, ...props }, ref) => {
    return (
      <div className={clsx("relative", containerClassName)}>
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          ref={ref}
          type="search"
          className={clsx(
            "w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
export default SearchInput;
