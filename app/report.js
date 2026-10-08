"use client";
import { useEffect, useMemo, useState } from "react";
import Icon from "./icons";

// Every number the report can show. Each client's data/report.json says which ones it has.
const METRICS = {
  clicks: { label: "Clicks from Google", short: "Clicks", kind: "int", better: "up", tip: "People who clicked through to your site from a Google search" },
  impressions: { label: "Times shown on Google", short: "Shown", kind: "int", better: "up", tip: "How many times your site appeared in Google results" },
  position: { label: "Avg Google position", short: "Position", kind: "pos", better: "down", tip: "Average spot in Google results. Lower is better" },
  ctr: { label: "Click rate", short: "Click rate", kind: "pct", better: "up", tip: "Share of people who saw you on Google and clicked" },
  page1: { label: "Page one keywords", short: "Page one", kind: "int", better: "up", tip: "Searches where you rank on the first page of Google" },
  top3: { label: "Top 3 keywords", short: "Top 3", kind: "int", better: "up", tip: "Searches where you rank in the top 3" },
  traffic: { label: "Est. monthly visitors", short: "Visitors", kind: "int", better: "up", tip: "Ahrefs estimate of visitors from Google" },
  value: { label: "Traffic value", short: "Value", kind: "money", better: "up", tip: "What the same traffic would cost in Google Ads (Ahrefs estimate)" },
  posts: { label: "Google posts published", short: "Posts", kind: "int", better: "up", tip: "Posts published on your Google Business Profile" },
};

// Special characters kept as codes so the file stays plain ASCII.
const c = (n) => String.fromCharCode(n);
const CH = { nb: c(160), minus: c(8722), dot: c(9679), up: c(9650), down: c(9660), stars: c(9733).repeat(5), mid: c(183) };

const has = (v) => v !== null && v !== undefined;

export function fmt(v, kind) {
  if (!has(v)) return CH.nb;
  if (kind === "pos") return v.toFixed(1);
  if (kind === "pct") return (v < 1 ? v.toFixed(2) : v.toFixed(1)) + "%";
  if (kind === "money") return v >= 10000 ? "$" + (v / 1000).toFixed(1) + "k" : "$" + Math.round(v).toLocaleString("en-US");
  return Math.round(v).toLocaleString("en-US");
}

function short(v, kind) {
  if (!has(v)) return "";
  if (kind === "int" && v >= 10000) return (v / 1000).toFixed(v >= 100000 ? 0 : 1) + "k";
  return fmt(v, kind);
}

// Change from a to b, judged by whether up or down is good for this number.
function change(key, a, b) {
  const m = METRICS[key];
  if (!has(a) || !has(b)) return null;
  const d = b - a;
  const good = m.better === "up" ? d > 0 : d < 0;
  const tone = d === 0 ? "flat" : good ? "good" : "bad";
  let text;
  if (m.kind === "pos") text = d === 0 ? "No change" : `${Math.abs(d).toFixed(1)} spots ${d < 0 ? "better" : "worse"}`;
  else if (m.kind === "pct") text = d === 0 ? "No change" : `${d > 0 ? "+" : CH.minus}${Math.abs(d).toFixed(2)} pts`;
  else if (a === 0) text = b === 0 ? "No change" : "New";
  else {
    const r = b / a;
    if (r >= 2) text = `${r.toFixed(1)}x`;
    else text = `${d >= 0 ? "+" : CH.minus}${Math.abs(Math.round((d / a) * 100))}%`;
  }
  // Size of the move, used to rank the biggest changes.
  const size = m.kind === "pos" ? Math.abs(d) / Math.max(a, 1) : a === 0 ? (b > 0 ? 1 : 0) : Math.abs(Math.log(Math.max(b, 0.01) / a));
  return { tone, text, size, good };
}

function Arrow({ tone }) {
  if (tone === "flat") return <span className="ar flat">{CH.dot}</span>;
  return <span className={`ar ${tone}`}>{tone === "good" ? CH.up : CH.down}</span>;
}

function Spark({ months, k, sel, cmp }) {
  const kind = METRICS[k].kind;
  const vals = months.map((m) => m.values[k]);
  const nums = vals.filter(has);
  if (nums.length < 2) return null;
  const inv = METRICS[k].better === "down";
  const lo = Math.min(...nums), hi = Math.max(...nums);
  return (
    <div className="spark" aria-hidden="true">
      {vals.map((v, i) => {
        let h = 0;
        if (has(v)) h = inv ? (hi === lo ? 60 : 25 + ((hi - v) / (hi - lo)) * 75) : hi === 0 ? 0 : Math.max(6, (v / hi) * 100);
        const cls = !has(v) ? "na" : months[i].month === sel ? "sel" : months[i].month === cmp ? "cmp" : "";
        return <i key={i} className={cls} style={{ height: has(v) ? `${h}%` : "100%" }} title={`${months[i].short}: ${has(v) ? fmt(v, kind) : "no data"}`} />;
      })}
    </div>
  );
}

function Trend({ months, k, sel, cmp, onPick }) {
  const m = METRICS[k];
  const vals = months.map((x) => x.values[k]);
  const nums = vals.filter(has);
  const inv = m.better === "down";
  const hi = Math.max(...nums, 0);
  const lo = Math.min(...nums);
  const [hover, setHover] = useState(null);
  return (
    <div className="trend">
      <div className="trend-plot">
        {inv && nums.length > 1 && (
          <svg className="trend-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points={vals
                .map((v, i) => (has(v) ? `${((i + 0.5) / vals.length) * 100},${100 - (hi === lo ? 55 : 18 + ((hi - v) / (hi - lo)) * 72)}` : null))
                .filter(Boolean)
                .join(" ")}
            />
          </svg>
        )}
        {vals.map((v, i) => {
          const mo = months[i];
          const isSel = mo.month === sel, isCmp = mo.month === cmp;
          let h = 0;
          if (has(v)) h = inv ? (hi === lo ? 55 : 18 + ((hi - v) / (hi - lo)) * 72) : hi === 0 ? 0 : Math.max(2, (v / hi) * 88);
          return (
            <button
              key={mo.month}
              className={`col${isSel ? " sel" : ""}${isCmp ? " cmp" : ""}${has(v) ? "" : " na"}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => onPick(mo.month)}
              aria-label={`${mo.label}: ${has(v) ? fmt(v, m.kind) : "no data"}`}
            >
              {has(v) ? (
                inv ? (
                  <span className="dot" style={{ bottom: `${h}%` }}>
                    {(isSel || isCmp || hover === i) && <b>{fmt(v, m.kind)}</b>}
                  </span>
                ) : (
                  <span className="bar" style={{ height: `${h}%` }}>
                    {(isSel || isCmp || hover === i) && <b>{short(v, m.kind)}</b>}
                  </span>
                )
              ) : (
                <span className="nodata">No data</span>
              )}
              {hover === i && has(v) && (
                <span className="tip">
                  <strong>{mo.label}</strong>
                  {m.label}: {fmt(v, m.kind)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="trend-x">
        {months.map((mo) => (
          <span key={mo.month} className={mo.month === sel ? "sel" : mo.month === cmp ? "cmp" : ""}>
            {mo.short}
          </span>
        ))}
      </div>
      {inv && <p className="trend-note">Higher on the chart is better. Position 1 is the top of Google.</p>}
    </div>
  );
}


// Which number each service card points at. First one with data wins, and no number is used twice.
const SVC_METRICS = { search: ["page1", "clicks", "impressions"], globe: ["clicks", "impressions"], chart: ["top3", "position", "impressions"] };

function serviceStats(services, data, S, C, sel) {
  const used = new Set();
  return services.map((s) => {
    if (s.icon === "pin" && data.gbp && has(S.values.posts)) {
      const c = C ? change("posts", C.values.posts, S.values.posts) : null;
      return { value: String(S.values.posts), label: `posts published in ${S.short}`, c };
    }
    if (s.icon === "list" && data.listings && data.listings[sel]) {
      const L = Object.fromEntries(data.listings[sel]);
      if (L["Live and synced"]) return { value: L["Directories"] ? `${L["Live and synced"]} of ${L["Directories"]}` : L["Live and synced"], label: "directories live and synced" };
    }
    if (s.icon === "star" && S.reviews) return { value: S.reviews.rating, label: `star rating, ${S.reviews.total} reviews` };
    for (const k of SVC_METRICS[s.icon] || []) {
      if (used.has(k) || !data.metrics.includes(k) || !has(S.values[k])) continue;
      used.add(k);
      const c = C ? change(k, C.values[k], S.values[k]) : null;
      return { value: fmt(S.values[k], METRICS[k].kind), label: METRICS[k].label[0].toLowerCase() + METRICS[k].label.slice(1), c };
    }
    return null;
  });
}

function Stars({ rating }) {
  const pct = Math.max(0, Math.min(100, (parseFloat(rating) / 5) * 100));
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      <span className="stars-bg">{CH.stars}</span>
      <span className="stars-fg" style={{ width: `${pct}%` }}>
        {CH.stars}
      </span>
    </span>
  );
}

export default function Report({ data, site }) {
  const months = useMemo(() => [...data.months].sort((a, b) => (a.month < b.month ? -1 : 1)), [data]);
  const latest = months[months.length - 1].month;
  const [sel, setSel] = useState(latest);
  const [cmp, setCmp] = useState(months.length > 1 ? months[months.length - 2].month : null);
  const keys = data.metrics;
  const [focus, setFocus] = useState(data.primary[0]);

  // Read and write ?m= and ?vs= so a link opens the same view.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const m = p.get("m"), vs = p.get("vs");
    if (m && months.some((x) => x.month === m)) setSel(m);
    if (vs === "none") setCmp(null);
    else if (vs && months.some((x) => x.month === vs)) setCmp(vs);
  }, [months]);
  useEffect(() => {
    const p = new URLSearchParams();
    if (sel !== latest) p.set("m", sel);
    if (cmp) p.set("vs", cmp);
    const q = p.toString();
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
  }, [sel, cmp, latest]);

  const S = months.find((x) => x.month === sel);
  const C = cmp ? months.find((x) => x.month === cmp) : null;
  const pickSel = (m) => {
    setSel(m);
    if (m === cmp) setCmp(null);
  };
  const pickCmp = (m) => setCmp(m === cmp || m === sel ? null : m);

  const moves = C
    ? keys
        .map((k) => ({ k, c: change(k, C.values[k], S.values[k]) }))
        .filter((x) => x.c && x.c.tone === "good")
        .sort((a, b) => b.c.size - a.c.size)
        .slice(0, 3)
    : [];

  const gbp = S.gbp;
  const showPosts = data.gbp && has(S.values.posts);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-row">
            <div>
              <p className="eyebrow">SEO report</p>
              <h1>{S.label}</h1>
              {S.headline ? <p className="headline">{S.headline}</p> : null}
              {S.note ? <p className="note-h">{S.note}</p> : null}
            </div>
            <div className="hero-actions noprint">
              <button className="btn light" onClick={() => window.print()}>
                <Icon name="download" /> Save as PDF
              </button>
            </div>
          </div>

          <div className="pickers noprint">
            <div className="picker">
              <span className="pk-label">Showing</span>
              <div className="chips">
                {months.map((m) => (
                  <button key={m.month} className={`chip${m.month === sel ? " on" : ""}`} onClick={() => pickSel(m.month)}>
                    {m.short}
                  </button>
                ))}
              </div>
            </div>
            {months.length > 1 && (
              <div className="picker">
                <span className="pk-label">Compare to</span>
                <div className="chips">
                  {months
                    .filter((m) => m.month !== sel)
                    .map((m) => (
                      <button key={m.month} className={`chip ghost${m.month === cmp ? " on" : ""}`} onClick={() => pickCmp(m.month)}>
                        {m.short}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {moves.length > 0 && (
            <div className="moves">
              <span className="pk-label">Biggest wins since {C.label.split(" ")[0]}</span>
              <div className="move-row">
                {moves.map(({ k, c }) => (
                  <span key={k} className={`move ${c.tone}`}>
                    <Arrow tone={c.tone} />
                    <b>{c.text}</b> {METRICS[k].short.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="wrap">
        <div className="kpis">
          {data.primary.map((k) => {
            const m = METRICS[k];
            const v = S.values[k];
            const c = C ? change(k, C.values[k], v) : null;
            return (
              <button key={k} className={`kpi${focus === k ? " on" : ""}`} onClick={() => setFocus(k)} title={m.tip}>
                <span className="kl">{m.label}</span>
                <span className="kv">{has(v) ? fmt(v, m.kind) : <em>Not tracked yet</em>}</span>
                <span className={`kd ${c ? c.tone : "none"}`}>
                  {c ? (
                    <>
                      <Arrow tone={c.tone} /> {c.text}
                      <span className="kvs"> vs {C.short}</span>
                    </>
                  ) : C ? (
                    "No data to compare"
                  ) : (
                    CH.nb
                  )}
                </span>
                <Spark months={months} k={k} sel={sel} cmp={cmp} />
              </button>
            );
          })}
        </div>

        <section className="card big">
          <div className="card-head">
            <h2>{METRICS[focus].label}</h2>
            <div className="tabs noprint" role="tablist">
              {keys.map((k) => (
                <button key={k} role="tab" aria-selected={focus === k} className={focus === k ? "on" : ""} onClick={() => setFocus(k)}>
                  {METRICS[k].short}
                </button>
              ))}
            </div>
          </div>
          <Trend months={months} k={focus} sel={sel} cmp={cmp} onPick={pickSel} />
          <div className="legend">
            <span>
              <i className="sw sel" /> {S.short}
            </span>
            {C && (
              <span>
                <i className="sw cmp" /> {C.short}
              </span>
            )}
            <span className="muted">Tap a month to view it</span>
          </div>
        </section>

        <div className="grid2">
          <section className="card">
            <div className="card-head">
              <h2>{C ? `${C.short} vs ${S.short}` : "All numbers"}</h2>
            </div>
            <div className="cmp-table">
              {keys.map((k) => {
                const m = METRICS[k];
                const a = C ? C.values[k] : null;
                const b = S.values[k];
                const c = C ? change(k, a, b) : null;
                return (
                  <div className="cmp-row" key={k}>
                    <span className="cr-l">{m.label}</span>
                    {C && <span className="cr-a">{has(a) ? fmt(a, m.kind) : "No data"}</span>}
                    <span className="cr-b">{has(b) ? fmt(b, m.kind) : "No data"}</span>
                    {C && <span className={`cr-c ${c ? c.tone : "none"}`}>{c ? c.text : ""}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Top searches</h2>
              <span className="muted sm">{S.short}</span>
            </div>
            {S.searches && S.searches.length ? (
              <div className="searches">
                {(() => {
                  const max = Math.max(...S.searches.map((s) => s[2] || 0), 1);
                  return S.searches.map(([term, clicks, imp, pos]) => (
                    <div className="sr" key={term}>
                      <div className="sr-top">
                        <span className="sr-t">{term}</span>
                        <span className={`pos-chip${pos <= 3 ? " top" : pos <= 10 ? " p1" : ""}`}>#{Math.max(1, Math.round(pos))}</span>
                      </div>
                      {has(imp) && (
                        <div className="sr-bar">
                          <i style={{ width: `${(imp / max) * 100}%` }} />
                        </div>
                      )}
                      <div className="sr-m">
                        {has(imp) ? `${imp.toLocaleString("en-US")} times shown` : ""}
                        {has(clicks) ? ` ${CH.mid} ${clicks} clicks` : ""}
                        {S.searchesNote ? ` ${CH.mid} ${S.searchesNote}` : ""}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="empty">Search term detail is not available for this month.</p>
            )}
          </section>
        </div>

        {(showPosts || S.reviews) && (
          <div className={S.reviews && showPosts ? "grid2 wide-left" : ""}>
            {showPosts && (
              <section className="card">
                <div className="card-head">
                  <h2>Google Business Profile</h2>
                  <span className="badge good">
                    <Icon name="check" /> Weekday schedule
                  </span>
                </div>
                <div className="gbp-stats">
                  <div>
                    <span className="big">{S.values.posts}</span>
                    <span className="muted sm">posts in {S.short}</span>
                  </div>
                  {data.gbp.scheduledAhead ? (
                    <div>
                      <span className="big">{data.gbp.scheduledAhead}</span>
                      <span className="muted sm">scheduled through {data.gbp.throughLabel}</span>
                    </div>
                  ) : null}
                </div>
                {gbp && gbp.samples && gbp.samples.length ? (
                  <div className="posts">
                    {gbp.samples.map(([date, text, img]) => (
                      <figure className="post" key={date + text.slice(0, 10)}>
                        <div className="post-img">
                          <img src={img} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
                        </div>
                        <figcaption>
                          <span className="post-d">{new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <span className="post-t">{text}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </section>
            )}
            {S.reviews && (
              <section className="card">
                <div className="card-head">
                  <h2>Reviews</h2>
                  <span className="muted sm">{S.short}</span>
                </div>
                <div className="rev-hero">
                  <span className="rev-num">{S.reviews.rating}</span>
                  <Stars rating={S.reviews.rating} />
                  <span className="muted sm">{S.reviews.total} reviews</span>
                </div>
                <div className="rev-grid">
                  <div>
                    <span className="kl">Positive</span>
                    <span className="rv">{S.reviews.positive}</span>
                  </div>
                  <div>
                    <span className="kl">Avg reply time</span>
                    <span className="rv">{S.reviews.response}</span>
                  </div>
                  {S.reviews.thisYear ? (
                    <div>
                      <span className="kl">New in {S.month.slice(0, 4)}</span>
                      <span className="rv">{S.reviews.thisYear}</span>
                    </div>
                  ) : null}
                </div>
              </section>
            )}
          </div>
        )}

        {data.listings && data.listings[sel] && (
          <section className="card">
            <div className="card-head">
              <h2>Business listings</h2>
              <span className="muted sm">{S.short}</span>
            </div>
            <div className="list-stats">
              {data.listings[sel].map(([label, value]) => (
                <div key={label}>
                  <span className="big">{value}</span>
                  <span className="muted sm">{label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="sec">
          <h2 className="sec-h">What we do and what it moved</h2>
          <div className="services">
            {(() => {
              const stats = serviceStats(data.services, data, S, C, sel);
              return data.services
                .map((s, i) => ({ s, st: stats[i] }))
                .sort((a, b) => (b.st ? 1 : 0) - (a.st ? 1 : 0))
                .map(({ s, st }) => (
                  <div className={`svc${st ? " has-stat" : ""}`} key={s.name}>
                    <div className="svc-top">
                      <span className="svc-i">
                        <Icon name={s.icon} />
                      </span>
                      <div>
                        <h3>{s.name}</h3>
                        <p>{s.detail}</p>
                      </div>
                    </div>
                    {st && (
                      <div className="svc-stat">
                        <span className="svc-v">{st.value}</span>
                        <span className="svc-l">{st.label}</span>
                        {st.c && st.c.tone === "good" && (
                          <span className="svc-c">
                            <Arrow tone="good" /> {st.c.text} vs {C.short}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ));
            })()}
          </div>
        </section>

        {S.next && S.next.length ? (
          <section className="sec">
            <h2 className="sec-h">Up next</h2>
            <ol className="next">
              {S.next.map((n, i) => (
                <li key={i}>
                  <span className="num">{i + 1}</span>
                  {n}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <p className="sources">{data.sources}</p>
      </main>
    </>
  );
}
