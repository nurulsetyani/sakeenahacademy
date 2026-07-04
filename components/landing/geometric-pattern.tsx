// Motif bintang delapan (khatam) khas ornamen Islam, dipakai sebagai tekstur dekoratif
// beropasitas rendah — bukan ilustrasi literal, hanya penanda identitas visual.
export function GeometricPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="khatam" width="72" height="72" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M36 4 L48 24 L68 36 L48 48 L36 68 L24 48 L4 36 L24 24 Z" />
            <circle cx="36" cy="36" r="10" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#khatam)" />
    </svg>
  );
}
