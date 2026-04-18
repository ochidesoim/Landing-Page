"use client";

import { useEffect, useState } from "react";

function useCountUp(target: number | string, active: boolean, durationMs: number = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) { 
      const t = setTimeout(() => setValue(0), 0);
      return () => clearTimeout(t);
    }

    const numMatch = String(target).replace(/,/g, '').match(/[\d.]+/);
    if (!numMatch) { 
      const t = setTimeout(() => setValue(1), 0);
      return () => clearTimeout(t);
    }
    
    const targetNum = parseFloat(numMatch[0]);
    if (isNaN(targetNum)) return;

    let startTime: number | null = null;
    let rafId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      setValue(easeOutCubic(progress) * targetNum);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setValue(targetNum);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs, active]);

  if (typeof target === "string") {
    const numMatch = target.replace(/,/g, '').match(/[\d.]+/);
    if (numMatch) {
      const isInt = !target.includes(".");
      const formattedNum = isInt 
        ? Math.round(value).toLocaleString() 
        : value.toFixed(1);
      return target.replace(/[\d,.]+/, formattedNum);
    }
    return target;
  }
  return Math.round(value).toLocaleString();
}

function StatItem({ label, value, active }: { label: string, value: string, active: boolean }) {
  const displayValue = useCountUp(value, active);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "0 10px" }}>
      <div style={{ 
        fontSize: "9px", 
        color: "rgba(255, 107, 0, 0.6)", 
        letterSpacing: "0.15em", 
        textTransform: "uppercase",
        fontWeight: 400,
        fontFamily: "var(--font-mono)"
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: "15px", 
        color: "white", 
        fontWeight: 600,
        fontFamily: "var(--font-mono)"
      }}>
        {displayValue}
      </div>
    </div>
  );
}

export default function StatsHUD({ visible = false }: { visible?: boolean }) {
  const stats = [
    { label: "PART WEIGHT", value: "17,000 kg" },
    { label: "NODES", value: "34,000" },
    { label: "ELEMENTS", value: "4,250" },
    { label: "WALL THICKNESS", value: "4.250—" },
    { label: "CALIPER OFFSET", value: "54.5mm" },
    { label: "SAFETY FACTOR", value: "1.547—" },
    { label: "MAX VON MISES", value: "340.9 MPa" },
    { label: "ITERATIONS", value: "N: 23" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "rgba(10, 10, 11, 0.85)",
      borderTop: "1px solid rgba(255, 107, 0, 0.3)",
      padding: "16px 40px",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-mono)",
      pointerEvents: "none",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <StatItem label={stat.label} value={stat.value} active={visible} />
            {i < stats.length - 1 && (
              <div style={{ width: "1px", height: "30px", background: "rgba(255, 107, 0, 0.2)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
