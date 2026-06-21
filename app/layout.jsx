import "./globals.css";

export const metadata = {
  title: "NF Anglers Club",
  description:
    "Komunitas mancing Nusa Fishing — Fish Card, peta spot, AI umpan, dan gamifikasi tier.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a1419",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-nf-deep text-nf-ink">
        {children}
      </body>
    </html>
  );
}
