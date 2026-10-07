import site from "../../data/site.json";

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <main className="login">
      <form className="card" method="POST" action="/api/login">
        <b className="brand">NEXUS</b>
        <h1>{site.client}</h1>
        <p>Enter your password to see your SEO reports.</p>
        <input type="password" name="password" placeholder="Password" autoComplete="current-password" required autoFocus />
        {sp?.error ? <div className="err">That password did not work. Try again.</div> : null}
        <button className="btn" type="submit">View reports</button>
      </form>
    </main>
  );
}
