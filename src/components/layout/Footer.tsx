import Link from 'next/link';
import { BellIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BellIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">OnTheBell</span>
            </div>
            <p className="text-gray-600 mb-4">
              Connecting the Bellarine Peninsula community. Find local deals, events, 
              marketplace items, and connect with your neighbors.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span>for the Bellarine Peninsula</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  About OnTheBell
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/verification" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Address Verification
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Support Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/community-guidelines" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} OnTheBell. Open source community platform.
            </p>
            <div className="mt-4 md:mt-0">
              <Link 
                href="https://github.com/onthebell/platform" 
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
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
