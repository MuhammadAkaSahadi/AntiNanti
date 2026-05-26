"use client";

import * as React from "react";

const DialogContext = React.createContext<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>({});

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  
  const setIsOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  children,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  [key: string]: any;
}) {
  const { onOpenChange } = React.useContext(DialogContext);

  const handleClick = (e: React.MouseEvent) => {
    if (React.isValidElement(children)) {
      (children.props as any).onClick?.(e);
    }
    onOpenChange?.(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      ...props,
    });
  }

  return (
    <button type="button" onClick={() => onOpenChange?.(true)} {...props}>
      {children}
    </button>
  );
}

export function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 ${className || ""}`}
      onClick={() => onOpenChange?.(false)}
      {...props}
    />
  );
}

export function DialogContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`relative z-50 grid w-full max-w-md gap-4 border border-stone-200 bg-white p-6 shadow-xl rounded-2xl transition-all duration-300 dark:border-stone-800 dark:bg-stone-950 max-h-[90vh] overflow-y-auto ${className || ""}`}
          {...props}
        >
          {children}
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors focus:outline-none dark:hover:bg-stone-850"
            onClick={() => onOpenChange?.(false)}
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-left ${className || ""}`}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 ${className || ""}`}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-lg font-bold leading-none tracking-tight text-stone-900 dark:text-stone-50 ${className || ""}`}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-stone-500 dark:text-stone-400 ${className || ""}`}
      {...props}
    />
  );
}
