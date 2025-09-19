import { cn } from '@/lib/utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient';
    gradientColor?: 'primary' | 'secondary' | 'emerald';
}

export function Card({
    className,
    variant = 'default',
    gradientColor = 'primary',
    children,
    ...props
}: CardProps) {
    const variants = {
        default: 'bg-card text-card-foreground border border-border',
        glass: 'glassmorphism',
        gradient: `gradient-${gradientColor} text-white`,
    };

    return (
        <div
            className={cn(
                'rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl',
                'animate-fade-in',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}