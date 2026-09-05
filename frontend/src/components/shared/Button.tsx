import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'crm-btn';
  const variantClass = `crm-btn-${variant}`;
  const sizeClass = `crm-btn-${size}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin mr-2" />}
      {!isLoading && leftIcon && <span className="btn-left-icon mr-1.5">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="btn-right-icon ml-1.5">{rightIcon}</span>}
    </button>
  );
};

export default Button;
