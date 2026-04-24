'use client';

interface SidebarToggleButtonProps {
  className?: string;
  ariaLabel?: string;
}

export default function SidebarToggleButton({
  className = '',
  ariaLabel = 'Toggle sidebar',
}: SidebarToggleButtonProps) {
  function handleClick() {
    window.dispatchEvent(new CustomEvent('npch:toggle-sidebar'));
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`rounded-md p-2 text-slate-700 transition-colors hover:bg-slate-100 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}
