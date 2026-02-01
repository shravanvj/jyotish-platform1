'use client';

import * as React from 'react';
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Dropdown Context
interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

// Dropdown Root
interface DropdownProps {
  children: React.ReactNode;
}

export function Dropdown({ children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

// Dropdown Trigger
interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className, asChild }: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: () => setIsOpen(!isOpen),
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={cn(
        'inline-flex items-center justify-center gap-2',
        className
      )}
    >
      {children}
    </button>
  );
}

// Dropdown Content
interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function DropdownContent({
  children,
  className,
  align = 'end',
  sideOffset = 4,
}: DropdownContentProps) {
  const { isOpen, setIsOpen, triggerRef } = useDropdownContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen, triggerRef]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen, triggerRef]);

  if (!isOpen) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 min-w-[180px] py-1',
        'bg-surface border border-border rounded-lg shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-100',
        alignClasses[align],
        className
      )}
      style={{ marginTop: sideOffset }}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
}

// Dropdown Item
interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
}

export function DropdownItem({
  children,
  className,
  onClick,
  disabled = false,
  destructive = false,
  icon,
}: DropdownItemProps) {
  const { setIsOpen } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
        'transition-colors focus:outline-none focus:bg-muted',
        destructive
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950'
          : 'text-foreground hover:bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// Dropdown Separator
interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return <div className={cn('h-px my-1 bg-border', className)} role="separator" />;
}

// Dropdown Label
interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <div className={cn('px-3 py-2 text-xs font-semibold text-muted-foreground uppercase', className)}>
      {children}
    </div>
  );
}

// Dropdown Checkbox Item
interface DropdownCheckboxItemProps {
  children: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function DropdownCheckboxItem({
  children,
  checked,
  onCheckedChange,
  className,
  disabled = false,
}: DropdownCheckboxItemProps) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
        'transition-colors focus:outline-none focus:bg-muted',
        'text-foreground hover:bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span className="w-4 h-4 flex items-center justify-center">
        {checked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-primary-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

// Context Menu (Right-click menu)
interface ContextMenuProps {
  children: React.ReactNode;
  menu: React.ReactNode;
}

export function ContextMenu({ children, menu }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = () => setIsOpen(false);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[180px] py-1 bg-surface border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
          style={{ left: position.x, top: position.y }}
          role="menu"
        >
          {menu}
        </div>
      )}
    </>
  );
}
