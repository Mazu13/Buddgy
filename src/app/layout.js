import "./globals.css";
import { ThemeProvider } from "@/lib/themeContext";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata = {
  title: "Buddgy",
  description: "Budget tracking made simple",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-hidden">
        <ThemeProvider>
          <SessionWrapper>{children}</SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
