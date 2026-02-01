'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Tabs Context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs');
  }
  return context;
}

// Tabs Root
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = useCallback(
    (id: string) => {
      setInternalValue(id);
      onValueChange?.(id);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// Tabs List
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabsList({ children, className, variant = 'default' }: TabsListProps) {
  const variantClasses = {
    default: 'bg-muted p-1 rounded-lg',
    pills: 'gap-2',
    underline: 'border-b border-border gap-0',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        variantClasses[variant],
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

// Tab Trigger
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
  variant = 'default',
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  const baseClasses = 'px-4 py-2 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

  const variantClasses = {
    default: cn(
      'rounded-md',
      isActive
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground',
      disabled && 'opacity-50 cursor-not-allowed'
    ),
    pills: cn(
      'rounded-full border',
      isActive
        ? 'bg-primary-600 text-white border-primary-600'
        : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border',
      disabled && 'opacity-50 cursor-not-allowed'
    ),
    underline: cn(
      'pb-3 border-b-2 -mb-px',
      isActive
        ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
        : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground',
      disabled && 'opacity-50 cursor-not-allowed'
    ),
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </button>
  );
}

// Tab Content
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function TabsContent({
  value,
  children,
  className,
  forceMount = false,
}: TabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!forceMount && !isActive) return null;

  return (
    <div
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={cn(
        'mt-4 focus:outline-none',
        forceMount && !isActive && 'hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

// Vertical Tabs
interface VerticalTabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function VerticalTabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: VerticalTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = useCallback(
    (id: string) => {
      setInternalValue(id);
      onValueChange?.(id);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('flex gap-8', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// Vertical Tabs List
interface VerticalTabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function VerticalTabsList({ children, className }: VerticalTabsListProps) {
  return (
    <div
      className={cn('flex flex-col gap-1 min-w-[200px]', className)}
      role="tablist"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
}

// Vertical Tab Trigger
interface VerticalTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function VerticalTabsTrigger({
  value,
  children,
  className,
  disabled = false,
  icon,
}: VerticalTabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-left transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isActive
          ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border-l-4 border-primary-600'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// Vertical Tab Content
interface VerticalTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function VerticalTabsContent({
  value,
  children,
  className,
}: VerticalTabsContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={cn('flex-1 focus:outline-none', className)}
    >
      {children}
    </div>
  );
}
