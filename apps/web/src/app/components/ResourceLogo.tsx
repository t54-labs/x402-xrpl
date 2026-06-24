"use client";

import { useState } from "react";

// Per-resource logo on a light chip. Favicons (GitHub, npm, PyPI, xrpl.org,
// claw.credit, …) are designed for light backgrounds, so the tile is white —
// that keeps every mark readable and consistent on the dark cards. First-party
// t54 hosts use the brand wordmark; a dark monogram covers the rare failure.
export function ResourceLogo({ href, name }: { href: string; name: string }) {
  const [failed, setFailed] = useState(false);

  let host = "";
  try {
    host = new URL(href).hostname;
  } catch {
    /* leave host empty -> monogram */
  }
  const monogram = (name.match(/[A-Za-z0-9]/)?.[0] ?? "·").toUpperCase();
  const isT54 = /(^|\.)t54\.ai$/i.test(host);
  const src = isT54 ? "/logos/t54.svg" : `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  const useImg = host && !failed;

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[rgba(0,0,0,0.08)] bg-white">
      {useImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className={isT54 ? "h-auto w-[26px] object-contain" : "h-5 w-5 object-contain"}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-plek text-[13px] text-neutral-700">{monogram}</span>
      )}
    </span>
  );
}
