import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">L</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">Listing.Show</h1>
          </div>

          {/* Hero Text */}
          <p className="text-xl text-gray-600 mb-4 max-w-2xl">
            Create stunning, cinematic property pages in minutes
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-xl">
            Video-first showcases for real estate agents and teams
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="font-semibold mb-2">Video-First</h3>
              <p className="text-sm text-gray-600">
                Swipeable video chapters that tell your property's story
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Create professional pages in minutes, not hours
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Mobile-First</h3>
              <p className="text-sm text-gray-600">
                Optimized for sharing on Instagram and WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
