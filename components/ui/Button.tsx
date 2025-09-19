import { cn } from '@/lib/utils/helpers';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary-500 hover:bg-primary-600 text-white',
            secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
            ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground',
            glass: 'glassmorphism hover:bg-white/20 dark:hover:bg-black/20 text-foreground',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2',
            lg: 'px-6 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'rounded-lg font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'active:scale-95',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';