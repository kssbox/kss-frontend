import { ComponentPropsWithRef, forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export type FloatingWindowProps = ComponentPropsWithRef<typeof Button> & {
  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
};

export const FloatingWindow = forwardRef<HTMLButtonElement, FloatingWindowProps>(
  ({ children, className, position, style, ...rest }, ref) => {
    // 默认位置：右下角
    const positionStyle = position || { bottom: 24, right: 24 };

    return (
      <Button
        ref={ref}
        size="sm"
        debounce={0}
        className={cn(
          "floating-window-root fixed z-50 size-14 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95",
          className,
        )}
        style={{ ...positionStyle, ...style }}
        {...rest}
      >
        {children}
      </Button>
    );
  },
);

FloatingWindow.displayName = "FloatingWindow";
