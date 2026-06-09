import { forwardRef } from "react";

const Button = forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-primary hover:bg-brand-secondary text-white focus:ring-brand-primary",
    secondary: "bg-bg-surface hover:bg-white/10 text-text-primary focus:ring-white/20 border border-white/10",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-white/5 text-text-secondary hover:text-white focus:ring-white/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
