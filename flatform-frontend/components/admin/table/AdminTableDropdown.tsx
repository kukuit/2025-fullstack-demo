"use client";

import React from "react";
import { createPortal } from "react-dom";

interface AdminTableDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  children: React.ReactNode;
}

export default function AdminTableDropdown({
  isOpen,
  onClose,
  triggerRef,
  children,
}: AdminTableDropdownProps) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Calculate position based on trigger button
  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight || 0;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Quyết định mở lên trên hay xuống dưới
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setPosition({
        top: openUpward ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left: rect.right - 150, // Align right edge, adjust width as needed
      });
    }
  }, [isOpen, triggerRef]);

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Không đóng nếu click vào trigger button hoặc dropdown content
      if (
        dropdownRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    // Sử dụng timeout để đảm bảo event click của button con được xử lý trước
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Close on scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current?.offsetHeight || 0;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpward =
          spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setPosition({
          top: openUpward ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
          left: rect.right - 150,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] flex flex-col gap-2 rounded border border-gray-200 bg-white p-2 shadow-xl min-w-[150px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
