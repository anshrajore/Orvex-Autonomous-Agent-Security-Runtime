export function Mark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* Black & White Precision Geometric Shield */}
      <path
        d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 8V24M9.5 12.5H22.5M9.5 19.5H22.5"
        stroke="#FFFFFF"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <circle cx="16" cy="16" r="2" fill="#FFFFFF" />
    </svg>
  );
}
