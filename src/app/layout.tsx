import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from '@/context/SocketContext';
import { UserProvider } from '@/context/UserContext';
import { ChatProvider } from '@/context/ChatContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LAN Chat App",
  description: "A real-time chat application for local area networks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketProvider>
          <UserProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </UserProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
