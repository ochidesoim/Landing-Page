"use client";

import { useEffect, useRef, useState } from "react";

export default function AerospaceCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === "pointer" || 
        target.tagName.toLowerCase() === "button" || 
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") !== null ||
        target.closest("a") !== null
      );
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    let rafId: number;
    const render = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.12;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.12;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const ringScale = isClicked ? 1.8 : isHovering ? 1.5 : 1;
  const opacity = isHovering || isClicked ? 1 : 0.7;
  const bracketOffset = isHovering ? -2 : 0;

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div style={{ position: "relative" }}>
        {/* Outer Ring */}
        <div
          style={{
            position: "absolute",
            width: "32px",
            height: "32px",
            border: "1px solid #FF6B00",
            borderRadius: "50%",
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            opacity: opacity,
            transition: "transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.2s ease",
            boxSizing: "border-box"
          }}
        />

        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            background: "#FF6B00",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Inner crosshair lines */}
        <div style={{ position: "absolute", width: "1px", height: "6px", background: "#FF6B00", top: "-10px", left: "-0.5px" }} />
        <div style={{ position: "absolute", width: "1px", height: "6px", background: "#FF6B00", top: "4px", left: "-0.5px" }} />
        <div style={{ position: "absolute", width: "6px", height: "1px", background: "#FF6B00", top: "-0.5px", left: "-10px" }} />
        <div style={{ position: "absolute", width: "6px", height: "1px", background: "#FF6B00", top: "-0.5px", left: "4px" }} />

        {/* Targeting brackets */}
        <div style={{
          position: "absolute", top: `${-16 + bracketOffset}px`, left: `${-16 + bracketOffset}px`,
          width: "5px", height: "5px", borderTop: "1px solid #FF6B00", borderLeft: "1px solid #FF6B00",
          transition: "top 0.2s, left 0.2s", opacity: opacity
        }} />
        <div style={{
          position: "absolute", top: `${-16 + bracketOffset}px`, left: `${11 - bracketOffset}px`,
          width: "5px", height: "5px", borderTop: "1px solid #FF6B00", borderRight: "1px solid #FF6B00",
          transition: "top 0.2s, left 0.2s", opacity: opacity
        }} />
        <div style={{
          position: "absolute", top: `${11 - bracketOffset}px`, left: `${-16 + bracketOffset}px`,
          width: "5px", height: "5px", borderBottom: "1px solid #FF6B00", borderLeft: "1px solid #FF6B00",
          transition: "top 0.2s, left 0.2s", opacity: opacity
        }} />
        <div style={{
          position: "absolute", top: `${11 - bracketOffset}px`, left: `${11 - bracketOffset}px`,
          width: "5px", height: "5px", borderBottom: "1px solid #FF6B00", borderRight: "1px solid #FF6B00",
          transition: "top 0.2s, left 0.2s", opacity: opacity
        }} />
      </div>
    </div>
  );
}
