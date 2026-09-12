export const Spinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`${sizeClasses[size]} rounded-full border-4 border-[rgba(201,151,43,0.18)] border-t-[var(--spice)] animate-spin`}
            />
        </div>
    );
};
