import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-3.5 px-6 rounded-xl font-bold tracking-wide transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-lg";
  
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 hover:shadow-cyan-500/20 border border-cyan-500/50",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
    outline: "bg-transparent border border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-400",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 shadow-none",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};