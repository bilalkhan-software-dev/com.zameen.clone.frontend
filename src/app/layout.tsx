import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import ThemeWrapper from "./ThemeWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "PropertyHub – Find Your Dream Property in Pakistan",
  description:
    "Search thousands of properties for sale and rent across Pakistan. Connect with trusted agents and find your ideal home, flat, or commercial space.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.className}>
      <body>
        <ThemeWrapper>
          <SettingsProvider>
            <AuthProvider>{children}</AuthProvider>
          </SettingsProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}
