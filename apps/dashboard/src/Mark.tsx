export function Mark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3 28 10v12L16 29 4 22V10L16 3Z"
        stroke="#FF5A3C"
        strokeWidth="1.75"
      />
      <path d="M16 8v16M10 13.5h12M10 18.5h12" stroke="#FF5A3C" strokeWidth="1.5" />
    </svg>
  );
}
