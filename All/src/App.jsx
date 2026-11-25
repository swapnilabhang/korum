import { useEffect, useLayoutEffect, useState } from "react";
import "./Switch.css";
import OP01 from "./OP-01.jsx";
import OP02 from "./OP-02.jsx";
import op01Css from "./OP-01.css?inline";
import op02Css from "./OP-02.css?inline";

/* Clean URLs:
   http://localhost:5173/OP-01/
   http://localhost:5173/OP-02/
   "/" defaults to /OP-01/ */
const PAGES = { 1: OP01, 2: OP02 };
const STYLES = { 1: op01Css, 2: op02Css };

const fromPath = () => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("op-02") || path.includes("op-2")) return 2;
  return 1;
};

export default function App() {
  const [op, setOp] = useState(fromPath);
  const Page = PAGES[op] || OP01;

  // Inject active design's CSS to prevent style conflicts
  useLayoutEffect(() => {
    let style = document.getElementById("op-active-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "op-active-style";
      document.head.appendChild(style);
    }
    style.textContent = STYLES[op] || "";
  }, [op]);

  useEffect(() => {
    if (!/OP-0[1-2]/i.test(window.location.pathname)) {
      window.history.replaceState(null, "", `/OP-0${op}/`);
    }
    const onPop = () => setOp(fromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [op]);

  const go = (e, n) => {
    e.preventDefault();
    window.history.pushState(null, "", `/OP-0${n}/`);
    setOp(n);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Page key={op} />
      <nav className="op-switch" aria-label="Preview option">
        <a
          href="/OP-01/"
          aria-current={op === 1 ? "page" : undefined}
          onClick={(e) => go(e, 1)}
        >
          OP-01
        </a>
        <a
          href="/OP-02/"
          aria-current={op === 2 ? "page" : undefined}
          onClick={(e) => go(e, 2)}
        >
          OP-02
        </a>
      </nav>
    </>
  );
}
