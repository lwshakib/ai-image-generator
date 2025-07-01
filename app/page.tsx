import { LandingNavbar } from "@/components/landing-navbar";
import { PricingTable } from "@clerk/nextjs";

import { protocol } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import FooterNavLinks from "../components/FooterNavLinks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import data from "../data/data.json";

export default function Home() {
  // Smooth scroll handler with 200px offset

  return (
    <div className="w-full relative">
      <LandingNavbar />
      <section className="px-4 text-center flex flex-col items-center justify-center min-h-[60vh] z-50">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
          AI Art Generator
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          Unleash your creativity! Instantly generate stunning artwork using the
          power of artificial intelligence. Enter a prompt and watch your
          imagination come to life.
        </p>
        <div className="flex justify-between items-center gap-8">
          <a href={`${protocol}://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}>
            <button className="cursor-pointer px-6 py-2 rounded bg-white text-black font-semibold shadow hover:bg-gray-200 transition">
              Get Started
            </button>
          </a>
          <div className="flex justify-between gap-4 cursor-pointer">
            <p>Developer API</p> <ArrowRight />
          </div>
        </div>
      </section>
      <section
        id="features"
        className="py-16 px-4 bg-background flex flex-col items-center dark"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle>Instant Art Generation</CardTitle>
              <CardDescription>
                Generate beautiful artwork in seconds using advanced AI models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Simply enter your prompt and let the AI do the magic. No
                artistic skills required!
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>High-Resolution Output</CardTitle>
              <CardDescription>
                Download your creations in stunning high resolution, perfect for
                sharing or printing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Export your images in multiple formats and sizes to suit your
                needs.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Developer API</CardTitle>
              <CardDescription>
                Integrate AI art generation into your own apps with our
                easy-to-use API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Access powerful endpoints and extensive documentation for
                seamless integration.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="">
        <div className="masonry-gallery columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4 w-full max-w-6xl mx-auto px-10">
          {data.slice(0, 12).map((item, index) => (
            <div key={index} className="mb-4 break-inside-avoid">
              <img
                src={item.imageUrl}
                alt={item.altText}
                width={item.width}
                height={item.height}
                className="w-full rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto mt-20 px-10" id="pricing">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Unlock Premium features
        </h2>
        <PricingTable />
      </div>

      {/* Footer */}
      <footer className="w-full mt-24 py-8 px-4 bg-neutral-900 text-neutral-300 flex flex-col items-center border-t border-neutral-800">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-semibold text-lg text-white">
              AI Art Generator
            </span>
          </div>
          <FooterNavLinks />
        </div>
        <div className="mt-4 text-xs text-neutral-500 text-center w-full">
          &copy; {new Date().getFullYear()} AI Art Generator. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
