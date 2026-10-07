import "./globals.css";
import site from "../data/site.json";

export const metadata = {
  title: `${site.client} | SEO Reports | Nexus`,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
