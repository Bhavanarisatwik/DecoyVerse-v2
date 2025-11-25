import * as React from "react"

import { cn } from "../../utils/cn"

const badgeVariants = {
    default: "border-transparent bg-accent/10 text-accent hover:bg-accent/20",
    secondary: "border-transparent bg-gray-700 text-gray-200 hover:bg-gray-600",
    destructive: "border-transparent bg-status-danger/10 text-status-danger hover:bg-status-danger/20",
    outline: "text-gray-200",
    success: "border-transparent bg-status-success/10 text-status-success hover:bg-status-success/20",
    warning: "border-transparent bg-status-warning/10 text-status-warning hover:bg-status-warning/20",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border border-themed px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
