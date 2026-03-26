import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        "bg-[linear-gradient(135deg,#6d5fff_0%,#00e5cc_100%)] shadow-[0_0_30px_rgba(109,95,255,0.28)]",
        className
      )}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition-all duration-200",
        "hover:bg-white/[0.08] hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export { Button, buttonVariants, PrimaryButton, GhostButton };