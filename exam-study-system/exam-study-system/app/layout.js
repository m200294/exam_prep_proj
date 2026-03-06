import "./globals.css";

export const metadata = {
  title: "Exam Study System",
  description: "AI-powered exam preparation with real-time progress tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
