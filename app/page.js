import site from "../data/site.json";
import reports from "../data/reports.json";
import { Chart, Spark } from "./chart";
import MonthPicker from "./month-picker";

const arrow = { up: "▲", down: "▼", flat: "●" };

function Out() {
  return (
    <svg className="out" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3h7v7M13 3 4 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Section({ title, sub, children, id }) {
  return (
    <section className="sec" id={id}>
      <div className="sec-head">
        <h2>{title}</h2>
        {sub ? <p>{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const sorted = [...reports].sort((a, b) => (a.month < b.month ? 1 : -1));
  const latest = sorted[0];
  const r = sorted.find((x) => x.month === sp?.m) || latest;
  const showLogout = process.env.REQUIRE_LOGIN === "1";
  const [firstChart, ...moreCharts] = r.charts;

  return (
    <>
      <div className="nx-bar">
        <div className="wrap nx-bar-in">
          <a href="https://nexusadvantage.us" target="_blank" rel="noreferrer" className="nx-home" aria-label="Nexus Advantage">
            <img src="/brand/nexus-logo-white.svg" alt="Nexus" />
          </a>
          <span className="nx-tag">Client SEO reports</span>
          {showLogout ? (
            <a className="nx-out" href="/api/logout">
              Sign out
            </a>
          ) : null}
        </div>
      </div>

      <header className="client">
        <div className="wrap client-in">
          <a href={site.url} target="_blank" rel="noreferrer" className="client-logo" aria-label={`${site.client} website`}>
            <img src={site.logo} alt={site.client} style={{ height: site.logoHeight || 48 }} />
          </a>
          <a className="btn ghost" href={site.url} target="_blank" rel="noreferrer">
            {site.domain}
            <Out />
          </a>
        </div>
      </header>

      <div className="hero">
        <div className="wrap">
          <div className="hero-top">
            <span className="pill">{r.status}</span>
            <MonthPicker months={sorted.map(({ month, label }) => ({ month, label }))} current={r.month} />
          </div>
          <h1>{r.label} SEO report</h1>
          <p className="headline">{r.headline}</p>
          <p className="meta">
            {r.period} {"·"} {r.city} {"·"} Data pulled {r.pulled}
            {r.month === latest.month ? <span className="tag">Latest</span> : null}
          </p>
          <div className="actions">
            <a className="btn" href={r.pdf} target="_blank" rel="noreferrer">
              Download PDF
            </a>
            <a className="btn ghost" href={site.url} target="_blank" rel="noreferrer">
              Visit {site.domain}
              <Out />
            </a>
          </div>
        </div>
      </div>

      <main className="wrap">
        <div className="kpis">
          {r.kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <div className="kl">{k.label}</div>
              <div className="kv">{k.value}</div>
              <div className="kb">{k.before ? `${k.before} at the start` : " "}</div>
              <div className={`kd ${k.tone}`}>
                {arrow[k.tone]} {k.delta}
              </div>
              {k.spark ? <Spark s={k.spark} /> : null}
            </div>
          ))}
        </div>

        <Section title="How it's trending" sub="Month by month results since we started.">
          <div className="card">
            <h3>{firstChart.title}</h3>
            <p className="cs">{firstChart.sub}</p>
            <Chart c={firstChart} />
          </div>
          {moreCharts.length ? (
            <div className={`grid ${moreCharts.length > 1 ? "two" : ""}`}>
              {moreCharts.map((c) => (
                <div className="card" key={c.title}>
                  <h3>{c.title}</h3>
                  <p className="cs">{c.sub}</p>
                  <Chart c={c} />
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        {r.gsc ? (
          <Section title={r.gsc.title} sub="What Google Search Console shows for the site.">
            <div className="tiles three">
              {r.gsc.items.map((t) => (
                <div className="tile" key={t.label}>
                  <div className="kl">{t.label}</div>
                  <div className="kv sm">{t.value}</div>
                  <div className="kb">
                    {t.before} {r.gsc.then}
                  </div>
                  <div className="kd up">
                    {arrow.up} {t.delta}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : (
          <Section title="Reviews and reputation" sub="Across every review platform we track.">
            {r.reviews ? (
              <div className="tiles">
                {[
                  ["Google rating", r.reviews.rating],
                  ["Total reviews", r.reviews.total],
                  ["Positive sentiment", r.reviews.positive],
                  ["Avg reply time", r.reviews.response],
                ].map(([l, v]) => (
                  <div className="tile" key={l}>
                    <div className="kl">{l}</div>
                    <div className="kv sm">{v}</div>
                  </div>
                ))}
              </div>
            ) : null}
            {r.reviewsNote ? <p className="note">{r.reviewsNote}</p> : null}
          </Section>
        )}

        <Section title={r.table.title}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {r.table.cols.map((c, i) => (
                    <th key={c} className={i ? "n" : ""}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((v, i) => (
                      <td key={i} data-label={r.table.cols[i]} className={`${i ? "n" : ""}${r.table.highlightLast && i === row.length - 1 ? " hl" : ""}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title={r.watch.title}>
          <div className="items">
            {r.watch.items.map((w, i) => (
              <div className="item watch" key={i}>
                <p>{w}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Next 90 days" sub="What we are working on next.">
          <div className="items">
            {r.next.map((n, i) => (
              <div className="item step" key={i}>
                <span className="num">{i + 1}</span>
                <p>{n}</p>
              </div>
            ))}
          </div>
        </Section>

        <p className="sources">{r.sources}</p>

        <Section title="All reports" sub="A new report is added at the start of every month.">
          <div className="list">
            {sorted.map((x) => (
              <a className="row" key={x.month} href={`/?m=${x.month}`}>
                <div>
                  <div className="m">
                    {x.label}
                    {x.month === latest.month ? <span className="tag">Latest</span> : null}
                  </div>
                  <div className="s">{x.period}</div>
                </div>
                <span className="go">{x.month === r.month ? "Viewing" : "Open report"}</span>
              </a>
            ))}
          </div>
        </Section>
      </main>

      <footer className="nx-foot">
        <div className="wrap nx-foot-in">
          <img src="/brand/nexus-logo-white.svg" alt="Nexus" />
          <p>
            Prepared by Nexus Advantage for {site.client}. Questions about your report? Reply to the message this link came in.
          </p>
          <a href="https://nexusadvantage.us" target="_blank" rel="noreferrer">
            nexusadvantage.us
          </a>
        </div>
      </footer>
    </>
  );
}
