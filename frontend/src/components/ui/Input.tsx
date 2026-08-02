import { forwardRef } from "react";

const Input = forwardRef(({ 
  label,
  error,
  className = "", 
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input 
        ref={ref}
        className={`
          w-full px-4 py-2 bg-bg-surface border rounded-lg outline-none
          transition-all duration-200 text-text-primary placeholder:text-text-secondary/50
          focus:ring-2 focus:ring-brand-primary/50
          ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-brand-primary'}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
