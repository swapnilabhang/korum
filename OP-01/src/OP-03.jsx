import { useEffect, useRef, useState } from "react";
/* Styles loaded dynamically in App.jsx per active page to prevent cross-page CSS conflicts */
import logoLight from "./assets/logo.png";
import logoDark from "./assets/logo-dark.png";

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

/* Banner with video background. Put your file at public/hero.mp4. If it is missing, the photo shows instead. */
const HERO_VIDEO = "/hero.mp4";
function HeroMedia({ shade = false }) {
  const [ok, setOk] = useState(true);
  return (
    <>
      <Pic src={IMG.hero} tone="hero" className="hero-bg" label="Mall atrium" />
      {ok && (
        <video className="hero-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true" onError={() => setOk(false)}>
          <source src={HERO_VIDEO} type="video/mp4" onError={() => setOk(false)} />
        </video>
      )}
      {shade && <div className="hero-shade" aria-hidden="true" />}
    </>
  );
}
const Title = ({ lines }) => (
  <h1 className="hero-title" aria-label="Where the city comes to linger">
    {lines.map((w, i) => <span key={w} className={`ln ln${i}`}><i style={{ animationDelay: `${0.2 + i * 0.2}s` }}>{w}</i></span>)}
  </h1>
);

/* Banner: full-bleed video, title, and a glass "Coming up" card that reads the clock. */
function Hero() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const h = now.getHours() + now.getMinutes() / 60;
  const open = h >= 10 && h < 23;
  return (
    <section id="top" className="hb">
      <HeroMedia shade />
      <div className="hb-main">
        <small className="hero-eyebrow">Thane · Four levels · 240+ stores</small>
        <Title lines={["Where the", "city comes", "to linger"]} />
        <div className="hero-btns"><a className="cta hero-cta" href="#discover">Explore the Experience</a><a className="cta ghost" href="#shopping">Shop now</a></div>
      </div>
      <aside className="hb-card" aria-label="Coming up at Korum">
        <span className={`hb-live ${open ? "on" : ""}`}><i />{open ? "Open now · until 11 pm" : "Closed · opens 10 am"}</span>
        <h2>Coming up at Korum</h2>
        <ul className="hb-list">
          {evs.slice(0, 3).map(([d, m, t, w]) => (
            <li key={t}><b>{d}<em>{m}</em></b><span>{t}<small>{w}</small></span></li>
          ))}
        </ul>
        <a className="link" href="#events">View all events</a>
      </aside>
    </section>
  );
}

const STORY = [
  ["Light first", "The atrium skylight came before the first shop. Everything else is arranged around it."],
  ["A street indoors", "240+ stores, cafés and a cinema, all on four walkable levels in the heart of Thane."],
  ["Always on", "Open 10 am to 11 pm, with events, pop-ups and live evenings all year round."],
];

/* About us, option 1: headline, short lead and a 3-step story line. Keeps id="discover" so the hero button still scrolls here. */
function Discover() {
  return (
    <section id="discover" className="about">
      <Reveal className="ab-tag">About Korum</Reveal>
      <Reveal as="h2" className="ab-head">Built around daylight. Made for <em>lingering.</em></Reveal>
      <Reveal as="p" className="ab-lead">Korum Mall was drawn like a city square: a glass-roofed atrium, garden terraces and a place to sit at the end of every level. Shopping is the reason you come. Staying is the reason you return.</Reveal>
      <div className="ab-line">
        {STORY.map(([t, d], i) => (
          <Reveal key={t} className="ab-step" style={{ transitionDelay: `${i * 0.15}s` }}>
            <i aria-hidden="true" />
            <b>{t}</b>
            <p>{d}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="ab-foot"><p className="meta">Thane, Maharashtra. Four levels. 240+ stores.</p><a href="#shopping" className="link">Explore more</a></Reveal>
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

/* Option 11: full overlap. Each card fully covers the previous one, which shrinks and dims underneath. */
function ShopOverlap() {
  const refs = useRef([]);
  useEffect(() => {
    const f = () => {
      refs.current.forEach((el, i) => {
        const nx = refs.current[i + 1];
        if (!el || !nx) return;
        const top = 96;
        const p = Math.min(1, Math.max(0, (window.innerHeight - nx.getBoundingClientRect().top) / (window.innerHeight - top)));
        el.style.transform = `scale(${1 - p * 0.06})`;
        el.style.filter = `brightness(${1 - p * 0.35})`;
      });
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    window.addEventListener("resize", f);
    return () => { window.removeEventListener("scroll", f); window.removeEventListener("resize", f); };
  }, []);
  return (
    <div className="ov">
      {SHOP.map((x, i) => (
        <article key={x.c} ref={(el) => (refs.current[i] = el)} className={`st-c ov-c s${i % 3}`} style={{ zIndex: i + 1 }}>
          <div className="st-t">
            <span className="st-ghost" aria-hidden="true">0{i + 1}</span>
            <div className="st-prog" role="img" aria-label={`Collection ${i + 1} of ${SHOP.length}`}>
              <small>Collection 0{i + 1} / 0{SHOP.length}</small>
            </div>
            <h3>{x.c}</h3>
            <p className="st-line">{x.line}</p>
            <ul className="st-brands">{x.names.map((n) => <li key={n}><em>{n[0]}</em>{n}</li>)}</ul>
            <a className="st-go" href="#shopping">Explore {x.c} <span aria-hidden="true">→</span></a>
          </div>
          <div className="st-p"><Pic src={IMG.brands[i]} tone={x.t} label={x.c} /></div>
        </article>
      ))}
    </div>
  );
}

function Shopping() {
  return (
    <section id="shopping" className="shop v11">
      <Reveal as="h2" className="sec-title">Shopping</Reveal>
      <ShopOverlap />
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

const NEON = ["#ff7a1a", "#5ad1ff", "#ff5ea8", "#a6ff5a", "#ffd84a"];
/* Dining 6: neon signs. Hover a sign to switch it on and light up the photo behind. */
function DinNeon() {
  const [a, setA] = useState(0);
  return (
    <div className="nn">
      <div className="nn-bg" key={a}><Pic src={DIN[a].img} tone={DIN[a].t} label="" /></div>
      <ul>
        {DIN.map((x, i) => (
          <li key={x.n}>
            <button className={a === i ? "on" : ""} style={{ "--c": NEON[i] }} onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)}>{x.n}</button>
            <span>{x.lv} · {x.d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


function Dining() {
  return (
    <section id="dining" className="dn dn6">
      <Reveal as="h2" className="dn-head">Tables worth<br />the detour</Reveal>
      <DinNeon />
    </section>
  );
}

const ENT = [
  { n: "Cinema", d: "IMAX and recliner screens", hrs: "10 am to 1 am", img: IMG.gallery[1], t: "g", st: [70, 95, 60] },
  { n: "Gaming", d: "VR arena, 80 arcade cabinets", hrs: "11 am to 11 pm", img: IMG.gallery[4], t: "e", st: [95, 40, 80] },
  { n: "Family", d: "Indoor garden and play lawn", hrs: "10 am to 8 pm", img: IMG.gallery[2], t: "d", st: [45, 90, 70] },
  { n: "Kids", d: "Clay studio and story hour", hrs: "10 am to 7 pm", img: IMG.gallery[3], t: "c", st: [50, 80, 55] },
  { n: "Weekends", d: "Night markets and live sets", hrs: "Fri to Sun, 6 pm", img: IMG.gallery[0], t: "h", st: [75, 60, 98] },
];

/* Entertainment: cinema-ticket cards, 3 per row on desktop. The stub colour comes from --c. */
const ENT_COL = { g: "#0b4f8a", e: "#1e8bc3", d: "#3f8f22", c: "#d9700f", h: "#c85a0c" };
function EntTickets() {
  return (
    <div className="tk">
      {ENT.map((x, i) => (
        <Reveal key={x.n} className="tk-w" style={{ transitionDelay: `${(i % 3) * 0.12}s` }}>
          <article tabIndex={0} className="ticket" style={{ "--c": ENT_COL[x.t] }}>
            <div className="tk-main">
              <small>Admit one · No. 0{i + 1}</small>
              <h3>{x.n}</h3>
              <p>{x.d}</p>
            </div>
            <div className="tk-stub">
              <span>Open</span>
              <b>{x.hrs}</b>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

function Fun() {
  return (
    <section id="entertainment" className="en en3">
      <Reveal as="h2" className="sec-title light">Entertainment</Reveal>
      <EntTickets />
    </section>
  );
}

/* Brands: flip-card layout built from the Shopping data. */
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

/* Flip cards: hover (or focus) to see the floor and what the brand sells. A soft light follows the pointer on the back. */
const glare = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
};
function BrandFlip({ list }) {
  return (
    <div className="bf">
      {list.map((b, i) => {
        const lvl = (b.line.match(/Levels?\s\d(?:\sand\s\d)?/) || [""])[0];
        return (
          <a href="#shopping" key={b.n} className="bf-c" style={{ animationDelay: `${i * 45}ms` }} onMouseMove={glare}>
            <div className="bf-in">
              <div className={`bf-f t-${b.t}`}><i className="bf-g" aria-hidden="true">{b.n[0]}</i><BrandLogo b={b} size={44} light /><b>{b.n}</b><small>{b.c}</small></div>
              <div className="bf-b">
                <i className="bf-g" aria-hidden="true">{b.n[0]}</i>
                <b>{b.n}</b>
                <div className="bf-chips"><em>{b.c}</em>{lvl && <em className="lv">{lvl}</em>}</div>
                <p>{b.line}</p>
                <span>Visit store →</span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* Scrolling name strip. Decorative only, so it is hidden from screen readers. */
function BrandStrip() {
  return (
    <div className="br-strip" aria-hidden="true">
      <div className="br-track">
        {[...ALLB, ...ALLB].map((b, i) => <span key={i}>{b.n}<i>✦</i></span>)}
      </div>
    </div>
  );
}

function Brands() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? ALLB : ALLB.filter((b) => b.c === cat);
  return (
    <section id="brands" className="brands br6">
      <Reveal as="h2" className="sec-title">Brands</Reveal>
      <p className="br-sub">{ALLB.length}+ names under one roof. Find your favourites.</p>
      <BrandStrip />
      <div className="br-cats" role="group" aria-label="Filter brands">
        {["All", ...SHOP.map((x) => x.c)].map((c) => (
          <button key={c} aria-pressed={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
            {c}<em>{c === "All" ? ALLB.length : ALLB.filter((b) => b.c === c).length}</em>
          </button>
        ))}
      </div>
      <BrandFlip key={cat} list={list} />
    </section>
  );
}

const evs = [["06", "Dec", "Glass Lantern Festival", "Atrium, all week", "a", IMG.event], ["14", "Dec", "Winter Fashion Week", "Level 2", "c", IMG.brands[0]], ["21", "Dec", "Orchestra under the Skylight", "7 pm", "e", IMG.gallery[1]], ["31", "Dec", "New Year Countdown", "Rooftop", "f", IMG.gallery[3]]];
/* Events: December ribbon. Tap a date dot to change the detail card below. Uses the evs list above. */
function Events() {
  const [a, setA] = useState(0);
  const f = evs[a];
  return (
    <section id="events" className="evr">
      <Reveal as="h2" className="sec-title">Events</Reveal>
      <Reveal className="evr-card">
        <h3>December at Korum</h3>
        <p className="evr-sub">Tap a date to see what is on.</p>
        <div className="evr-rail" role="tablist" aria-label="December events">
          {[1, 8, 15, 22, 29].map((d) => <span key={d} className="evr-tick" style={{ left: `${((d - 1) / 30) * 100}%` }}>{d}</span>)}
          {evs.map((e, i) => (
            <button key={e[2]} role="tab" aria-selected={i === a} aria-label={`${e[0]} ${e[1]}, ${e[2]}`}
              className="evr-dot" style={{ left: `${((parseInt(e[0], 10) - 1) / 30) * 100}%` }}
              onClick={() => setA(i)} onMouseEnter={() => setA(i)} onFocus={() => setA(i)}>
              <span>{parseInt(e[0], 10)} {e[1]}</span>
            </button>
          ))}
        </div>
        <div className="evr-det" aria-live="polite">
          <div className="evr-pic"><Pic key={f[2]} src={f[5]} tone={f[4]} label={f[2]} /><div className="evr-date"><b>{f[0]}</b>{f[1]}</div></div>
          <div className="evr-tx" key={`t${a}`}>
            <small>{f[0]} {f[1]}</small>
            <h3>{f[2]}</h3>
            <p>{f[3]}</p>
            <a className="evr-go" href="#events">View all events</a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* Offers: hanging tags. Offer text is taken from the existing banner, Visit us and the ribbon. */
const OFFERS = [
  { pre: "", n: "30%", u: "off", t: "Season of 30% off", p: "Quiet luxury markdowns on Level 1.", d: "Through 31 January", tone: "a" },
  { pre: "", n: "Free", u: "valet", t: "Free valet", p: "With every ₹5,000 spend.", d: "Through 31 January", tone: "e" },
  { pre: "Up to", n: "50%", u: "off", t: "Winter Edit", p: "Markdowns across the mall.", d: "Limited time", tone: "c" },
  { pre: "First", n: "2 hrs", u: "free", t: "Free parking", p: "On B1 and B2, every day.", d: "All year", tone: "f" },
];
const RIBBON = "Winter Edit  ·  Up to 50% off  ·  ";
const Ribbon = () => <div className="marq" aria-hidden="true"><div>{Array(6).fill(RIBBON).join("")}</div></div>;

/* 5 Hanging tags: price tags swinging on strings. Hover one to stop it. */
function OffersTags() {
  return (
    <section className="offers of5" aria-label="Offers">
      <Ribbon />
      <Reveal as="h2" className="sec-title of-title">Offers</Reveal>
      <div className="ot">
        {OFFERS.map((o, i) => (
          <a href="#shopping" key={o.t} className={`ot-t t-${o.tone}`} style={{ "--d": `${i * -0.9}s`, "--r": `${i % 2 ? -1 : 1}` }}>
            <i className="ot-hole" aria-hidden="true" />
            <small>{o.pre}</small><b>{o.n}</b><em>{o.u}</em>
            <h3>{o.t}</h3><p>{o.p}</p><span>{o.d}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

const GAL = [
  { c: "Atrium at noon", d: "Daylight pours through the glass roof.", t: "b" },
  { c: "Garden terrace", d: "Shops spill out into green corners.", t: "a" },
  { c: "Dining hall", d: "Long tables, warm light, open kitchens.", t: "g" },
  { c: "Level 2 walkway", d: "Glass railings and a view of every floor.", t: "c" },
  { c: "Rooftop evening", d: "Live sets as the city lights come on.", t: "e" },
];

/* Gallery 9: 3D tilt tiles with a moving glare. */
function GalTilt() {
  const mv = (e) => {
    const el = e.currentTarget, r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 14}deg`);
    el.style.setProperty("--ry", `${x * 14}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const lv = (e) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };
  return (
    <div className="gk">
      {GAL.map((x, i) => (
        <figure key={x.c} className={`gk-c gk${i}`} onMouseMove={mv} onMouseLeave={lv}><Pic src={IMG.gallery[i]} tone={x.t} label={x.c} /><figcaption>{x.c}</figcaption></figure>
      ))}
    </div>
  );
}

function Gallery() {
  return (
    <section className="gal gal9" aria-label="Gallery">
      <Reveal as="h2" className="sec-title">Moments at Korum</Reveal>
      <GalTilt />
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

/* 5 Map first: the map fills the section and a frosted card floats over it. */
function VisitMap() {
  return (
    <div className="vm">
      <div className="vm-bg">{MAP}</div>
      <div className="vm-card">
        <div><dt>Hours</dt><dd>{INFO.hours}</dd></div>
        <div><dt>Parking</dt><dd>{INFO.parking}</dd></div>
        <div><dt>Getting here</dt><dd>{INFO.getting}</dd></div>
        <div><dt>Contact</dt><dd>{INFO.mail}<br />{INFO.tel}</dd></div>
      </div>
    </div>
  );
}

function Visit() {
  return (
    <section id="visitus" className="visit vi5">
      <VisitMap />
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

export default function OP03() {
  const y = useScrollY();
  return (
    <>
      <Nav y={y} />
      <main>
        <Hero /><Discover /><Shopping /><Brands /><Dining /><Fun /><Events /><OffersTags /><Gallery /><Visit />
      </main>
      <Footer />
    </>
  );
}
