import Link from 'next/link';
import { BellIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <BellIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">OnTheBell</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              Connecting the Bellarine Peninsula community. Find local deals, events, marketplace
              items, and connect with your neighbors.
            </p>
            <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span>for the Bellarine Peninsula</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  About OnTheBell
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/verification"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Address Verification
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Support Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Community
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/community-guidelines"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} OnTheBell. Open source community platform.
            </p>
            <div className="flex items-center">
              <Link
                href="https://github.com/onthebell/platform"
                className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm transition-colors"
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
