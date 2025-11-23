import * as React from "react"
import { cn } from "../../utils/cn"

// Since I don't have cva installed (it wasn't in the list, but it's good practice), 
// I'll implement a simpler version or just use clsx/tailwind-merge manually for now 
// to avoid adding more dependencies if not strictly needed, but cva is standard.
// Actually, I'll stick to manual cn for now to keep it simple as per instructions.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

        const variants = {
            primary: "bg-gold-500 text-black-900 hover:bg-gold-600 shadow-lg shadow-gold-500/20 border-transparent font-bold",
            secondary: "bg-gray-700 text-white hover:bg-gray-600 border-transparent",
            outline: "bg-transparent border-gray-600 text-gray-400 hover:border-gold-500 hover:text-gold-500 border",
            ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 border-transparent",
            danger: "bg-status-danger text-white hover:bg-red-600 shadow-lg shadow-red-500/20 border-transparent",
            success: "bg-status-success text-white hover:bg-green-600 shadow-lg shadow-green-500/20 border-transparent",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-6 text-lg",
            icon: "h-10 w-10 p-2 flex items-center justify-center",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : null}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
