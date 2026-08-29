import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let variantClasses = "";
    switch (variant) {
      case "default":
        variantClasses = "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/0.9]";
        break;
      case "destructive":
        variantClasses = "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))/0.9]";
        break;
      case "outline":
        variantClasses = "border border-[hsl(var(--input))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]";
        break;
      case "secondary":
        variantClasses = "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))/0.8]";
        break;
      case "ghost":
        variantClasses = "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]";
        break;
      case "link":
        variantClasses = "text-[hsl(var(--primary))] underline-offset-4 hover:underline";
        break;
    }

    let sizeClasses = "";
    switch (size) {
      case "default":
        sizeClasses = "h-10 px-4 py-2";
        break;
      case "sm":
        sizeClasses = "h-9 rounded-md px-3";
        break;
      case "lg":
        sizeClasses = "h-11 rounded-md px-8";
        break;
      case "icon":
        sizeClasses = "h-10 w-10";
        break;
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
