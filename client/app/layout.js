import { Inter as FontSans } from "next/font/google";
import "../styles/globals.css";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Steps from "@/components/ui/steps";
import Dashboard from "@/components/Dashboard";
import Main from "@/components/Main";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "AlignShare",
  description: "A platform designed to automate the content sharing process for companies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <div className="main-container">
          <div className="main-content">
            <Header />
            <Hero />
            <Main />
            <Dashboard />
            <Steps />

            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
