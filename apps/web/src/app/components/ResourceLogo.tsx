"use client";

import { useState } from "react";

// Per-resource logo derived from the link's domain favicon (npm, GitHub, PyPI,
// xrpl.org, t54.ai, claw.credit, …). Falls back to a monogram tile when the
// host can't be parsed or the favicon fails to load — so every card gets a mark.
export function ResourceLogo({ href, name }: { href: string; name: string }) {
  const [failed, setFailed] = useState(false);

  let host = "";
  try {
    host = new URL(href).hostname;
  } catch {
    /* leave host empty -> monogram */
  }
  const monogram = (name.match(/[A-Za-z0-9]/)?.[0] ?? "·").toUpperCase();
  const useImg = host && !failed;
  // First-party t54 hosts have no per-subdomain favicon (Google returns a globe),
  // so use the local square t54 mark for any *.t54.ai resource.
  const isT54 = /(^|\.)t54\.ai$/i.test(host);
  const src = isT54 ? "/icon.png" : `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[rgba(255,255,255,0.05)]">
      {useImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-5 w-5 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-plek text-[13px] text-[var(--paper-mute)]">{monogram}</span>
      )}
    </span>
  );
}
