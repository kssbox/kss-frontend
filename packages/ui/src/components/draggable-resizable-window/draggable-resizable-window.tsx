import React, { useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { cn } from "../../lib/utils";

type ResizeHandleConfig = boolean | {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
};

export interface DraggableResizableWindowProps {
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultPosition?: { x: number; y: number };
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableDrag?: boolean;
  enableResize?: ResizeHandleConfig;
  className?: string;
  zIndex?: number;
  onFocus?: () => void;
  onDragStart?: () => void;
  onDragStop?: (
    e: Event | MouseEvent | TouchEvent | undefined,
    data: { x: number; y: number }
  ) => void;
  onResizeStop?: (
    e: Event | MouseEvent | TouchEvent | undefined,
    direction: unknown,
    ref: { offsetWidth: number; offsetHeight: number },
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => void;
}

export function DraggableResizableWindow({
  children,
  defaultWidth = 375,
  defaultHeight = 600,
  defaultPosition,
  minWidth = 320,
  minHeight = 400,
  maxWidth = Infinity,
  maxHeight = Infinity,
  enableDrag = true,
  enableResize = true,
  className,
  zIndex = 50,
  onFocus,
  onDragStart,
  onDragStop,
  onResizeStop,
}: DraggableResizableWindowProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [pos, setPos] = useState(defaultPosition || { x: 100, y: 100 });

  useEffect(() => {
    setSize({ width: defaultWidth, height: defaultHeight });
  }, [defaultWidth, defaultHeight]);

  useEffect(() => {
    setPos(defaultPosition || { x: 100, y: 100 });
  }, [defaultPosition?.x, defaultPosition?.y]);

  const handleResizeStop = useCallback((...args: unknown[]) => {
    const [e, direction, ref, delta, position] = args as [
      Event | MouseEvent | TouchEvent | undefined,
      unknown,
      { offsetWidth: number; offsetHeight: number },
      { width: number; height: number },
      { x: number; y: number }
    ];
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    setPos(position);
    onResizeStop?.(e, direction, ref, delta, position);
  }, [onResizeStop]);

  const handleDragStop = useCallback((_e: unknown, d: { x: number; y: number }) => {
    setPos({ x: d.x, y: d.y });
    onDragStop?.(_e as Event, d);
  }, [onDragStop]);

  const handleDragStart = useCallback(() => {
    onFocus?.();
    onDragStart?.();
  }, [onFocus, onDragStart]);

  return (
    <Rnd
      size={size}
      position={pos}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onDragStart={handleDragStart}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      disableDragging={!enableDrag}
      enableResizing={enableResize === true ? {
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      } : enableResize}
      bounds="window"
      style={{
        zIndex,
      }}
      className={cn(className)}
    >
      {children}
    </Rnd>
  );
}
