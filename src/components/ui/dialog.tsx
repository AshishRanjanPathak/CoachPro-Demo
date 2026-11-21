"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardViewport } from "@/hooks/useKeyboardViewport";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  onClose: () => void;
}>({
  onClose: () => {},
});

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const { isKeyboardVisible, keyboardHeight } = useKeyboardViewport();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onClose: () => onOpenChange(false) }}>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 keyboard-smooth-shift"
        style={{
          paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : undefined,
        }}
        onClick={() => onOpenChange(false)}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: isKeyboardVisible ? `calc(100dvh - ${keyboardHeight + 16}px)` : undefined,
          }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border-t sm:border border-border bg-card p-5 sm:p-6 shadow-2xl safe-area-pb animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        >
          {/* Native Mobile Bottom Sheet Pull Handle */}
          <div className="sm:hidden sheet-handle" aria-hidden="true" />
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { onClose } = React.useContext(DialogContext);
  return (
    <div className={cn("flex flex-col space-y-1.5 text-left relative", className)} {...props}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute right-0 top-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>
      {props.children}
    </div>
  );
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-foreground pr-8", className)} {...props} />
  );
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />
  );
}

export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4", className)} {...props} />
  );
}
