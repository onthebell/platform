import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
  };

  const handleLinkClick = (href: string) => {
    router.push(href);
  };

  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          data-testid="footer-grid"
        >
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <BellIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-white">OnTheBell</span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 leading-relaxed">
              Connecting the Bellarine Peninsula community. Find local deals, events, marketplace
              items, and connect with your neighbors.
            </p>
            <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400">
              <span>Made with</span>
              <HeartIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span>for the Bellarine Peninsula</span>
            </div>
          </div>

          {/* Community */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Community
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/community')}
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Browse Posts
                </button>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Local Events
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=free"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Free Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Features
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/verification"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Address Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Business Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Local Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Company
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/about')}
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  About Us
                </button>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-white transition-colors block py-1"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter and Social */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Stay Updated</h3>
              <p className="text-gray-300 text-sm mb-4">
                Get the latest community updates and local news delivered to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Follow Us</h3>
              <p className="text-gray-300 text-sm mb-4">
                Stay connected with the OnTheBell community on social media.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Support
            </h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/community-guidelines"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-gray-300 hover:text-white transition-colors">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-300 hover:text-white transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} OnTheBell. All rights reserved.
            </p>
            <div className="flex items-center">
              <Link
                href="https://github.com/onthebell/platform"
                className="text-gray-300 hover:text-white text-xs sm:text-sm transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
