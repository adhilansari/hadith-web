export function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse-slow" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            </div>
        </div>
    );
}

export function LoadingCard() {
    return (
        <div className="animate-pulse">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="mt-4 h-4 bg-muted rounded w-3/4" />
            <div className="mt-2 h-4 bg-muted rounded w-1/2" />
        </div>
    );
}