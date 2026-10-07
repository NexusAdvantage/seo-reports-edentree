import "./globals.css";
import site from "../data/site.json";

export const metadata = {
  title: `${site.client} SEO Reports | Nexus`,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  const c = site.colors;
  const vars = {
    "--brand": c.primary,
    "--brand-chart": c.chart || c.primary,
    "--brand-accent": c.accent,
    "--brand-dark": c.dark,
  };
  return (
    <html lang="en" style={vars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
