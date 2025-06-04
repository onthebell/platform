import { Metadata } from 'next';
import {
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Contact Us | OnTheBell',
  description: 'Get in touch with the OnTheBell team for support, feedback, or inquiries',
};

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact OnTheBell</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help! Whether you have questions, feedback, or need support, we'd love to
            hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Send us a message</h2>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="verification">Address Verification</option>
                  <option value="business">Business Listing</option>
                  <option value="community">Community Guidelines</option>
                  <option value="marketplace">Marketplace Support</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  placeholder="Please provide as much detail as possible..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                  Subscribe to OnTheBell updates and community news
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
              >
                Send Message
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> We typically respond within 24-48 hours during business days.
                For urgent technical issues, please include your account email and a detailed
                description.
              </p>
            </div>
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@onthebell.com.au</p>
                    <p className="text-sm text-gray-500 mt-1">For general inquiries and support</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Service Area</h3>
                    <p className="text-gray-600">Bellarine Peninsula, Victoria</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Serving communities from Queenscliff to Leopold
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Response Time</h3>
                    <p className="text-gray-600">24-48 hours</p>
                    <p className="text-sm text-gray-500 mt-1">Monday to Friday, business hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center mb-6">
                <QuestionMarkCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Quick Help</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Before contacting us:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      • Check our{' '}
                      <a href="/how-it-works" className="text-blue-600 hover:text-blue-800">
                        How it Works
                      </a>{' '}
                      guide
                    </li>
                    <li>
                      • Review our{' '}
                      <a href="/community-guidelines" className="text-blue-600 hover:text-blue-800">
                        Community Guidelines
                      </a>
                    </li>
                    <li>
                      • Visit the{' '}
                      <a href="/verification" className="text-blue-600 hover:text-blue-800">
                        Verification
                      </a>{' '}
                      page for address issues
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Common Topics:</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <span className="bg-gray-100 px-3 py-2 rounded">Account Verification</span>
                    <span className="bg-gray-100 px-3 py-2 rounded">Business Listings</span>
                    <span className="bg-gray-100 px-3 py-2 rounded">Marketplace Issues</span>
                    <span className="bg-gray-100 px-3 py-2 rounded">Community Reporting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Emergency Notice</h3>
                  <p className="text-sm text-red-700 mt-1">
                    OnTheBell is not an emergency service. For emergencies, please contact:
                  </p>
                  <ul className="text-sm text-red-700 mt-2">
                    <li>
                      • Emergency Services: <strong>000</strong>
                    </li>
                    <li>
                      • Police Non-Emergency: <strong>131 444</strong>
                    </li>
                    <li>
                      • City of Greater Geelong: <strong>(03) 5272 5272</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Community Driven</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              OnTheBell is built by and for the Bellarine Peninsula community. Your feedback helps
              us improve the platform and better serve our local area. We appreciate your patience
              as we continue to grow and enhance the platform together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
