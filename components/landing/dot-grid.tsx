export function DotGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="dot-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="currentColor" />
        </pattern>
        <radialGradient id="dot-grid-fade" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="dot-grid-mask">
          <rect width="100%" height="100%" fill="url(#dot-grid-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" mask="url(#dot-grid-mask)" />
    </svg>
  );
}
