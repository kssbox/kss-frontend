import { type FC, useState } from "react";
import { XIcon, MessageCircleIcon } from "lucide-react";
import { FloatingWindow } from "./floating-window";
import { cn } from "../../lib/utils";

export type FloatingActionButtonProps = {
  variant?: "chat" | "close";
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  position?: { top?: number; bottom?: number; left?: number; right?: number };
};

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({
  variant: _variant,
  onToggle,
  className,
  position = { bottom: 24, right: 24 },
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const icon = isOpen ? (
    <XIcon className="size-6" />
  ) : (
    <MessageCircleIcon className="size-6" />
  );

  return (
    <FloatingWindow
      onClick={handleClick}
      className={cn("floating-action-button", className)}
      position={position}
    >
      {icon}
    </FloatingWindow>
  );
};
