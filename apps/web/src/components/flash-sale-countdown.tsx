"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex size-9 items-center justify-center bg-[#1a1a1a] text-[16px] font-extrabold text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[9px] uppercase tracking-wide text-[#999]">
        {label}
      </span>
    </div>
  );
}

export function FlashSaleCountdown() {
  const [target] = useState(() => Date.now() + 1000 * 60 * 60 * 18);
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div className="flex items-end gap-1">
      <span className="mb-4 text-[11px] font-bold uppercase tracking-wide text-[#999]">
        Ends in:
      </span>
      <div className="flex items-start gap-1">
        <TimeUnit value={time.hours} label="hrs" />
        <span className="mb-3 text-[18px] font-bold text-[#ccc]">:</span>
        <TimeUnit value={time.minutes} label="mins" />
        <span className="mb-3 text-[18px] font-bold text-[#ccc]">:</span>
        <TimeUnit value={time.seconds} label="secs" />
      </div>
    </div>
  );
}
