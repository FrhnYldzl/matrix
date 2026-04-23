export function MatrixMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Outer hex */}
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Inner constellation */}
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      <circle cx="10" cy="11" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="22" cy="11" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="10" cy="21" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="22" cy="21" r="1.2" fill="currentColor" opacity="0.85" />
      {/* Lines */}
      <path
        d="M16 16L10 11M16 16L22 11M16 16L10 21M16 16L22 21"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.45"
      />
    </svg>
  );
}
