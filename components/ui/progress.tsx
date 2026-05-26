import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const percentage = Math.min(Math.max(value || 0, 0), 100);
    return (
      <div
        ref={ref}
        className={`relative h-2.5 w-full overflow-hidden rounded-full bg-stone-200/60 dark:bg-stone-800 ${className || ""}`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-emerald-800 transition-all duration-500 ease-in-out dark:bg-emerald-700"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
