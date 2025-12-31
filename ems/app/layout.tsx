import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Inter, Bebas_Neue } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-inter" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });

export const metadata = {
  title: "NFSDWDMEMS - Dashboard",
  description: "EMS / NMS Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const loggedInUser = { id: "26e44737-a774-48ac-9e76-38eb8f0cd23d" };

  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body
        style={{
          margin: 0,
          fontFamily: "var(--font-inter)",
          backgroundColor: "#0f172a",
          color: "#000000",
        }}
      >
        {/* Header */}
       <header
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  }}
>
  {/* Left: Logo */}
  <div style={{ display: "flex", alignItems: "center" }}>
    <Image
      src="https://images.jdmagicbox.com/v2/comp/bangalore/52/080p25252/catalogue/united-telecoms-ltd-mahadevapura-bangalore-telecom-product-dealers-2rth1xd.jpg"
      alt="Logo"
      width={200}
      height={42}
    />
  </div>

  {/* Center: Title */}
  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
    <h1
      style={{
        fontFamily: "var(--font-bebas)",
        fontSize: 28,
        letterSpacing: 1,
        margin: 0,
        color: "#000000",
      }}
    >
      NFSDWDMEMS
    </h1>
  </div>

{/* Right: Profile Image */}
<div style={{ display: "flex", alignItems: "center" }}>
  <Link href={`/profile/${loggedInUser.id}`}>
  <Image
  src="/profile.png"
  alt="Profile"
  width={40}
  height={40}
  style={{ borderRadius: "50%", cursor: "pointer" }}
/>

  </Link>
</div>

</header>


        {/* Page content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
