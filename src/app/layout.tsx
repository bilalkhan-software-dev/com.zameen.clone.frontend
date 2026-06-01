import { AuthProvider } from '@/context/AuthContext';
import ThemeWrapper from './ThemeWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}