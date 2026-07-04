export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">{title}</h1>
      <div className="card-surface mt-6 flex flex-col items-center gap-3 p-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M12 8v5l3 3M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
          </svg>
        </div>
        <p className="max-w-sm text-sm leading-[1.7] text-parchment-600">{description}</p>
      </div>
    </div>
  );
}
