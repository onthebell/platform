import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import MapContainer from '@/components/map/MapContainer';
import {
  CalendarIcon,
  MapPinIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserGroupIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Local Events',
    description: "Discover what's happening in your neighborhood",
    icon: CalendarIcon,
    href: '/events',
  },
  {
    name: 'Interactive Map',
    description: 'Find businesses, events, and community spots',
    icon: MapPinIcon,
    href: '/map',
  },
  {
    name: 'Marketplace',
    description: 'Buy, sell, or give away items locally',
    icon: ShoppingBagIcon,
    href: '/marketplace',
  },
  {
    name: 'Community Help',
    description: 'Ask for help or lend a hand to neighbors',
    icon: HeartIcon,
    href: '/community',
  },
  {
    name: 'Neighbor Connections',
    description: 'Meet and connect with people nearby',
    icon: UserGroupIcon,
    href: '/community',
  },
  {
    name: 'Local Deals',
    description: 'Exclusive offers from Bellarine businesses',
    icon: GiftIcon,
    href: '/deals',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 py-16 sm:py-20 lg:py-24 xl:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900">
              Welcome to <span className="text-blue-600">OnTheBell</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-6 sm:leading-8 text-gray-600 px-2 sm:px-0">
              Your Bellarine Peninsula community hub. Connect with neighbors, discover local events,
              find great deals, and build stronger community connections.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-6">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/signup">Join the Community</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="w-full sm:w-auto">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 sm:py-20 lg:py-24 xl:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Everything your community needs
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-6 sm:leading-8 text-gray-600 px-2 sm:px-0">
              From local events to neighborhood marketplace, OnTheBell brings the Bellarine
              Peninsula together.
            </p>
          </div>
          <div className="mx-auto mt-12 sm:mt-16 lg:mt-20 xl:mt-24 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-8 sm:gap-y-12 lg:gap-y-16 lg:max-w-none">
              {features.map(feature => (
                <div key={feature.name} className="flex flex-col p-4 sm:p-0">
                  <dt className="flex items-center gap-x-3 text-sm sm:text-base font-semibold leading-6 sm:leading-7 text-gray-900">
                    <feature.icon
                      className="h-5 w-5 sm:h-6 sm:w-6 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    <span className="truncate">{feature.name}</span>
                  </dt>
                  <dd className="mt-3 sm:mt-4 flex flex-auto flex-col text-sm sm:text-base leading-6 sm:leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-4 sm:mt-6">
                      <Link
                        href={feature.href}
                        className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center"
                      >
                        Explore{' '}
                        <span aria-hidden="true" className="ml-1">
                          →
                        </span>
                      </Link>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Map preview section */}
      <div className="bg-gray-50 py-16 sm:py-20 lg:py-24 xl:py-32">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Explore the Bellarine Peninsula
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-6 sm:leading-8 text-gray-600 px-2 sm:px-0">
              Discover local businesses, events, and community spots on our interactive map.
            </p>
          </div>
          <div className="mx-auto max-w-5xl">
            <MapContainer
              center={[-38.199105, 144.584079]}
              zoom={10}
              className="w-full h-64 sm:h-80 lg:h-96 rounded-lg shadow-lg"
            />
            <div className="mt-6 sm:mt-8 text-center">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/map">View Full Map</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-16 sm:py-20 lg:py-24 xl:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Ready to join your community?
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-6 sm:leading-8 text-blue-200 px-2 sm:px-0">
              Get verified as a Bellarine Peninsula resident to access exclusive community features.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-6">
              <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button
                variant="link"
                className="text-white hover:text-blue-200 w-full sm:w-auto"
                asChild
              >
                <Link href="/verification">
                  Learn about verification{' '}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
