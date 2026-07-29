"use client";

import { useEffect, useState } from "react";
import { useT } from "@/app/components/useT";

function getRelativeTime(date: Date, t: (en: string) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) return t("just now");
  if (diffSec < 60) return t("{n}s ago").replace("{n}", String(diffSec));
  if (diffMin < 60) return t("{n}m ago").replace("{n}", String(diffMin));
  if (diffHour < 24) return t("{n}h ago").replace("{n}", String(diffHour));
  if (diffDay < 30) return t("{n}d ago").replace("{n}", String(diffDay));
  return date.toLocaleDateString();
}

export function RelativeTime({ date }: { date: string }) {
  const t = useT();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const text = getRelativeTime(new Date(date), t);

  return (
    <time dateTime={date} title={new Date(date).toLocaleString()} suppressHydrationWarning>
      {text}
    </time>
  );
}
