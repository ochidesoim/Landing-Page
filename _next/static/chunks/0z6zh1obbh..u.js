(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,7612,e=>{"use strict";var t=e.i(35443),a=e.i(93708),r=e.i(50812),l=e.i(70042),n=e.i(38245),o=e.i(78072);function i({buildProgress:e}){let a=(0,l.useRef)(null),o=(0,l.useRef)(null),s=(0,l.useRef)(null),c=(0,l.useMemo)(()=>{let e=new n.Shape;return e.moveTo(0,0),e.lineTo(1.2,0),e.lineTo(1.2,.3),e.lineTo(.8,.3),e.lineTo(.8,1),e.lineTo(.5,1.4),e.lineTo(.2,1.4),e.lineTo(0,1.1),e.closePath(),new n.ExtrudeGeometry(e,{depth:.4,bevelEnabled:!0,bevelThickness:.02,bevelSize:.02,bevelSegments:2})},[]);(0,r.useFrame)((e,t)=>{a.current&&(a.current.rotation.y+=.3*t)}),(0,l.useEffect)(()=>{o.current&&(o.current.material.opacity=Math.min(1,1.5*e)),s.current&&(s.current.material.opacity=Math.max(0,(e-.5)*2))},[e]);let m=(0,l.useMemo)(()=>new n.EdgesGeometry(c),[c]);return(0,t.jsxs)("group",{ref:a,position:[0,0,0],children:[(0,t.jsxs)("lineSegments",{ref:o,children:[(0,t.jsx)("primitive",{object:m}),(0,t.jsx)("lineBasicMaterial",{color:"#00D4FF",transparent:!0,opacity:0,linewidth:1})]}),(0,t.jsx)("mesh",{ref:s,geometry:c,children:(0,t.jsx)("meshStandardMaterial",{color:"#E8E8E8",metalness:.9,roughness:.15,transparent:!0,opacity:0})})]})}let s=[{label:"AXLE_BORE_DIA",unit:"mm",target:17},{label:"CALIPER_OFFSET",unit:"mm",target:54.5},{label:"WALL_THICKNESS",unit:"mm",target:4.2},{label:"BOLT_PATTERN_R",unit:"mm",target:28},{label:"MATERIAL_YIELD",unit:"MPa",target:275},{label:"SAFETY_FACTOR",unit:"×",target:1.847},{label:"VON_MISES_PEAK",unit:"MPa",target:148.9},{label:"MASS",unit:"g",target:186.4}];function c({buildProgress:e}){let[a,r]=(0,l.useState)(s.map(()=>0));return(0,l.useEffect)(()=>{s.forEach((e,t)=>{let a={v:0};o.default.to(a,{v:e.target,delay:.35*t,duration:1.2,ease:"power2.out",onUpdate:()=>{r(e=>{let r=[...e];return r[t]=a.v,r})}})})},[]),(0,t.jsxs)("div",{className:"param-stream",children:[(0,t.jsx)("div",{className:"stream-header",children:(0,t.jsx)("span",{style:{color:"var(--color-cyan)",fontFamily:"IBM Plex Mono, monospace",fontSize:"0.65rem",letterSpacing:"0.1em"},children:"▶ PIPELINE RUNNING — FEA v2.1.0"})}),s.map((r,l)=>{let n=e>l/s.length;return(0,t.jsxs)("div",{className:"param-row",style:{opacity:n?1:.35},children:[(0,t.jsx)("span",{className:"param-label",children:r.label}),(0,t.jsx)("span",{className:"param-value",style:{color:n?"var(--color-accent)":"var(--color-cyan)"},children:a[l].toFixed("SAFETY_FACTOR"===r.label?3:1)}),(0,t.jsx)("span",{className:"param-unit",children:r.unit}),n&&(0,t.jsx)("span",{className:"param-locked",children:"✓"})]},r.label)}),(0,t.jsx)("style",{children:`
        .param-stream {
          font-family: 'IBM Plex Mono', monospace;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          border-right: 1px solid rgba(0,212,255,0.12);
        }
        .stream-header {
          margin-bottom: 1.2rem;
          padding-bottom: 0.8rem;
          border-bottom: 1px solid rgba(0,212,255,0.15);
        }
        .param-row {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 0.75rem;
          align-items: center;
          transition: opacity 0.4s ease;
          font-size: 0.72rem;
        }
        .param-label {
          color: rgba(232,232,232,0.5);
          letter-spacing: 0.05em;
        }
        .param-value {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          min-width: 60px;
          text-align: right;
          transition: color 0.3s;
        }
        .param-unit {
          color: rgba(232,232,232,0.3);
          font-size: 0.6rem;
          width: 30px;
        }
        .param-locked {
          color: #00D4FF;
          font-size: 0.65rem;
        }
      `})]})}e.s(["default",0,function(){let[e,r]=(0,l.useState)(0);return(0,l.useEffect)(()=>{let e={p:0};o.default.to(e,{p:1,duration:.35*s.length+1.5,ease:"none",onUpdate:()=>r(e.p)})},[]),(0,t.jsxs)("div",{style:{width:"100vw",height:"100vh",background:"#08080A",display:"grid",gridTemplateColumns:"400px 1fr",overflow:"hidden",fontFamily:"IBM Plex Mono, monospace"},children:[(0,t.jsx)("div",{style:{display:"flex",flexDirection:"column",justifyContent:"center"},children:(0,t.jsx)(c,{buildProgress:e})}),(0,t.jsxs)("div",{style:{position:"relative"},children:[(0,t.jsxs)(a.Canvas,{camera:{position:[0,.7,3.5],fov:45},gl:{antialias:!0,alpha:!1},style:{background:"#08080A"},dpr:[1,2],children:[(0,t.jsx)("ambientLight",{intensity:.1}),(0,t.jsx)("pointLight",{position:[3,3,3],intensity:2,color:"#00D4FF"}),(0,t.jsx)("pointLight",{position:[-2,-2,2],intensity:1,color:"#FF6B00"}),(0,t.jsx)(i,{buildProgress:e})]}),(0,t.jsxs)("div",{style:{position:"absolute",bottom:"2.5rem",left:"2rem",right:"2rem",pointerEvents:"none"},children:[(0,t.jsx)("p",{style:{color:"var(--color-cyan)",fontSize:"0.65rem",letterSpacing:"0.12em",marginBottom:"0.5rem",fontFamily:"IBM Plex Mono, monospace"},children:"COMPUTATIONAL ENGINEERING, REDEFINED"}),(0,t.jsxs)("h1",{style:{fontSize:"clamp(3rem, 6vw, 5rem)",fontWeight:700,color:"#E8E8E8",letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:.9,fontFamily:"IBM Plex Mono, monospace"},children:["VELO",(0,t.jsx)("br",{}),(0,t.jsx)("span",{style:{color:"var(--color-accent)"},children:"FORGE"})]})]})]})]})}])}]);