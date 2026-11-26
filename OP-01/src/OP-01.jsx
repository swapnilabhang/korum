import { useEffect, useRef, useState } from "react";
/* Styles loaded dynamically in App.jsx per active page to prevent cross-page CSS conflicts */
import logoLight from "./assets/logo.png"; /* white text: for dark backgrounds (hero, footer) */
import logoDark from "./assets/logo-dark.png"; /* blue text: for the light solid nav */

/* Free Unsplash photos (mall interiors, dining, fashion). Replace any ID or URL with your own.
   Local images: put them in /public and use "/name.jpg". */
const u = (id, w = 1600) => `https://unsplash.com/photos/${id}/download?force=true&w=${w}&q=80`;
const IMG = {
  hero: u("X0yKdR_F9rM", 2000),
  discover: u("fxCvuwRiltc", 1400),
  dining: "/dining.jpg",
  diningInset: u("m7IpcYOx8hM", 900),
  event: u("Qzcby2EMkTU", 1400),
  brands: ["/fashion.jpg", "qnKhZJPKFD8", "Bn2cAE13daA", "LxgOZ6n5-4g", "MHN96iFvKIU", "E4B_hlQ9JSY"].map((id) => id.startsWith("/") ? id : u(id, 1000)),
  gallery: ["QUNNr7U30K8", "nNR_w0ifl1M", "i0BErr5RXNc", "/walkway.jpg", "Xtl8rQMu1y8"].map((id) => id.startsWith("/") ? id : u(id, 1400)),
};

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

const Reveal = ({ as: T = "div", className = "", children, ...p }) => {
  const ref = useReveal();
  return <T ref={ref} className={`rv ${className}`} {...p}>{children}</T>;
};

/* Spare photos. If a photo fails to load, Pic swaps in the next one of these instead of showing a plain gradient. */
const SPARE = ["1HVfpQsXiME", "Xqd2Hu4gSVM", "WmifRRdOqec", "Ogba8_RgkDQ", "hMMbIptXPjI", "Bn2cAE13daA"].map((id) => u(id, 1400)).concat([IMG.discover, IMG.event, IMG.hero]);
const Pic = ({ src, tone = "a", className = "", label = "", style }) => {
  const [cur, setCur] = useState(src);
  useEffect(() => {
    setCur(src);
    if (!src || !/^https?:/.test(src)) return;
    let alive = true, tries = 0, start = [...src].reduce((h, c) => h + c.charCodeAt(0), 0);
    const test = (url) => {
      const im = new Image();
      im.onerror = () => { if (alive && tries < SPARE.length) { const next = SPARE[(start + tries++) % SPARE.length]; setCur(next); test(next); } };
      im.src = url;
    };
    test(src);
    return () => { alive = false; };
  }, [src]);
  return (
    <div className={`pic t-${tone} ${className}`} role="img" aria-label={label}
      style={{ ...style, ...(cur ? { "--i": `url(${cur})` } : {}) }} />
  );
};

const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    const f = () => setY(window.scrollY);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return y;
};

const links = ["Discover", "Shopping", "Brands", "Dining", "Entertainment", "Events", "Visit Us"];
const id = (s) => s.toLowerCase().replace(" ", "");

function Nav({ y }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={`nav ${y > 60 ? "solid" : ""}`}>
      <a href="#top" className="logo" aria-label="Korum Mall home"><img src={y > 60 ? logoDark : logoLight} alt="Korum" width="340" height="80" /></a>
      <nav aria-label="Primary" className={open ? "open" : ""}>
        {links.map((l) => <a key={l} href={`#${id(l)}`} onClick={() => setOpen(false)}>{l}</a>)}
      </nav>
      <div className="nav-tools">
        <button aria-label="Search" className="ico">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        </button>
        <button aria-label="Menu" aria-expanded={open} className="ico burger" onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}


/* Banner 2 (slides): full-screen slideshow, one slide per part of the mall. Auto-plays, click a tab to jump. */
const SLIDES = [
  { k: "Shopping", t: "Fashion, beauty and gifts", p: "Over 240 stores across four levels.", img: IMG.hero, tone: "hero", href: "#shopping" },
  { k: "Dining", t: "Tables worth the detour", p: "Restaurants, cafes and a food court with a view.", img: IMG.dining, tone: "a", href: "#dining" },
  { k: "Entertainment", t: "Cinema, games and more", p: "A whole weekend without leaving the building.", img: IMG.brands[5], tone: "e", href: "#entertainment" },
  { k: "Events", t: "Glass Lantern Festival", p: "06 Dec, Atrium, all week.", img: IMG.event, tone: "c", href: "#events" },
];
function HeroSlides() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearTimeout(t);
  }, [i]);
  const s = SLIDES[i];
  return (
    <section id="top" className="hl">
      {SLIDES.map((x, n) => <div key={x.k} className={`hl-bg ${n === i ? "on" : ""}`}><Pic src={x.img} tone={x.tone} label={x.k} /></div>)}
      <div className="hl-copy" key={i}>
        <small>{String(i + 1).padStart(2, "0")} · {s.k}</small>
        <h1>{s.t}</h1>
        <p>{s.p}</p>
        <a className="cta" href={s.href}>Explore {s.k}</a>
      </div>
      <div className="hl-tabs" role="tablist">
        {SLIDES.map((x, n) => (
          <button key={x.k} role="tab" aria-selected={n === i} className={n === i ? "on" : ""} onClick={() => setI(n)}>
            <span>{String(n + 1).padStart(2, "0")}</span>{x.k}{n === i && <u key={i} />}
          </button>
        ))}
      </div>
    </section>
  );
}

function Hero() {
  return <HeroSlides />;
}

function Discover() {
  return (
    <section id="discover" className="discover">
      <Reveal className="d-img"><Pic src={IMG.discover} tone="b" label="Atrium with skylight" /></Reveal>
      <Reveal as="h2" className="d-head">A building that behaves like a city square</Reveal>
      <Reveal className="d-text">
        <p>Korum Mall was drawn around daylight. Walkways open to a glass-roofed atrium, shops spill into garden terraces, and every level ends in a place to sit.</p>
        <p className="meta">Thane, Maharashtra. Four levels. 240+ stores.</p>
        <a href="#shopping" className="link">Explore more</a>
      </Reveal>
    </section>
  );
}

const SHOP = [
  { c: "Fashion", t: "a", names: ["Maison Verre", "Nila Studio", "Thread & Co"], line: "Runway-ready labels across Levels 1 and 2." },
  { c: "Luxury", t: "c", names: ["Oro & Lane", "Atelier Noor", "Vesper"], line: "Jewellery, watches and couture on Level 3." },
  { c: "Beauty", t: "d", names: ["Petale", "Glow Lab", "Ambre"], line: "Skincare bars, fragrance and salon on Level 1." },
  { c: "Lifestyle", t: "b", names: ["Kinfolk Home", "Terra", "Slow Studio"], line: "Home, books and gifts for slower days." },
  { c: "Accessories", t: "e", names: ["Stitch Atelier", "Lumen Watches", "Kaya Bags"], line: "Bags, shoes and eyewear on Level 2." },
  { c: "Electronics", t: "f", names: ["Volt Lab", "Sono", "Pixel Point"], line: "Phones, audio and gaming on Level 2." },
];


/* Option 3: showcase. Category tabs, one big photo, brand list beside it. */
function ShopShowcase({ a, setA }) {
  const x = SHOP[a];
  return (
    <div className="sc">
      <div className="sc-tabs" role="tablist" aria-label="Categories">
        {SHOP.map((y, i) => (
          <button key={y.c} role="tab" aria-selected={a === i} className={a === i ? "on" : ""} onClick={() => setA(i)}>{y.c}</button>
        ))}
      </div>
      <div className="sc-img" key={a}><Pic src={IMG.brands[a]} tone={x.t} label={x.c} /></div>
      <div className="sc-info" key={`i${a}`}>
        <h3>{x.c}</h3>
        <p>{x.line}</p>
        <ul>{x.names.map((n) => <li key={n}>{n}</li>)}</ul>
        <a className="link" href="#shopping">Explore {x.c}</a>
      </div>
    </div>
  );
}




function Shopping() {
  const [a, setA] = useState(0);
  return (
    <section id="shopping" className="shop v3">
      <Reveal as="h2" className="sec-title">Shopping</Reveal>
      <ShopShowcase a={a} setA={setA} />
    </section>
  );
}

const DIN = [
  { n: "Sorrel", d: "Wood-fired Mediterranean", dish: "Charred octopus, smoked paprika", lv: "Level 3", seats: 64, open: "12 pm to 11:30 pm", t: "g", img: IMG.dining },
  { n: "Chai Street", d: "Single-estate teas and small plates", dish: "Kadak chai with bun maska", lv: "Level 1", seats: 40, open: "8 am to 10 pm", t: "h", img: IMG.diningInset },
  { n: "Ember", d: "Omakase counter, twelve seats", dish: "Twelve-course chef's counter", lv: "Level 4", seats: 12, open: "7 pm to 11 pm", t: "e", img: IMG.gallery[2] },
  { n: "Dough Theory", d: "Sourdough pizza and gelato", dish: "Burrata pie, pistachio gelato", lv: "Level 2", seats: 80, open: "11 am to 11 pm", t: "c", img: IMG.gallery[3] },
  { n: "Midnight Dhaba", d: "Charcoal grills, open till late", dish: "Smoked paneer tikka, butter naan", lv: "Rooftop", seats: 56, open: "6 pm to 12 am", t: "d", img: IMG.gallery[0] },
];

/* Dining 3: tilted polaroids that straighten up on hover. */
function DinPolaroid() {
  return (
    <div className="dp">
      {DIN.map((x, i) => (
        <figure key={x.n} tabIndex={0} className={`dp-c dp${i}`}>
          <div className="dp-p"><Pic src={x.img} tone={x.t} label={x.n} /></div>
          <figcaption><b>{x.n}</b><span>{x.d}</span></figcaption>
        </figure>
      ))}
    </div>
  );
}


const NEON = ["#ff7a1a", "#5ad1ff", "#ff5ea8", "#a6ff5a", "#ffd84a"];


const FLOORS = [4, 2, 0, 3, 1];

function Dining() {
  return (
    <section id="dining" className="dn dn3">
      <Reveal as="h2" className="dn-head">Tables worth<br />the detour</Reveal>
      <DinPolaroid />
    </section>
  );
}

const ENT = [
  { n: "Cinema", d: "IMAX and recliner screens", hrs: "10 am to 1 am", img: "/ent/cinema.jpg", t: "g", st: [70, 95, 60] },
  { n: "Gaming", d: "VR arena, 80 arcade cabinets", hrs: "11 am to 11 pm", img: "/ent/gaming.jpg", t: "e", st: [95, 40, 80] },
  { n: "Family", d: "Indoor garden and play lawn", hrs: "10 am to 8 pm", img: "/ent/family.jpg", t: "d", st: [45, 90, 70] },
  { n: "Kids", d: "Clay studio and story hour", hrs: "10 am to 7 pm", img: "/ent/kids.jpg", t: "c", st: [50, 80, 55] },
  { n: "Weekends", d: "Night markets and live sets", hrs: "Fri to Sun, 6 pm", img: "/ent/weekends.jpg", t: "h", st: [75, 60, 98] },
];

/* Entertainment 2: arcade character select with stat bars. */
function EntRoster() {
  const [a, setA] = useState(1);
  const x = ENT[a];
  return (
    <div className="er">
      <div className="er-grid">
        {ENT.map((y, i) => (
          <button key={y.n} className={a === i ? "on" : ""} onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)}><Pic src={y.img} tone={y.t} label={y.n} /><span>{y.n}</span></button>
        ))}
      </div>
      <div className="er-panel" key={a}>
        <div className="er-info"><small>PLAYER 1 SELECT</small><h3>{x.n}</h3><p>{x.d}</p></div>
        <div className="er-bars">{["Thrill", "Chill", "Crowd"].map((l, k) => <label key={l}><span>{l}</span><b>{x.st[k]}%</b><i style={{ "--v": `${x.st[k]}%` }} /></label>)}</div>
      </div>
    </div>
  );
}


const FCOL = ["#f28c28", "#6dbe45", "#8fd0f5", "#f9c99a", "#fde6cf"];

function Fun() {
  return (
    <section id="entertainment" className="en en2">
      <Reveal as="h2" className="sec-title light">Entertainment</Reveal>
      <EntRoster />
    </section>
  );
}

/* Brands: photo cards (layout 7) built from the Shopping data. */
/* Images and logos: placeholders until you add real ones.
   To use real files, add an entry here, e.g. "Maison Verre": { logo: "/logos/maison.svg", img: "/brands/maison.jpg" } */
const BRAND_MEDIA = {};
const IMG_POOL = [...IMG.brands, ...IMG.gallery, IMG.discover, IMG.event, IMG.dining];
const ALLB = SHOP.flatMap((x) => x.names.map((n) => ({ n, c: x.c, t: x.t, line: x.line }))).map((b, i) => ({
  ...b, i, img: IMG_POOL[i % IMG_POOL.length], ...BRAND_MEDIA[b.n],
}));
const LOGO_C = ["#0b4f8a", "#f28c28", "#1e8bc3", "#2c7a3f", "#0b2239", "#c85a0c"];

/* Generated monogram logo. Uses b.logo (image URL) when you provide one. */
function BrandLogo({ b, size = 56, light = false }) {
  if (b.logo) return <img className="bl" src={b.logo} alt={`${b.n} logo`} width={size} height={size} style={{ objectFit: "contain" }} />;
  const k = b.i % 5, col = LOGO_C[b.i % LOGO_C.length];
  const words = b.n.replace("&", " ").split(/\s+/).filter(Boolean);
  const ini = (words.length > 1 ? words[0][0] + words[1][0] : b.n.slice(0, 2)).toUpperCase();
  const bg = light ? "#fff" : col, fg = light ? col : "#fff";
  const shape = [
    <circle key="s" cx="32" cy="32" r="30" />,
    <rect key="s" x="4" y="4" width="56" height="56" rx="14" />,
    <polygon key="s" points="32,3 59,18 59,46 32,61 5,46 5,18" />,
    <rect key="s" x="10" y="10" width="44" height="44" rx="4" transform="rotate(45 32 32)" />,
    <path key="s" d="M8 6h48v30c0 14-14 22-24 24C22 58 8 50 8 36z" />,
  ][k];
  return (
    <svg className="bl" viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={`${b.n} logo`}>
      <g style={{ fill: bg }}>{shape}</g>
      <text x="32" y={k === 4 ? 34 : 39} textAnchor="middle" style={{ fill: fg, font: "700 22px Sora, system-ui, sans-serif", letterSpacing: "-1px" }}>{ini}</text>
    </svg>
  );
}


/* 7 Photo cards: store photo, logo badge, name. */
function BrandPhotos({ list }) {
  return (
    <div className="bp">
      {list.map((b) => (
        <a href="#shopping" key={b.n} className="bp-c">
          <Pic src={b.img} tone={b.t} label={b.n} />
          <div className="bp-o"><BrandLogo b={b} size={48} light /><div><b>{b.n}</b><small>{b.c}</small></div></div>
        </a>
      ))}
    </div>
  );
}


function Brands() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? ALLB : ALLB.filter((b) => b.c === cat);
  return (
    <section id="brands" className="brands br7">
      <Reveal as="h2" className="sec-title">Brands</Reveal>
      <p className="br-sub">{ALLB.length}+ names under one roof. Find your favourites.</p>
      <div className="br-cats" role="group" aria-label="Filter brands">
        {["All", ...SHOP.map((x) => x.c)].map((c) => (
          <button key={c} aria-pressed={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
            {c}<em>{c === "All" ? ALLB.length : ALLB.filter((b) => b.c === c).length}</em>
          </button>
        ))}
      </div>
      <BrandPhotos key={cat} list={list} />
    </section>
  );
}

const evs = [["06", "Dec", "Glass Lantern Festival", "Atrium, all week", "a", IMG.event], ["14", "Dec", "Winter Fashion Week", "Level 2", "c", IMG.brands[0]], ["21", "Dec", "Orchestra under the Skylight", "7 pm", "e", IMG.gallery[1]], ["31", "Dec", "New Year Countdown", "Rooftop", "f", IMG.gallery[3]]];
/* Hover (or focus, or tap) an event on the right and the big card on the left swaps image, date and text. */
function Events() {
  const [a, setA] = useState(0);
  const f = evs[a];
  return (
    <section id="events" className="events">
      <Reveal className="ev-feat">
        {evs.map((e, i) => (
          <div key={e[2]} className={`ev-bg ${i === a ? "on" : ""}`}><Pic src={e[5]} tone={e[4]} label={e[2]} /></div>
        ))}
        <div className="date" key={`d${a}`}><b>{f[0]}</b>{f[1]}</div>
        <h3 key={`h${a}`}>{f[2]}</h3><p key={`p${a}`}>{f[3]}</p>
      </Reveal>
      <div className="ev-side" onMouseLeave={() => setA(0)}>
        {evs.map(([d, m, t, w], i) => (
          <a href="#events" key={t} className={`ev-row r${i} ${i === a ? "on" : ""}`}
            onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)}>
            <span className="d">{d} {m}</span><span className="t">{t}</span><em>{w}</em>
          </a>
        ))}
        <a className="link" href="#events">View all events</a>
      </div>
    </section>
  );
}

/* Offers: poster layout. Offer text is taken from the existing banner, Visit us and the ribbon. */
const OFFERS = [
  { pre: "", n: "30%", u: "off", t: "Season of 30% off", p: "Quiet luxury markdowns on Level 1.", d: "Through 31 January", tone: "a" },
  { pre: "", n: "Free", u: "valet", t: "Free valet", p: "With every ₹5,000 spend.", d: "Through 31 January", tone: "e" },
  { pre: "Up to", n: "50%", u: "off", t: "Winter Edit", p: "Markdowns across the mall.", d: "Limited time", tone: "c" },
  { pre: "First", n: "2 hrs", u: "free", t: "Free parking", p: "On B1 and B2, every day.", d: "All year", tone: "f" },
];
const RIBBON = "Winter Edit  ·  Up to 50% off  ·  ";
const Ribbon = () => <div className="marq" aria-hidden="true"><div>{Array(6).fill(RIBBON).join("")}</div></div>;

/* 2 Poster: giant figure, spinning badge and a live countdown to 31 January. */
function useCountdown() {
  const end = () => { const n = new Date(); let e = new Date(n.getFullYear(), 0, 31, 23, 59, 59); if (e < n) e = new Date(n.getFullYear() + 1, 0, 31, 23, 59, 59); return e; };
  const calc = () => { const t = Math.max(0, end() - new Date()); return [Math.floor(t / 864e5), Math.floor(t / 36e5) % 24, Math.floor(t / 6e4) % 60, Math.floor(t / 1e3) % 60]; };
  const [v, setV] = useState(calc);
  useEffect(() => { const i = setInterval(() => setV(calc()), 1000); return () => clearInterval(i); }, []);
  return v;
}
function OffersPoster() {
  const v = useCountdown();
  return (
    <section className="offers of2" aria-label="Offers">
      <Ribbon />
      <div className="op">
        <div className="op-l">
          <svg className="op-badge" viewBox="0 0 200 200" aria-hidden="true">
            <defs><path id="oc" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
            <text><textPath href="#oc">WINTER EDIT · UP TO 50% OFF · WINTER EDIT · UP TO 50% OFF ·</textPath></text>
          </svg>
          <b>30<i>%</i></b><span>off</span>
        </div>
        <div className="op-r">
          <small>Offer ends 31 January</small>
          <h2>Season of 30% off</h2>
          <p>Quiet luxury markdowns on Level 1. Free valet with every ₹5,000 spend.</p>
          <div className="op-cd" role="timer">
            {["Days", "Hrs", "Min", "Sec"].map((l, i) => <div key={l}><b>{String(v[i]).padStart(2, "0")}</b><small>{l}</small></div>)}
          </div>
          <a className="cta hs-cta" href="#shopping">Shop the sale</a>
        </div>
      </div>
    </section>
  );
}



function Offers() {
  return <OffersPoster />;
}

const GAL = [
  { c: "Atrium at noon", d: "Daylight pours through the glass roof.", t: "b" },
  { c: "Garden terrace", d: "Shops spill out into green corners.", t: "a" },
  { c: "Dining hall", d: "Long tables, warm light, open kitchens.", t: "g" },
  { c: "Level 2 walkway", d: "Glass railings and a view of every floor.", t: "c" },
  { c: "Rooftop evening", d: "Live sets as the city lights come on.", t: "e" },
];

/* Gallery 2: mosaic with a full-screen lightbox (arrows, Esc and tap to close). */
function GalLight() {
  const [o, setO] = useState(-1);
  const n = GAL.length;
  useEffect(() => {
    if (o < 0) return;
    const k = (e) => {
      if (e.key === "Escape") setO(-1);
      if (e.key === "ArrowRight") setO((v) => (v + 1) % n);
      if (e.key === "ArrowLeft") setO((v) => (v + n - 1) % n);
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [o, n]);
  return (
    <>
      <div className="gx">
        {GAL.map((x, i) => (
          <button key={x.c} className={`gx-t gx${i}`} onClick={() => setO(i)} aria-label={`Open ${x.c}`}><Pic src={IMG.gallery[i]} tone={x.t} label={x.c} /><span>{x.c}</span></button>
        ))}
      </div>
      {o >= 0 && (
        <div className="gx-lb" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setO(-1)}>
          <div className="gx-img" key={o} onClick={(e) => e.stopPropagation()}><Pic src={IMG.gallery[o]} tone={GAL[o].t} label={GAL[o].c} /></div>
          <p>{GAL[o].c}, {o + 1} of {n}</p>
          <button className="gx-x" aria-label="Close" onClick={() => setO(-1)}>&times;</button>
          <button className="gx-p" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setO((o + n - 1) % n); }}>&larr;</button>
          <button className="gx-n" aria-label="Next" onClick={(e) => { e.stopPropagation(); setO((o + 1) % n); }}>&rarr;</button>
        </div>
      )}
    </>
  );
}



function Gallery() {
  return (
    <section className="gal gal2" aria-label="Gallery">
      <Reveal as="h2" className="sec-title">Moments at Korum</Reveal>
      <GalLight />
    </section>
  );
}

const MAP = (
  <div className="map">
    <iframe title="Korum Mall on Google Maps" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.8258299617873!2d72.96280487583986!3d19.20280814797766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b91422173053%3A0xcd2921136e9c8b14!2sKorum%20Mall!5e0!3m2!1sen!2sin!4v1795513198713!5m2!1sen!2sin"
      width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
  </div>
);
const INFO = {
  hours: "Daily 10 am to 11 pm. Dining until midnight.",
  parking: "3,000 bays across B1 and B2. First 2 hours free.",
  getting: "Easy by bus, auto and cab. Ride-share bay at Gate 3.",
  mail: "hello@korummall.example", tel: "+91 22 5555 0100",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* 1 Boarding pass: the visit details printed on a ticket with a perforated stub. */
function VisitPass() {
  return (
    <>
      <Reveal as="h2" className="sec-title">Visit us</Reveal>
      <div className="vp">
        <div className="vp-main">
          <small>ADMIT ONE · EVERY DAY</small>
          <div className="vp-route"><b>HOME</b><span>→</span><b>KORUM</b></div>
          <dl className="vp-grid">
            <div><dt>Hours</dt><dd>{INFO.hours}</dd></div>
            <div><dt>Parking</dt><dd>{INFO.parking}</dd></div>
            <div><dt>Gate</dt><dd>{INFO.getting}</dd></div>
          </dl>
        </div>
        <div className="vp-stub">
          <small>CONTACT</small>
          <p>{INFO.mail}</p><p>{INFO.tel}</p>
          <a className="cta" href="#visitus">Get directions</a>
        </div>
      </div>
      {MAP}
    </>
  );
}





function Visit() {
  return (
    <section id="visitus" className="visit vi1">
      <VisitPass />
    </section>
  );
}

const FI = {
  phone: <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />,
  mail: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.5 2L12 12.5 19.5 7z" />,
  pin: <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />,
  fb: <path d="M14 8V6.5c0-.7.2-1 1.2-1H17V2h-2.6C11.4 2 10 3.7 10 6v2H8v3.5h2V22h4V11.5h2.7L17 8z" />,
  x: <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.2 21H2l7.3-8.3L1.7 3H8l4.4 5.8zm-1.1 16.2h1.7L7.3 4.7H5.5z" />,
  ig: <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.3 6a1.1 1.1 0 1 1-1.1 1.1A1.1 1.1 0 0 1 17.3 6z" />,
  yt: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15V9l5.2 3z" />,
};
const Ico = ({ d }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">{FI[d]}</svg>;

function Footer() {
  const [ok, setOk] = useState(false);
  return (
    <footer className="foot">
      <div className="ft">
        <div className="ft-brand">
          <a className="logo" href="#top" aria-label="Korum Mall home"><img src={logoLight} alt="Korum" width="340" height="80" /></a>
          <p>Korum Mall was drawn around daylight. Walkways open to a glass-roofed atrium, shops spill into garden terraces, and every level ends in a place to sit.</p>
          <form onSubmit={(e) => { e.preventDefault(); setOk(true); }}>
            <label htmlFor="em">Weekly events by email</label>
            <div><input id="em" type="email" required placeholder="you@email.com" /><button>{ok ? "Subscribed" : "Subscribe"}</button></div>
          </form>
        </div>
        <div className="ft-col">
          <h4><b>MALL</b> TIMINGS</h4>
          <h5>All Stores</h5>
          <p>Monday - Sunday 10:00 am - 11:00 pm</p>
          <h5>Food and Beverages</h5>
          <p>Monday - Sunday 10:00 am - 12:00 midnight</p>
          <h5>Parking</h5>
          <p>Open 24 hours. First 2 hours free.</p>
        </div>
        <div className="ft-col">
          <h4><b>MALL</b> CONNECT</h4>
          <div className="ft-card"><Ico d="phone" /><div><h5>Phone Number</h5><p><a href="tel:+912255550100">+91 22 5555 0100</a></p></div></div>
          <div className="ft-card"><Ico d="mail" /><div><h5>Email</h5><p><a href="mailto:hello@korummall.example">hello@korummall.example</a></p></div></div>
          <div className="ft-card"><Ico d="pin" /><div><h5>Location</h5><p>Korum Mall, Eastern Express Highway, Thane.</p></div></div>
        </div>
        <div className="ft-col">
          <h4><b>SOCIAL</b> CONNECT</h4>
          <div className="ft-soc">
            <a href="#" aria-label="Facebook" className="fb"><Ico d="fb" /></a>
            <a href="#" aria-label="X" className="xx"><Ico d="x" /></a>
            <a href="#" aria-label="Instagram" className="ig"><Ico d="ig" /></a>
            <a href="#" aria-label="YouTube" className="yt"><Ico d="yt" /></a>
          </div>
          <nav aria-label="Footer" className="ft-nav">{links.map((l) => <a key={l} href={`#${id(l)}`}>{l}</a>)}</nav>
        </div>
      </div>
      <div className="ft-bar">© 2026 Korum Mall. All Rights Reserved.</div>
    </footer>
  );
}

export default function OP01() {
  const y = useScrollY();
  return (
    <>
      <Nav y={y} />
      <main>
        <Hero /><Discover /><Shopping /><Brands /><Dining /><Fun /><Events /><Offers /><Gallery /><Visit />
      </main>
      <Footer />
    </>
  );
}
