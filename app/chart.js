// Report charts drawn as plain HTML and CSS so the text stays readable on any screen size.

function nice(x) {
  if (x <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 1.2, 1.6, 2, 2.4, 3.2, 4, 5, 6, 8, 10]) if (m * p >= x) return m * p;
  return 10 * p;
}

export function fmt(v) {
  if (typeof v !== "number") return v;
  if (Number.isInteger(v) || Math.abs(v) >= 100) return Math.round(v).toLocaleString("en-US");
  return v.toFixed(1);
}

function tick(v, span) {
  return span >= 8 ? Math.round(v).toLocaleString("en-US") : v.toFixed(1);
}

export function Chart({ c }) {
  const n = c.labels.length;
  const stack = c.kind === "stack";
  const line = c.kind === "line";
  const first = c.series[0].values;
  const totals = c.labels.map((_, i) => c.series.reduce((s, x) => s + x.values[i], 0));
  let lo = 0;
  let hi;
  if (c.invert) {
    lo = Math.min(...first) * 0.85;
    hi = Math.max(...first) * 1.05;
  } else {
    hi = nice((stack ? Math.max(...totals) : Math.max(...c.series.flatMap((s) => s.values))) * 1.08);
  }
  const span = hi - lo;
  // Distance from the bottom of the plot, in percent. Inverted charts put low numbers on top.
  const pos = (v) => {
    const r = span > 0 ? ((v - lo) / span) * 100 : 0;
    return c.invert ? 100 - r : r;
  };
  const ticks = [0, 1, 2, 3, 4].map((k) => lo + (span * k) / 4);
  const peak = first.reduce((b, v, i) => ((c.invert ? v < first[b] : v > first[b]) ? i : b), 0);
  const maxTotal = Math.max(...totals);
  const dense = n > 7;

  return (
    <div className={`ch${dense ? " dense" : ""}`}>
      {stack ? (
        <div className="ch-legend">
          {c.series.map((s, i) => (
            <span key={s.name}>
              <i className={i === 0 ? "sw a" : "sw b"} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="ch-plot">
        {ticks.map((t, k) => (
          <div className="ch-tick" key={k} style={{ bottom: `${c.invert ? 100 - (k * 100) / 4 : (k * 100) / 4}%` }}>
            <span>{tick(t, span)}</span>
          </div>
        ))}
        {line ? (
          <>
            <svg className="ch-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {!c.invert ? (
                <polygon
                  className="ch-area"
                  points={`${first.map((v, i) => `${((i + 0.5) / n) * 100},${100 - pos(v)}`).join(" ")} ${((n - 0.5) / n) * 100},100 ${(0.5 / n) * 100},100`}
                />
              ) : null}
              <polyline className="ch-line" points={first.map((v, i) => `${((i + 0.5) / n) * 100},${100 - pos(v)}`).join(" ")} />
            </svg>
            {first.map((v, i) => (
              <div className="ch-pt" key={i} style={{ left: `${((i + 0.5) / n) * 100}%`, bottom: `${pos(v)}%` }}>
                <i />
                {i === 0 || i === n - 1 || i === peak ? <b>{fmt(v)}</b> : null}
              </div>
            ))}
          </>
        ) : (
          <div className="ch-cols">
            {c.labels.map((_, i) => {
              const total = totals[i];
              const showLabel = !stack || i === 0 || i === n - 1 || total === maxTotal;
              return (
                <div className="ch-col" key={i}>
                  <div className="ch-stack" style={{ height: `${pos(total)}%` }}>
                    {showLabel ? <b>{fmt(total)}</b> : null}
                    {stack ? (
                      [...c.series].reverse().map((s, si) => (
                        <span
                          key={s.name}
                          className={si === c.series.length - 1 ? "seg a" : "seg b"}
                          style={{ flexGrow: s.values[i] }}
                        />
                      ))
                    ) : (
                      <span className={i === n - 1 ? "seg a" : "seg b"} style={{ flexGrow: 1 }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="ch-x">
        {c.labels.map((l, i) => (
          <span key={i} className={dense && (n - 1 - i) % 2 === 1 ? "odd" : ""}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Spark({ s }) {
  const top = Math.max(...s.values) * 1.05;
  const label = (v) =>
    s.money ? (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v).toLocaleString("en-US")}`) : v >= 10 ? Math.round(v).toLocaleString("en-US") : String(Number(v.toFixed(1)));
  return (
    <div className="sp">
      <div className="sp-cols">
        {s.values.map((v, i) => (
          <div className="sp-col" key={i}>
            <div className={`sp-bar${i === s.values.length - 1 ? " a" : ""}`} style={{ height: `${(v / top) * 100}%` }}>
              <b>{label(v)}</b>
            </div>
            <span>{s.labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="sp-cap">{s.caption}</div>
    </div>
  );
}
