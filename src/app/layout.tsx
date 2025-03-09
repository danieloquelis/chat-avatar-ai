import type { Metadata } from "next";
import { Cabin } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import { SpeechProvider } from "@/providers/speech-provider";

const font = Cabin({
  subsets: ["latin"],
  style: "normal",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Chat with AI Avatar",
  description:
    "Put some face to all boring Gen AI models, so it does not feel you are speaking to a computer only.",
  icons: {
    icon: "/app-logo.svg",
  },
};

export default function RootLayout(props: Readonly<PropsWithChildren>) {
  const { children } = props;
  return (
    <html lang="en">
      <body className={`${font.className}`}>
        <SpeechProvider>
          <main className="w-full h-screen">{children}</main>
        </SpeechProvider>
      </body>
    </html>
  );
}
