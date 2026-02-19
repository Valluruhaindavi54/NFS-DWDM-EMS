import "./globals.css";
import { Inter, Bebas_Neue } from "next/font/google";
import AppShell from "./components/AppShell";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-inter" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });

export const metadata = { title: "NFSDWDMEMS", description: "EMS" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="bg-white text-black min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
