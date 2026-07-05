"use client";

import { useState, type InputHTMLAttributes } from "react";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.88 4.24A10.6 10.6 0 0 1 12 4c6.5 0 10 7 10 7a15.6 15.6 0 0 1-3.06 4.2M6.6 6.6C4.13 8.1 2 11 2 11s3.5 7 10 7a10 10 0 0 0 3.4-.6" />
    </svg>
  );
}

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${props.className ?? ""} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-parchment-400 transition-colors hover:text-parchment-600 focus-visible:text-brand-700"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
