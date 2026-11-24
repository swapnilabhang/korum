import { useEffect, useLayoutEffect, useState } from "react";
import OP01 from "./OP-01.jsx";
import OP02 from "./OP-02.jsx";
import OP03 from "./OP-03.jsx";
import op01Css from "./OP-01.css?inline";
import op02Css from "./OP-02.css?inline";
import op03Css from "./OP-03.css?inline";

/* Each file has its own clean URL:
   http://localhost:5173/OP-01/   http://localhost:5173/OP-02/   http://localhost:5173/OP-03/
   "/" opens OP-01. */
const PAGES = { 1: OP01, 2: OP02, 3: OP03 };
const STYLES = { 1: op01Css, 2: op02Css, 3: op03Css };

const fromPath = () => {
  const m = window.location.pathname.match(/OP-0([1-3])/i);
  return m ? Number(m[1]) : 1;
};

export default function App() {
  const [op, setOp] = useState(fromPath);
  const Page = PAGES[op];

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
    if (!/OP-0[1-3]/i.test(window.location.pathname)) window.history.replaceState(null, "", `/OP-0${op}/`);
    const onPop = () => setOp(fromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return <Page key={op} />;
}
