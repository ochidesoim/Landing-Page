"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [glitchText, setGlitchText] = useState("VELOFORGE");

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    // Simple glitch effect when footer comes into view
    const handleGlitch = () => {
      const chars = "█▓▒░|/\\-_";
      const original = "VELOFORGE";
      let iterations = 0;
      const interval = setInterval(() => {
        setGlitchText(original.split("").map((char, index) => {
          if (index < iterations) return original[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join(""));
        iterations += 1/3;
        if (iterations > original.length) {
          clearInterval(interval);
          setGlitchText(original);
        }
      }, 40);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) handleGlitch();
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh",
        background: "#08080A",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px 60px 40px",
        borderTop: "1px solid rgba(232,232,232,0.05)",
      }}
    >
      {/* Top Section: CTA */}
      <div style={{ maxWidth: "800px" }}>
        <h2 style={{
          fontFamily: "'Bierika', sans-serif",
          fontSize: "clamp(40px, 5vw, 72px)",
          color: "white",
          lineHeight: 1.1,
          marginBottom: "32px",
          letterSpacing: "-0.02em"
        }}>
          Ready to Forge?<br />
          <span style={{ color: "#FF6B00" }}>Upload your specs.</span>
        </h2>
        
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <button style={{
            background: "#FF6B00",
            color: "#08080A",
            border: "none",
            padding: "16px 40px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textTransform: "uppercase"
          }}>
            INITIALIZE NEW SESSION
          </button>
          <button style={{
            background: "transparent",
            color: "#E8E8E8",
            border: "1px solid rgba(232,232,232,0.2)",
            padding: "16px 40px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            cursor: "pointer",
            textTransform: "uppercase"
          }}>
            CONTACT ENGINEERING
          </button>
        </div>
      </div>

      {/* Middle: Links/Info */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "40px",
        marginTop: "80px",
        borderTop: "1px solid rgba(232,232,232,0.05)",
        paddingTop: "40px"
      }}>
        <div>
          <h4 style={{ color: "#FF6B00", fontSize: "10px", letterSpacing: "0.2em", marginBottom: "20px" }}>CAPABILITIES</h4>
          <ul style={{ listSet: "none", padding: 0, color: "rgba(232,232,232,0.4)", fontSize: "12px", lineHeight: "2" }}>
            <li>Generative Topology</li>
            <li>Multi-Physics FEA</li>
            <li>Toolpath Optimization</li>
            <li>Isotropic Material Analysis</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: "#FF6B00", fontSize: "10px", letterSpacing: "0.2em", marginBottom: "20px" }}>ECOSYSTEM</h4>
          <ul style={{ listSet: "none", padding: 0, color: "rgba(232,232,232,0.4)", fontSize: "12px", lineHeight: "2" }}>
            <li>GitHub Repository</li>
            <li>Technical Docs</li>
            <li>API Reference</li>
            <li>Community Forge</li>
          </ul>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "rgba(232,232,232,0.2)", fontSize: "11px", marginBottom: "8px" }}>ESTABLISHED 2024</div>
          <div style={{ color: "#E8E8E8", fontSize: "14px", fontWeight: 600 }}>v0.4.2-ALPHA</div>
        </div>
      </div>

      {/* Bottom: Big Wordmark */}
      <div style={{
        marginTop: "120px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        opacity: 0.8
      }}>
        <div style={{
          fontFamily: "'Bierika', sans-serif",
          fontSize: "clamp(60px, 12vw, 180px)",
          letterSpacing: "0.02em",
          lineHeight: 0.8,
          color: "rgba(232,232,232,0.03)",
          userSelect: "none"
        }}>
          {glitchText}
        </div>
        
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "rgba(232,232,232,0.2)",
          letterSpacing: "0.1em",
          textAlign: "right",
          paddingBottom: "20px"
        }}>
          © VELOFORGE COMPUTATIONAL DYNAMICS.<br />
          ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
