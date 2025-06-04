// How It Works page for OnTheBell community platform
import { Metadata } from 'next';
import Link from 'next/link';
import {
  UserPlusIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { bellarinePostcodes } from '../../lib/utils';

export const metadata: Metadata = {
  title: 'How It Works - OnTheBell',
  description:
    'Learn how to get started with OnTheBell and make the most of our community platform',
};

const steps = [
  {
    id: 1,
    title: 'Sign Up',
    description: 'Create your free account with just your email address and basic information.',
    icon: UserPlusIcon,
  },
  {
    id: 2,
    title: 'Verify Your Address',
    description: 'Confirm you live on the Bellarine Peninsula to access community features.',
    icon: ShieldCheckIcon,
  },
  {
    id: 3,
    title: 'Complete Your Profile',
    description: 'Add a photo and tell your neighbors a bit about yourself.',
    icon: UserGroupIcon,
  },
  {
    id: 4,
    title: 'Start Connecting',
    description: 'Join discussions, find local businesses, and connect with your community.',
    icon: MapPinIcon,
  },
];

const features = [
  {
    title: 'Community Hub',
    description:
      'Connect with neighbors, ask for help, share recommendations, and build relationships.',
    icon: UserGroupIcon,
    color: 'text-blue-600',
  },
  {
    title: 'Local Business Directory',
    description:
      'Discover and support local businesses with reviews, hours, and contact information.',
    icon: BuildingStorefrontIcon,
    color: 'text-green-600',
  },
  {
    title: 'Events Calendar',
    description: 'Stay informed about community events, activities, and gatherings.',
    icon: CalendarIcon,
    color: 'text-purple-600',
  },
  {
    title: 'Interactive Map',
    description: 'Explore the Bellarine Peninsula with location-based content and services.',
    icon: MapPinIcon,
    color: 'text-red-600',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How OnTheBell Works</h1>
          <p className="text-xl text-blue-100">
            Get started with our community platform in just a few simple steps
          </p>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Getting Started</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(step => (
              <div key={step.id} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.id}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What You Can Do</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map(feature => (
              <div key={feature.title} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Address Verification Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Address Verification</h2>
            <p className="text-lg text-gray-700 mb-8">
              To ensure OnTheBell remains a trusted community space, we verify that users actually
              live on the Bellarine Peninsula. This helps maintain the quality and safety of our
              community discussions.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Why We Verify</h3>
                <p className="text-gray-600 text-sm">
                  Verification ensures our community features are used by actual residents, creating
                  a more trustworthy environment.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">What We Check</h3>
                <p className="text-gray-600 text-sm">
                  We verify addresses within Bellarine Peninsula postcodes (
                  {bellarinePostcodes.join(', ')}).
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Your Privacy</h3>
                <p className="text-gray-600 text-sm">
                  Your exact address is never shared publicly. We only confirm you're a local
                  resident.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is OnTheBell free to use?
              </h3>
              <p className="text-gray-700">
                Yes! OnTheBell is completely free for all residents of the Bellarine Peninsula.
                We're supported by voluntary donations from community members who value the
                platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I use OnTheBell if I don't live on the Bellarine Peninsula?
              </h3>
              <p className="text-gray-700">
                While you can browse public content, community features like posting and commenting
                are restricted to verified Bellarine Peninsula residents to maintain our local
                focus.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I report inappropriate content?
              </h3>
              <p className="text-gray-700">
                Each post and comment has a report button. Our community moderators review all
                reports promptly and take appropriate action to maintain a safe environment.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can businesses join OnTheBell?
              </h3>
              <p className="text-gray-700">
                Absolutely! Local businesses can create profiles, share updates, and connect with
                customers. Business profiles are clearly marked and follow our community guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
