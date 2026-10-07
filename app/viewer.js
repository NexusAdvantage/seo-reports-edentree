"use client";
import { useEffect, useRef, useState } from "react";

export default function Viewer({ src, label }) {
  const ref = useRef(null);
  const [h, setH] = useState(2300);
  useEffect(() => {
    const on = (ev) => {
      if (ev.source === ref.current?.contentWindow && ev.data && typeof ev.data.nxH === "number") setH(Math.ceil(ev.data.nxH) + 4);
    };
    window.addEventListener("message", on);
    ref.current?.contentWindow?.postMessage("nxSize", "*");
    return () => window.removeEventListener("message", on);
  }, []);
  return (
    <>
      <div className="bar">
        <button className="btn" onClick={() => ref.current?.contentWindow?.print()}>Download PDF</button>
        <a className="btn ghost" href={src} target="_blank" rel="noreferrer">Open full screen</a>
      </div>
      <div className="viewer">
        <iframe ref={ref} onLoad={() => ref.current?.contentWindow?.postMessage("nxSize", "*")} src={src} title={`${label} report`} style={{ height: h }} />
      </div>
    </>
  );
}
