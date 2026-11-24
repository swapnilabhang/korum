import { useEffect, useRef, useState } from "react";
import "./App.css";

/* Free Unsplash photos (mall interiors, dining, fashion). Replace any ID or URL with your own.
   Local images: put them in /public and use "/name.jpg". */
const u = (id, w = 1600) => `https://unsplash.com/photos/${id}/download?force=true&w=${w}&q=80`;
const IMG = {
  hero: u("X0yKdR_F9rM", 2000),
  discover: u("fxCvuwRiltc", 1400),
  dining: u("j0dAs1yodko", 2000),
  diningInset: u("m7IpcYOx8hM", 900),
  event: u("Qzcby2EMkTU", 1400),
  brands: ["hMMbIptXPjI", "qnKhZJPKFD8", "Bn2cAE13daA", "LxgOZ6n5-4g", "MHN96iFvKIU", "E4B_hlQ9JSY"].map((id) => u(id, 1000)),
  gallery: ["QUNNr7U30K8", "nNR_w0ifl1M", "i0BErr5RXNc", "a37XH6aJqNw", "Xtl8rQMu1y8"].map((id) => u(id, 1400)),
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
const useFallbackSrc = (src) => {
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
  return cur;
};
const Pic = ({ src, tone = "a", className = "", label = "", style }) => {
  const cur = useFallbackSrc(src);
  return (
    <div className={`pic t-${tone} ${className}`} role="img" aria-label={label}
      style={{ ...style, ...(cur ? { "--i": `url(${cur})` } : {}) }} />
  );
};

/* Big word filled with a photo (background-clip:text). */
const PhotoWord = ({ src, tone = "b", children }) => {
  const cur = useFallbackSrc(src);
  return <span className={`pw t-${tone}`} style={cur ? { "--i": `url(${cur})` } : undefined}>{children}</span>;
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
      <a href="#top" className="logo" aria-label="Korum Mall home"><i className="mark" aria-hidden="true" />KORUM<span>Mall</span></a>
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

function HeroClassic({ y }) {
  return (
    <section id="top" className="hero">
      <Pic src={IMG.hero} tone="hero" className="hero-bg" label="Mall atrium" style={{ transform: `translateY(${y * 0.25}px) scale(${1.08 + y * 0.0001})` }} />
      <h1 className="hero-title" aria-label="Where the city comes to linger">
        {["Where the", "city comes", "to linger"].map((w, i) => (
          <span key={w} className={`ln ln${i}`}><i style={{ animationDelay: `${0.2 + i * 0.18}s` }}>{w}</i></span>
        ))}
      </h1>
      <p className="hero-note">Four levels of fashion, food and film under one skylight. Open daily, 10 am to 11 pm.</p>
      <div className="float f1"><b>240+</b> stores</div>
      <div className="float f2"><b>Today</b> Rooftop jazz, 7 pm</div>
      <a className="cta" href="#discover">Explore the Experience</a>
      <div className="scroll" aria-hidden="true"><span />Scroll</div>
    </section>
  );
}

function Discover() {
  return (
    <section id="discover" className="discover">
      <Reveal className="d-eyebrow"><i />Discover</Reveal>
      <Reveal as="h2" className="d-head">
        <span className="d-lead">A building that behaves like a</span>
        <PhotoWord src={IMG.discover} tone="b">city</PhotoWord>
        <PhotoWord src={IMG.gallery[0]} tone="g">square</PhotoWord>
      </Reveal>
      <Reveal className="d-bar">
        <p className="d-copy">Korum Mall was drawn around daylight. Walkways open to a glass-roofed atrium, shops spill into garden terraces, and every level ends in a place to sit.</p>
        <dl className="d-stats">
          <div><dt>Four</dt><dd>levels</dd></div>
          <div><dt>240+</dt><dd>stores</dd></div>
          <div><dt>Thane</dt><dd>Maharashtra</dd></div>
        </dl>
        <a href="#shopping" className="link d-link">Explore more</a>
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

/* Option 4: accordion panels. Tall strips; the hovered one opens up. */
function ShopAccordion({ a, setA }) {
  return (
    <div className="ac">
      {SHOP.map((x, i) => (
        <button key={x.c} className={`ac-p ${a === i ? "on" : ""}`} onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)} aria-expanded={a === i}>
          <Pic src={IMG.brands[i]} tone={x.t} label="" />
          <span className="ac-t">{x.c}</span>
          <span className="ac-in"><b>{x.c}</b><em>{x.line}</em><i>{x.names.join(", ")}</i></span>
        </button>
      ))}
    </div>
  );
}

function Shopping() {
  const [a, setA] = useState(0);
  return (
    <section id="shopping" className="shop v4">
      <Reveal as="h2" className="sec-title">Shopping</Reveal>
      <ShopAccordion a={a} setA={setA} />
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

const FLOORS = [4, 2, 0, 3, 1];
/* Dining 8: elevator. Floors from rooftop down; pick a floor to open its restaurant. */
function DinFloors() {
  const [a, setA] = useState(2);
  return (
    <div className="el">
      {FLOORS.map((di, i) => {
        const x = DIN[di];
        return (
          <button key={x.n} className={`el-f ${a === i ? "on" : ""}`} aria-expanded={a === i} onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)}>
            <span className="el-l">{x.lv}</span><span className="el-n">{x.n}</span>
            <span className="el-b">
              <span className="el-p"><Pic src={x.img} tone={x.t} label={x.n} /></span>
              <span className="el-i"><em>{x.d}</em><i>Try: {x.dish}</i><small>Open {x.open}</small></span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Dining() {
  return (
    <section id="dining" className="dn dn8">
      <Reveal as="h2" className="dn-head">Tables worth<br />the detour</Reveal>
      <DinFloors />
    </section>
  );
}
const dm = (name) => `/ent/${name}.svg`; /* dummy images in /public/ent, replace with real ones later */
const ENT = [
  { n: "Cinema", d: "IMAX and recliner screens", hrs: "10 am to 1 am", img: dm("cinema"), t: "g", st: [70, 95, 60] },
  { n: "Gaming", d: "VR arena, 80 arcade cabinets", hrs: "11 am to 11 pm", img: dm("gaming"), t: "e", st: [95, 40, 80] },
  { n: "Family", d: "Indoor garden and play lawn", hrs: "10 am to 8 pm", img: dm("family"), t: "d", st: [45, 90, 70] },
  { n: "Kids", d: "Clay studio and story hour", hrs: "10 am to 7 pm", img: dm("kids"), t: "c", st: [50, 80, 55] },
  { n: "Weekends", d: "Night markets and live sets", hrs: "Fri to Sun, 6 pm", img: dm("weekends"), t: "h", st: [75, 60, 98] },
];

/* Entertainment 3: a fan of cards that lifts on hover. */
function EntFan() {
  return (
    <div className="ef">
      {ENT.map((x, i) => (
        <article key={x.n} tabIndex={0} className="ef-c" style={{ "--k": i - 2 }}>
          <Pic src={x.img} tone={x.t} label={x.n} />
          <div><h3>{x.n}</h3><p>{x.d}</p></div>
        </article>
      ))}
    </div>
  );
}

function Fun() {
  return (
    <section id="entertainment" className="en en3">
      <Reveal as="h2" className="sec-title light">Entertainment</Reveal>
      <EntFan />
    </section>
  );
}
/* Brands: 3 layouts (6, 7, 8) built from the Shopping data. Switch them with the "Brands" pill in dev. */
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

/* 8 Spotlight: one big featured brand that auto-plays. Hover or tap a chip to take over. */
function BrandSpot({ list }) {
  const [a, setA] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold || list.length < 2) return;
    const t = setTimeout(() => setA((x) => (x + 1) % list.length), 5000);
    return () => clearTimeout(t);
  }, [a, hold, list.length]);
  const f = list[a] || list[0];
  const pad = (n) => String(n + 1).padStart(2, "0");
  return (
    <div className="bs">
      <div className="bs-feat" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        <div className="bs-img" key={a}><Pic src={f.img} tone={f.t} label={f.n} /></div>
        <span className="bs-count"><b>{pad(a)}</b> / {pad(list.length - 1)}</span>
        <div className="bs-info" key={`i${a}`}>
          <BrandLogo b={f} size={72} light />
          <small>{f.c}</small>
          <h3>{f.n}</h3>
          <p>{f.line}</p>
          <a className="link" href="#shopping">Visit store</a>
        </div>
      </div>
      <div className="bs-chips" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        {list.map((b, i) => (
          <button key={b.n} className={`bs-ch t-${b.t} ${i === a ? "on" : ""}`} onMouseEnter={() => setA(i)} onFocus={() => setA(i)} onClick={() => setA(i)}>
            <em>{pad(i)}</em>
            <BrandLogo b={b} size={36} light={i === a} />
            <span><b>{b.n}</b><small>{b.c}</small></span>
            <i aria-hidden="true">→</i>
            {i === a && !hold && <u key={a} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Brands() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? ALLB : ALLB.filter((b) => b.c === cat);
  return (
    <section id="brands" className="brands br8">
      <Reveal as="h2" className="sec-title">Brands</Reveal>
      <p className="br-sub">{ALLB.length}+ names under one roof. Find your favourites.</p>
      <div className="br-cats" role="group" aria-label="Filter brands">
        {["All", ...SHOP.map((x) => x.c)].map((c) => (
          <button key={c} aria-pressed={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>
            {c}<em>{c === "All" ? ALLB.length : ALLB.filter((b) => b.c === c).length}</em>
          </button>
        ))}
      </div>
      <BrandSpot key={cat} list={list} />
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

/* Offers: layouts 2, 3 and 5. Offer text is taken from the existing banner, Visit us and the ribbon. */
const OFFERS = [
  { pre: "", n: "30%", u: "off", t: "Season of 30% off", p: "Quiet luxury markdowns on Level 1.", d: "Through 31 January", tone: "a" },
  { pre: "", n: "Free", u: "valet", t: "Free valet", p: "With every ₹5,000 spend.", d: "Through 31 January", tone: "e" },
  { pre: "Up to", n: "50%", u: "off", t: "Winter Edit", p: "Markdowns across the mall.", d: "Limited time", tone: "c" },
  { pre: "First", n: "2 hrs", u: "free", t: "Free parking", p: "On B1 and B2, every day.", d: "All year", tone: "f" },
];
/* 3 Marquee: huge offer words drifting across a dark band, with a button on top. */
function OffersMarquee() {
  const row = (rev) => {
    const items = rev ? [...OFFERS].reverse() : OFFERS;
    const base = [...items, ...items];
    return (
      <div className={`om-row ${rev ? "rev" : ""}`}><div>{[...base, ...base].map((o, i) => <span key={i} className={i % 2 ? "o" : ""}>{o.pre} {o.n} {o.u}<i>✦</i></span>)}</div></div>
    );
  };
  return (
    <section className="offers of3" aria-label="Offers">
      <div className="om">{row(false)}{row(true)}<a className="om-btn" href="#shopping">See all offers →</a></div>
      <p className="om-note">Quiet luxury markdowns on Level 1. Free valet with every ₹5,000 spend, through 31 January.</p>
    </section>
  );
}

function Offers() {
  return <OffersMarquee />;
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
/* 5 Map first: the map fills the section and a frosted card floats over it. */
function VisitMap() {
  return (
    <div className="vm">
      <Reveal as="h2" className="sec-title vm-title">Visit us</Reveal>
      <div className="vm-wrap">
        <dl className="vm-card">
          <div><dt>Hours</dt><dd>{INFO.hours}</dd></div>
          <div><dt>Parking</dt><dd>{INFO.parking}</dd></div>
          <div><dt>Getting here</dt><dd>{INFO.getting}</dd></div>
          <div><dt>Contact</dt><dd>{INFO.mail}<br />{INFO.tel}</dd></div>
        </dl>
        <div className="vm-map">{MAP}</div>
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
          <a className="logo" href="#top" aria-label="Korum Mall home"><i className="mark" aria-hidden="true" />KORUM<span>Mall</span></a>
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

export default function App() {
  const y = useScrollY();
  return (
    <>
      <Nav y={y} />
      <main>
        <HeroClassic y={y} /><Discover /><Shopping /><Brands /><Dining /><Fun /><Events /><Offers /><Gallery /><Visit />
      </main>
      <Footer />
    </>
  );
}
