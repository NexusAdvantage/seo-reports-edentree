import site from "../data/site.json";
import reports from "../data/reports.json";
import Viewer from "./viewer";

const arrow = { up: "▲", down: "▼", flat: "●" };

export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const sorted = [...reports].sort((a, b) => (a.month < b.month ? 1 : -1));
  const latest = sorted[0];
  const current = sorted.find((r) => r.month === sp?.m) || latest;
  return (
    <>
      <div className="band">
        <div className="wrap">
          <div className="top"><b>NEXUS</b><a href="/api/logout">Sign out</a></div>
          <div className="hero">
            <span className="pill">SEO reports</span>
            <h1>{site.client}</h1>
            <p>{site.domain} {"·"} Updated monthly by Nexus</p>
          </div>
        </div>
      </div>
      <main className="wrap">
        <section>
          <h2>{current.label} report</h2>
          <p className="sub">{current.period}{current.month === latest.month ? " · Latest" : ""}</p>
          {current.headline ? <p className="head">{current.headline}</p> : null}
          <div className="kpis">
            {current.kpis.map((k) => (
              <div className="kpi" key={k.label}>
                <div className="kl">{k.label}</div>
                <div className="ka">{k.value}</div>
                <div className="kb">{k.before ? `${k.before} then` : " "}</div>
                <div className={`kd ${k.tone}`}>{arrow[k.tone]} {k.delta}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="report">
          <Viewer src={current.file} label={current.label} />
        </section>
        <section>
          <h2>All reports</h2>
          <p className="sub">A new report is added at the start of every month.</p>
          <div className="list">
            {sorted.map((r) => (
              <a className="row" key={r.month} href={`/?m=${r.month}`}>
                <div>
                  <div className="m">{r.label}{r.month === latest.month ? <span className="tag">Latest</span> : null}</div>
                  <div className="s">{r.period}</div>
                </div>
                <span className="go">{r.month === current.month ? "Viewing" : "Open report"}</span>
              </a>
            ))}
          </div>
        </section>
        <footer>Prepared by Nexus. Questions about your report? Reply to the message this link came in.</footer>
      </main>
    </>
  );
}
