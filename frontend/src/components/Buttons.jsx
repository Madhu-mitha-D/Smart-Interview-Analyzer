import * as React from "react";
import { cn } from "../lib/utils";

const baseClasses =
  "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50";

const primaryClasses =
  "border border-white/12 bg-white/8 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:bg-white/12";

const ghostClasses =
  "border border-white/10 bg-transparent text-white/75 hover:bg-white/6 hover:text-white";

const dangerClasses =
  "border border-white/10 bg-white/6 text-white hover:bg-white/10";

const iconClasses =
  "h-10 w-10 rounded-2xl border border-white/10 bg-white/6 text-white/75 hover:bg-white/10 hover:text-white p-0";

export function Button({
  children,
  className = "",
  onClick,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, primaryClasses, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export const PrimaryButton = React.forwardRef(
  (
    {
      children,
      className = "",
      loading = false,
      onClick,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        className={cn(baseClasses, primaryClasses, className)}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

export const GhostButton = React.forwardRef(
  (
    {
      children,
      className = "",
      onClick,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(baseClasses, ghostClasses, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GhostButton.displayName = "GhostButton";

export const IconButton = React.forwardRef(
  (
    {
      className = "",
      onClick,
      disabled = false,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(iconClasses, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export const DangerButton = React.forwardRef(
  (
    {
      children,
      className = "",
      onClick,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(baseClasses, dangerClasses, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DangerButton.displayName = "DangerButton";

export const PulseButton = React.forwardRef(
  (
    {
      children,
      className = "",
      pulsing = false,
      onClick,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative inline-flex">
        {pulsing && (
          <span className="absolute inset-0 rounded-2xl bg-white/8 blur-lg animate-pulse" />
        )}
        <button
          ref={ref}
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={cn(baseClasses, primaryClasses, "relative z-10", className)}
          {...props}
        >
          {children}
        </button>
      </div>
    );
  }
);

PulseButton.displayName = "PulseButton";