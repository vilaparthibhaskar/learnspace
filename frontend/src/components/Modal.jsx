import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children, width = 720, z = 3000 }) {
  if (!open) return null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: z }}>
      {/* Backdrop */}
      <div
        onClick={() => onClose?.()}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(2px)" }}
      />
      {/* Centered card */}
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div className="card shadow" style={{ width: "100%", maxWidth: width, borderRadius: 16, overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
