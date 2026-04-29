import { useEffect, useState } from "react";

const TARGET = new Date("2026-06-30T23:59:59").getTime();

export const useCountdown = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

export const Countdown = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const { days, hours, minutes, seconds } = useCountdown();
  const cellBase = variant === "dark"
    ? "bg-black/40 border-white/20 text-white"
    : "bg-white/95 text-cta-deep";
  const cells = [
    { v: days, l: "Ngày" },
    { v: hours, l: "Giờ" },
    { v: minutes, l: "Phút" },
    { v: seconds, l: "Giây" },
  ];
  return (
    <div className="flex justify-center gap-2 sm:gap-4 font-mono">
      {cells.map((c) => (
        <div key={c.l} className={`${cellBase} backdrop-blur-sm border rounded-2xl px-3 sm:px-6 py-3 sm:py-4 min-w-[64px] sm:min-w-[88px] text-center shadow-card`}>
          <div className="text-2xl sm:text-4xl font-bold tabular-nums">{String(c.v).padStart(2, "0")}</div>
          <div className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80 mt-1">{c.l}</div>
        </div>
      ))}
    </div>
  );
};
