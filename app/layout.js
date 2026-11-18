import "./globals.css";

export const metadata = {
  title: "WISTA – Women in Sports Talent Access",
  description: "Find sports training, competitions, mentorship, scholarships and careers in Rwanda.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bar">
          <a href="/" className="brand">WISTA</a>
          <nav>
            <a href="/">Opportunities</a>
            <a href="/login">Log in</a>
            <a href="/signup" className="btn">Sign up</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
