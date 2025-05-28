// Donate page for OnTheBell community platform
import { Metadata } from 'next';
import { HeartIcon, ShieldCheckIcon, UsersIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Support OnTheBell - Donate',
  description: 'Support the OnTheBell community platform with a voluntary donation',
};

const benefits = [
  {
    title: 'Keep OnTheBell Free',
    description:
      'Your donations help us maintain free access for all Bellarine Peninsula residents.',
    icon: HeartIcon,
  },
  {
    title: 'Improve Security',
    description: 'Fund enhanced security measures and address verification systems.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Community Features',
    description: 'Support development of new features requested by our community members.',
    icon: UsersIcon,
  },
  {
    title: 'Platform Maintenance',
    description:
      'Cover hosting costs and technical infrastructure to keep OnTheBell running smoothly.',
    icon: GlobeAltIcon,
  },
];

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HeartIcon className="h-16 w-16 mx-auto mb-6 text-pink-200" />
          <h1 className="text-4xl font-bold mb-4">Support OnTheBell</h1>
          <p className="text-xl text-blue-100 mb-8">
            Help us keep our community platform free and thriving for all Bellarine Peninsula
            residents
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg">
              OnTheBell is built by the community, for the community. Your voluntary donations help
              us maintain and improve this platform for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* How Donations Help */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How Your Donation Helps
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map(benefit => (
              <div key={benefit.title} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Make a Donation</h2>
            <p className="text-lg text-gray-700">
              Choose an amount that feels right for you. Every contribution, no matter the size,
              makes a difference in keeping OnTheBell available for our community.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">$5</div>
                <div className="text-gray-600">Coffee Fund</div>
                <div className="text-sm text-gray-500 mt-2">Keeps our developers caffeinated</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center border-2 border-blue-500">
                <div className="text-2xl font-bold text-blue-600 mb-2">$25</div>
                <div className="text-gray-600">Community Supporter</div>
                <div className="text-sm text-gray-500 mt-2">Most popular donation amount</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">$50</div>
                <div className="text-gray-600">Platform Champion</div>
                <div className="text-sm text-gray-500 mt-2">Helps fund new features</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">🚧 Donation System Coming Soon</h3>
                <p className="text-blue-800">
                  We're currently setting up our secure donation system. Check back soon, or contact
                  us if you'd like to support OnTheBell in the meantime.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-8 py-3 rounded-md cursor-not-allowed w-full max-w-sm"
                >
                  Donate with Card (Coming Soon)
                </button>
                <button
                  disabled
                  className="bg-gray-300 text-gray-500 px-8 py-3 rounded-md cursor-not-allowed w-full max-w-sm"
                >
                  PayPal Donation (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Transparency & Accountability
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Where Your Money Goes</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Server hosting and infrastructure costs</li>
                <li>• Security and verification services</li>
                <li>• Development and maintenance</li>
                <li>• Community moderation tools</li>
                <li>• Regular backups and data protection</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Commitment</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• OnTheBell will always be free for residents</li>
                <li>• No ads or data selling to third parties</li>
                <li>• Regular financial updates to the community</li>
                <li>• Open source where possible</li>
                <li>• Community-driven feature development</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Questions about donations or how funds are used?
              <a href="/contact" className="text-blue-600 hover:underline ml-1">
                Contact us
              </a>
              for more information.
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Ways to Help */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Other Ways to Support OnTheBell</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Spread the Word</h3>
              <p className="text-gray-600 text-sm">
                Tell your neighbors about OnTheBell and help grow our community.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Share Feedback</h3>
              <p className="text-gray-600 text-sm">
                Help us improve by sharing your ideas and reporting issues.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Be Active</h3>
              <p className="text-gray-600 text-sm">
                Engage positively with the community and help create a welcoming environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
