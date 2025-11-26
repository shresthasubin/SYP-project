import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false, 
  disabled = false,
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neon-red hover:bg-red-600 text-white shadow-[0_0_10px_rgba(255,0,51,0.3)] hover:shadow-[0_0_20px_rgba(255,0,51,0.5)]",
    secondary: "bg-neon-blue hover:bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]",
    outline: "border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white bg-transparent",
    danger: "bg-red-900/50 border border-red-500/50 text-red-200 hover:bg-red-900/80",
    ghost: "hover:bg-white/5 text-gray-400 hover:text-white",
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};

export default Button;
