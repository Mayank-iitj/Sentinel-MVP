import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let variantClasses = "";
  switch (variant) {
    case "default":
      variantClasses = "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/0.8]";
      break;
    case "secondary":
      variantClasses = "border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))/0.8]";
      break;
    case "destructive":
      variantClasses = "border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))/0.8]";
      break;
    case "success":
      variantClasses = "border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))/0.8]";
      break;
    case "warning":
      variantClasses = "border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning))/0.8]";
      break;
    case "outline":
      variantClasses = "text-[hsl(var(--foreground))] border-[hsl(var(--border))]";
      break;
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 ${variantClasses} ${className}`}
      {...props}
    />
  )
}

export { Badge }
