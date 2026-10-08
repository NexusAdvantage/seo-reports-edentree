import site from "../data/site.json";
import data from "../data/report.json";
import Report from "./report";
import "./services.css";

export default function Home() {
  const showLogout = process.env.REQUIRE_LOGIN === "1";
  return (
    <>
      <div className="nx-bar">
        <div className="wrap nx-bar-in">
          <a href="https://nexusadvantage.us" target="_blank" rel="noreferrer" className="nx-home" aria-label="Nexus Advantage">
            <img src="/brand/nexus-logo-white.svg" alt="Nexus" />
          </a>
          <span className="nx-tag">Client reports</span>
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
            <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5h11v11M19 5 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </header>

      <Report data={data} site={site} />

      <footer className="nx-foot">
        <div className="wrap nx-foot-in">
          <img src="/brand/nexus-logo-white.svg" alt="Nexus" />
          <p>Prepared by Nexus Advantage for {site.client}. Questions? Reply to the message this link came in.</p>
          <a href="https://nexusadvantage.us" target="_blank" rel="noreferrer">
            nexusadvantage.us
          </a>
        </div>
      </footer>
    </>
  );
}
