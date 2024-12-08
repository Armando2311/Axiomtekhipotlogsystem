import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, href, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-axiom-500 text-white hover:bg-axiom-600 focus-visible:ring-axiom-500',
      secondary: 'bg-gray-100 text-axiom-500 hover:bg-gray-200 focus-visible:ring-gray-500',
      outline: 'border border-axiom-500 text-axiom-500 bg-white hover:bg-axiom-50 focus-visible:ring-axiom-500',
      ghost: 'hover:bg-axiom-100 hover:text-axiom-900 focus-visible:ring-axiom-500',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-lg',
    };

    const Comp = href ? Link : 'button';
    
    return (
      <Comp
        ref={ref}
        to={href}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;