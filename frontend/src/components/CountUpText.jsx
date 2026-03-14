import { useEffect, useRef, useState } from "react";

export default function CountUpText({
  from = 0,
  to = 0,
  duration = 1000,
  decimals = 0,
  className = "",
}) {
  const [value, setValue] = useState(from);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const diff = to - from;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const next = from + diff * progress;
      setValue(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [from, to, duration]);

  return (
    <span className={className}>
      {Number(value).toFixed(decimals)}
    </span>
  );
}