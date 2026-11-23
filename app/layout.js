import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "WISTA - Women in Sports Talent Access",
  description: "Find sports training, competitions, mentorship, scholarships and careers in Rwanda.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="bar">
          <a href="/" className="brand">WISTA</a>
          <Nav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}