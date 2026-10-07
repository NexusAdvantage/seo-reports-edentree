export const COOKIE = "nx_session";

export async function tokenFor(password) {
  const data = new TextEncoder().encode("nexus-report:" + password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
