import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  variant: {
    default: "bg-bg-interactive text-white hover:bg-bg-interactive",
    secondary: "border border-border-base bg-bg-base hover:bg-bg-subtle text-fg-subtle",
    ghost: "hover:bg-bg-subtle text-fg-subtle",
    outline: "border border-border-base bg-bg-base hover:bg-bg-subtle text-fg-subtle",
  },
  size: {
    default: "h-8 px-3 text-sm",
    small: "h-6 px-2 text-xs",
    icon: "h-8 w-8",
    iconSmall: "h-6 w-6",
  },
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-interactive disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

// Small button with icon - specialized component for toolbar buttons
export interface SmallButtonProps extends Omit<ButtonProps, 'size'> {
  icon?: React.ReactNode
  children?: React.ReactNode
}

const SmallButton = React.forwardRef<HTMLButtonElement, SmallButtonProps>(
  ({ className, variant = "secondary", icon, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size="small"
        className={cn(
          "gap-1",
          className
        )}
        {...props}
      >
        {icon}
        {children}
      </Button>
    )
  }
)

SmallButton.displayName = "SmallButton"

export { Button, SmallButton, buttonVariants } 