'use client';

import * as React from 'react';
import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Modal Context
interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a Modal');
  }
  return context;
}

// Modal Root
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
        {/* Content wrapper */}
        <div className="relative z-10 w-full max-h-[90vh] overflow-y-auto mx-4 animate-in zoom-in-95 duration-200">
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

// Modal Content
interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function ModalContent({ children, className, size = 'md' }: ModalContentProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <div
      className={cn(
        'mx-auto bg-surface border border-border rounded-xl shadow-2xl',
        sizeClasses[size],
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

// Modal Header
interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function ModalHeader({ children, className, showCloseButton = true }: ModalHeaderProps) {
  const { onClose } = useModalContext();

  return (
    <div className={cn('flex items-center justify-between p-4 sm:p-6 border-b border-border', className)}>
      <div className="flex-1">{children}</div>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Modal Title
interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold text-foreground', className)}>
      {children}
    </h2>
  );
}

// Modal Description
interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn('mt-1 text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

// Modal Body
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('p-4 sm:p-6', className)}>
      {children}
    </div>
  );
}

// Modal Footer
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-border', className)}>
      {children}
    </div>
  );
}

// Confirmation Modal Hook
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function useConfirmModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
    setOptions(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
    setOptions(null);
  }, [resolveRef]);

  const ConfirmModal = useCallback(() => {
    if (!options) return null;

    const variantColors = {
      danger: 'bg-red-600 hover:bg-red-700',
      warning: 'bg-yellow-600 hover:bg-yellow-700',
      info: 'bg-primary-600 hover:bg-primary-700',
    };

    const variantIcons = {
      danger: '⚠️',
      warning: '⚡',
      info: 'ℹ️',
    };

    return (
      <Modal isOpen={isOpen} onClose={handleCancel}>
        <ModalContent size="sm">
          <ModalBody className="text-center pt-8">
            <div className="text-4xl mb-4">{variantIcons[options.variant || 'info']}</div>
            <ModalTitle className="text-center">{options.title}</ModalTitle>
            <p className="mt-2 text-muted-foreground">{options.message}</p>
          </ModalBody>
          <ModalFooter className="justify-center">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              {options.cancelText || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                variantColors[options.variant || 'info']
              )}
            >
              {options.confirmText || 'Confirm'}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }, [isOpen, options, handleConfirm, handleCancel]);

  return { confirm, ConfirmModal };
}

// Alert Modal Component
interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}: AlertModalProps) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const buttonColors = {
    success: 'bg-green-600 hover:bg-green-700',
    error: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-primary-600 hover:bg-primary-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent size="sm">
        <ModalBody className="text-center pt-8">
          <div className="text-4xl mb-4">{icons[type]}</div>
          <ModalTitle className="text-center">{title}</ModalTitle>
          <p className="mt-2 text-muted-foreground">{message}</p>
        </ModalBody>
        <ModalFooter className="justify-center">
          <button
            onClick={onClose}
            className={cn(
              'px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              buttonColors[type]
            )}
          >
            {buttonText}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
