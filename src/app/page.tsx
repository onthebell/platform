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

const sampleMarkers = [
  {
    id: '1',
    position: [-38.1499, 144.3617] as [number, number],
    title: 'Geelong Waterfront',
    description: 'Beautiful waterfront area',
    category: 'event',
  },
  {
    id: '2',
    position: [-38.1899, 144.4017] as [number, number],
    title: 'Queenscliff Markets',
    description: 'Weekly farmers market',
    category: 'marketplace',
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Welcome to <span className="text-blue-600">OnTheBell</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Your Bellarine Peninsula community hub. Connect with neighbors, discover local events,
              find great deals, and build stronger community connections.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/auth/signup">Join the Community</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything your community needs
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              From local events to neighborhood marketplace, OnTheBell brings the Bellarine
              Peninsula together.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map(feature => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <Link
                        href={feature.href}
                        className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-700"
                      >
                        Explore <span aria-hidden="true">→</span>
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
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Explore the Bellarine Peninsula
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Discover local businesses, events, and community spots on our interactive map.
            </p>
          </div>
          <div className="mx-auto max-w-5xl">
            <MapContainer
              center={[-38.1599, 144.3617]}
              zoom={10}
              className="w-full h-96 rounded-lg shadow-lg"
              markers={sampleMarkers}
            />
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/map">View Full Map</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to join your community?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-200">
              Get verified as a Bellarine Peninsula resident to access exclusive community features.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button variant="link" className="text-white hover:text-blue-200" asChild>
                <Link href="/verification">
                  Learn about verification <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
