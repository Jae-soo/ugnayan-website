import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import FarcasterWrapper from "@/components/FarcasterWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestId = cookieStore.get("x-request-id")?.value;

  return (
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {requestId && <meta name="x-request-id" content={requestId} />}
          </head>
          <body
            className="antialiased"
          >
            <FarcasterWrapper>
              {children}
            </FarcasterWrapper>
          </body>
        </html>
      );
}

export const metadata: Metadata = {
        title: "Barangay Connect",
        description: "A platform for residents to file complaints, request documents, and engage with their barangay through an easy-to-use interface. Stay connected and streamline community interactions.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_545ce620-e513-4096-908c-123a9a02958a-WjN87ypBKDzxYgeXoyejMPJC2e1kfO","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"Barangay Connect","url":"https://promised-moving-017.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
