import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "Exam Study System",
  description: "Exam study tracker for Mathematics, Physics, and Chemistry",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#111111",
              color: "#e4e4e7",
              border: "1px solid #242424",
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: "13px",
            },
            success: {
              iconTheme: {
                primary: "#4ecdc4",
                secondary: "#000000",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff6b6b",
                secondary: "#000000",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
