"use client";

import { animate, useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1500,
  suffix,
  className,
}: AnimatedNumberProps) {
  // Seed with the real value so SSR / first paint / no-JS render the true number
  // instead of flashing 0.00 (which reads as a dead/broken dashboard). Subsequent
  // value changes from live polling still animate.
  const [displayValue, setDisplayValue] = useState(value);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    damping: 28,
    stiffness: 180,
    mass: 0.8,
  });

  const effectiveDuration = useMemo(
    () => Math.max(1000, Math.min(2000, duration)),
    [duration]
  );

  useMotionValueEvent(springValue, "change", (latest) => {
    setDisplayValue(latest);
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: effectiveDuration / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, effectiveDuration, motionValue]);

  const display =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {display}
      {suffix && <span className="text-sm text-gray-500"> {suffix}</span>}
    </span>
  );
}
